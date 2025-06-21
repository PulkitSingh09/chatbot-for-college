from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from rapidfuzz import fuzz
import datetime
import os
import requests
import sqlite3 # Keep this for legacy / direct db operations if needed elsewhere, but not for SQLAlchemy core functions
# Load environment variables from .env file
load_dotenv()
app = FastAPI()
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chatbot-for-college.vercel.app"],  # Adjust if your frontend is on a different origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#  DATABASE SETUP 
DATABASE_URL = "sqlite:///./faq.db" 
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# ==== MODELS ====
class FAQ(Base):
    __tablename__ = "faqs"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    user_input = Column(String, nullable=False)
    bot_response = Column(String, nullable=False)
    # Use String for ISO format, or DateTime if you handle conversion
    timestamp = Column(String, default=lambda: datetime.datetime.now().isoformat())
# Create tables
Base.metadata.create_all(bind=engine)
# ==== SCHEMAS ====
class FAQItem(BaseModel):
    question: str
    answer: str
class ChatRequest(BaseModel):
    message: str
    mode: str #= "faq" ..... Ensure mode is part of the request
# ==== DEPENDENCY ====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ==== OPENROUTER API KEY ====
# Get API key from environment variable
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# Check if API key is loaded (for debugging)
if not OPENROUTER_API_KEY:
    print(" WARNING: OPENROUTER_API_KEY environment variable is not set!")
else:
    print(" OPENROUTER_API_KEY loaded successfully.")
# ==== OPENROUTER API FUNCTION ====
def query_openrouter(prompt: str):
    if not OPENROUTER_API_KEY:
        return " OpenRouter API key not set in environment variables."
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    # Using deepseek-ai/deepseek-chat as per your previous intention
    # and including a system message for better AI behavior
    payload = {
        "model": "meta-llama/llama-3.3-8b-instruct:free", # Or any other free model you verified on OpenRouter
        "messages": [
            {"role": "system", "content": "You are a helpful assistant for answering college-related queries. Be concise and accurate."},
            {"role": "user", "content": prompt}
        ],
        "stream": False # Set to True if your client handles streaming
    }
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions",
                                 headers=headers, json=payload, timeout=30) # Added timeout
        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
        result = response.json()
        if "choices" in result and result["choices"]:
            return result["choices"][0]["message"]["content"].strip()
        else:
            return f" OpenRouter error: No choices in response. Raw: {result}"
    except requests.exceptions.RequestException as e:
        return f" OpenRouter API request failed: {str(e)}"
    except Exception as e:
        return f" An unexpected error occurred during GPT query: {str(e)}"
# ==== ROUTES ====
@app.post("/add_faq")
def add_faq(entry: FAQItem, db: Session = Depends(get_db)):
    faq = FAQ(question=entry.question, answer=entry.answer)
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return {"message": "FAQ added successfully", "id": faq.id}
@app.post("/bulk_add_faq")
def bulk_add_faq(faqs: List[FAQItem], db: Session = Depends(get_db)):
    db_faqs = [FAQ(question=faq.question, answer=faq.answer) for faq in faqs]
    db.add_all(db_faqs)
    db.commit()
    return {"message": f"{len(faqs)} FAQs added successfully."}
@app.get("/get_all_faq")
def get_all_faq(db: Session = Depends(get_db)):
    return db.query(FAQ).all()
@app.get("/search")
def search_faq(q: str = Query(..., description="Search query"), db: Session = Depends(get_db)):
    # Corrected to use SQLAlchemy for consistency
    faqs = db.query(FAQ).filter(FAQ.question.ilike(f"%{q}%")).all()
    return [{"question": f.question, "answer": f.answer} for f in faqs]
@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    history = db.query(ChatHistory).order_by(ChatHistory.timestamp.desc()).all()
    return [
        {
            "user_input": h.user_input,
            "bot_response": h.bot_response,
            "timestamp": h.timestamp
        } for h in history
    ]
@app.post("/chat")
def chat(data: ChatRequest, db: Session = Depends(lambda: SessionLocal())):
    user_input = data.message.lower().strip()
    mode = data.mode.lower()
    # 🎯 FAQ Mode
    if mode == "faq":
        faqs = db.query(FAQ).all()
        best_match = None
        best_score = 0
        for faq in faqs:
            score = fuzz.partial_ratio(user_input, faq.question.lower())
            if score > best_score:
                best_match = faq
                best_score = score
        if best_score >= 40:
            return {"response": best_match.answer}
        else:
            return {"response": " No match found. Try switching to GPT mode."}
    # 🤖 GPT Mode
    elif mode == "gpt":
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return {"response": " OpenRouter API key not set"}
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-8b-instruct:free")
        gpt_payload = {
            "model": "meta-llama/llama-3.3-8b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant for answering college-related queries."},
                {"role": "user", "content": user_input}
            ]
        }
        print("Sending GPT payload:", gpt_payload)
        print("Headers:", headers)
        try:
            gpt_response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=gpt_payload)
            print("GPT raw response:", gpt_response.text)
            gpt_response.raise_for_status()
            gpt_result = gpt_response.json()
            print("GPT Response JSON:", gpt_result)  # DEBUG LOG
            if "choices" not in gpt_result or not gpt_result["choices"]:
                return {"response": f"⚠️ OpenRouter error: {gpt_result}"}
            reply = gpt_result["choices"][0]["message"]["content"].strip()

        except requests.exceptions.RequestException as e:
            return {"response": f" Request error: {str(e)}"}
        except Exception as e:
            return {"response": f" Unexpected error: {str(e)}"}

        # Save history (optional)
        history = ChatHistory(user_input=data.message, bot_response=reply)
        db.add(history)
        db.commit()
        return {"response": reply}
