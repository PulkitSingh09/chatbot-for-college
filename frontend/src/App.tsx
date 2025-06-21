
import { useEffect, useState, useRef } from 'react';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import { Moon, Sun, Send, Download, LogIn, LogOut, User, ChevronDown, History, Trash2 } from 'lucide-react';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
interface User {
  email: string;
  name: string;
}
interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}
// Simple user database simulation
const userDatabase = new Map<string, { email: string; name: string; password: string }>();
function App() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'enabled');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {type: 'bot', content: '👋 Yo! Ask me anything about the college or anything else .', timestamp: Date.now()}
  ]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<'FAQ' | 'GPT'>('FAQ');
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${clientX}px`;
        cursorDotRef.current.style.top = `${clientY}px`;
      }
      if (cursorOutlineRef.current) {
        requestAnimationFrame(() => {
          if (cursorOutlineRef.current) {
            cursorOutlineRef.current.style.left = `${clientX - 13}px`;
            cursorOutlineRef.current.style.top = `${clientY - 13}px`;
          }
        });
      }
    };
    const growCursor = () => {
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.transform = 'scale(1.5)';
      }
    };
    const shrinkCursor = () => {
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.transform = 'scale(1)';
      }
    };
    document.addEventListener('mousemove', moveCursor);
    document.querySelectorAll('button, a, input, select').forEach(el => {
      el.addEventListener('mouseenter', growCursor);
      el.addEventListener('mouseleave', shrinkCursor);
    });
    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.querySelectorAll('button, a, input, select').forEach(el => {
        el.removeEventListener('mouseenter', growCursor);
        el.removeEventListener('mouseleave', shrinkCursor);
      });
    };
  }, []);
  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: '#vanta-bg',
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: darkMode ? 0x3b82f6 : 0x4f46e5,
          backgroundColor: darkMode ? 0x0f172a : 0xf1f5f9,
          points: 20.00,
          maxDistance: 30.00,
          spacing: 18.00,
          showDots: true
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [darkMode]);
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current && messages.length > 1) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);
  // Load user and chat history from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        loadChatHistory(userData.email);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);
  // Save chat history whenever messages change and user is logged in
  useEffect(() => {
    if (user && messages.length > 1) {
      saveChatHistory(user.email, messages);
    }
  }, [messages, user]);
  const saveChatHistory = (userEmail: string, chatMessages: Message[]) => {
    const chatKey = `chat_history_${userEmail}`;
    localStorage.setItem(chatKey, JSON.stringify(chatMessages));
  };
  const loadChatHistory = (userEmail: string) => {
    const chatKey = `chat_history_${userEmail}`;
    const savedChat = localStorage.getItem(chatKey);
    if (savedChat) {
      try {
        const chatHistory = JSON.parse(savedChat);
        setMessages(chatHistory);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };
  const clearChatHistory = () => {
    if (user) {
      const chatKey = `chat_history_${user.email}`;
      localStorage.removeItem(chatKey);
      setMessages([{type: 'bot', content: '👋 Hi! Ask me anything about the college.', timestamp: Date.now()}]);
      setShowAccountMenu(false);
    }
  };
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode ? 'enabled' : 'disabled');
    if (vantaEffect) vantaEffect.destroy();
    setVantaEffect(null);
  };
 const handleSend = async () => {
  if (!message.trim()) return;

  const newMessage: Message = {
    type: 'user',
    content: message,
    timestamp: Date.now()
  };
  setMessages(prev => [...prev, newMessage]);

  try {
    let botReply = '';
    const API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) {
      throw new Error('API URL is not defined. Please set VITE_API_URL in your environment variables.');
    }
    
    if (mode === 'FAQ') {
      setMessages(prev => [
    ...prev,
    {
      type: 'user',
      content: message,
      timestamp: Date.now(),
    },
    {
      type: 'bot',
      content: '💭 Thinking...',
      timestamp: Date.now(),
    },
    ]);
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(message)}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        botReply = data[0].answer;
      } else {
        botReply = '❌ No match found in FAQ. Try switching to GPT mode.';
      }
      setMessages(prev => [
      ...prev.slice(0, -1),
      {
      type: 'bot',
      content: botReply,
      timestamp: Date.now(),
      },
      ]);
      }
     else if (mode === 'GPT') {
      const thinkingMessage: Message = {
        type: 'bot',
        content: '💭 Thinking...',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, thinkingMessage]);
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          mode: 'gpt'
})
      });

      const data = await res.json();
      botReply = data.response || '⚠️ GPT did not return a valid response.';
    }
  setMessages(prev => [
    ...prev.slice(0, -1), // Remove the last message (the "Thinking..." one)
    {
      type: 'bot',
      content: botReply,
      timestamp: Date.now()
    }
  ]);
 }catch (error) {
    console.error('Error sending GPT message:', error);
    const errorMessage: Message = {
      type: 'bot',
      content: '⚠️ Error connecting to GPT backend.',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev.slice(0, -1), errorMessage]);
  }
}
 const exportChat = () => {
    const chatContent = messages
      .map(msg => {
        const date = new Date(msg.timestamp).toLocaleString();
        return `[${date}] ${msg.type === 'user' ? 'You' : 'Bot'}: ${msg.content}`;
      })
      .join('\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleAuth = (userData: User, password: string, isLogin: boolean) => {
    if (isLogin) {
      // Check if user exists and password matches
      const existingUser = userDatabase.get(userData.email);
      if (!existingUser) {
        throw new Error('User not found. Please sign up first.');
      }
      if (existingUser.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }
      // Login successful
      setUser({ email: existingUser.email, name: existingUser.name });
      localStorage.setItem('user', JSON.stringify({ email: existingUser.email, name: existingUser.name }));
      loadChatHistory(existingUser.email);
    } else {
      // Sign up - check if user already exists
      if (userDatabase.has(userData.email)) {
        throw new Error('User already exists. Please sign in instead.');
      }
      // Create new user
      userDatabase.set(userData.email, {
        email: userData.email,
        name: userData.name,
        password: password
      });
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      loadChatHistory(userData.email);
    }
    setShowAuthModal(false);
  };
  const handleLogout = () => {
    if (user) {
      // Save current chat before logout
      saveChatHistory(user.email, messages);
    }
    setUser(null);
    localStorage.removeItem('user');
    setMessages([{type: 'bot', content: '👋 Hi! Ask me anything about the college.', timestamp: Date.now()}]);
    setShowAccountMenu(false);
  };
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorOutlineRef} className="cursor-outline" />
      <div id="vanta-bg" className="fixed inset-0 -z-10" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-slate-800/90 dark:bg-black/50 backdrop-blur-md border-b border-slate-700/50 dark:border-gray-800/50 relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Smart College Chatbot</h1>
              
              <div className="flex items-center gap-4">
                <select 
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'FAQ' | 'GPT')}
                  className="px-8 py-3 text-lg rounded-xl bg-white/90 dark:bg-gray-800/80 text-gray-800 dark:text-white border-0 shadow-lg backdrop-blur-sm font-medium"
                >
                  <option value="FAQ">FAQ Mode</option>
                  <option value="GPT">GPT Mode</option>
                </select>
                
                {user ? (
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-600/50 transition-colors"
                    >
                      <User className="w-5 h-5 text-white" />
                      <span className="text-white text-sm font-medium">{user.name}</span>
                      <ChevronDown className="w-4 h-4 text-white" />
                    </button>
                    {showAccountMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 py-2 z-[9999]">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        
                        <div className="py-2">
                          <div className="px-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat History</span>
                              <History className="w-4 h-4 text-gray-500" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {messages.length} messages saved
                            </p>
                            {messages.length > 1 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Last activity: {formatDate(messages[messages.length - 1].timestamp)}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={clearChatHistory}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear Chat History
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                )}
                
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 backdrop-blur-sm"
                >
                  {darkMode ? <Sun className="w-6 h-6 text-gray-300" /> : <Moon className="w-6 h-6 text-gray-700" />}
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full relative z-10">
          <div className="bg-slate-800/80 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 dark:border-gray-700/30 h-[600px] flex flex-col">
            <div 
              ref={chatBoxRef}
              className={`flex-1 overflow-y-auto p-6 scroll-smooth ${messages.length <= 1 ? 'overflow-hidden' : ''}`}
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(99, 102, 241, 0.5) transparent'
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${msg.type === 'user' ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.type === 'user'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white/90 dark:bg-gray-700 text-gray-800 dark:text-white shadow-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${msg.type === 'user' ? 'text-right' : ''}`}>
                    {formatDate(msg.timestamp)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-700/50 dark:border-gray-700/30 p-4">
              <div className="flex gap-4">
                <button
                  onClick={exportChat}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 dark:bg-gray-700/80 text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-600/80 shadow-md backdrop-blur-sm transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
                
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/90 dark:bg-gray-700/80 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  
                  <button
                    onClick={handleSend}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
    </div>
  );
}
export default App;
