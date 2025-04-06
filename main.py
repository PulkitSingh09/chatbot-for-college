from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Initialize FastAPI app
app = FastAPI()

# Database setup using SQLite
DATABASE_URL = "sqlite:///./college_chatbot.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class FAQ(Base):
    __tablename__ = 'faqs'
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(String)

Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FAQCreate(BaseModel):
    question: str
    answer: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the College Chatbot API with Database!"}

@app.get("/faq", response_model=List[FAQCreate])
def get_faqs(db: Session = Depends(get_db)):
    return db.query(FAQ).all()

@app.post("/add_faq")
def add_faq(faq: FAQCreate, db: Session = Depends(get_db)):
    new_faq = FAQ(**faq.dict())
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return {"message": "FAQ added successfully!"}

@app.get("/search", response_model=List[FAQCreate])
def search_faqs(q: str, db: Session = Depends(get_db)):
    results = db.query(FAQ).filter(FAQ.question.contains(q) | FAQ.answer.contains(q)).all()
    if not results:
        raise HTTPException(status_code=404, detail="No matching FAQs found.")
    return results

# Fixed import issues, added Pydantic models for API validation, and refined database integration.
# Run with: uvicorn main:app --reload
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Initialize FastAPI app
app = FastAPI()

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup using SQLite
DATABASE_URL = "sqlite:///./college_chatbot.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class FAQ(Base):
    __tablename__ = 'faqs'
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(String)

Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FAQCreate(BaseModel):
    question: str
    answer: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the College Chatbot API with Database!"}

@app.get("/faq", response_model=List[FAQCreate])
def get_faqs(db: Session = Depends(get_db)):
    return db.query(FAQ).all()

@app.post("/add_faq")
def add_faq(faq: FAQCreate, db: Session = Depends(get_db)):
    new_faq = FAQ(**faq.dict())
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return {"message": "FAQ added successfully!"}

@app.get("/search", response_model=List[FAQCreate])
def search_faqs(q: str, db: Session = Depends(get_db)):
    results = db.query(FAQ).filter(FAQ.question.contains(q) | FAQ.answer.contains(q)).all()
    if not results:
        raise HTTPException(status_code=404, detail="No matching FAQs found.")
    return results

# Added CORS middleware to allow frontend (React) integration.
# Run with: uvicorn main:app --reload
