import { useEffect, useState, useRef } from 'react';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import { Moon, Sun, Send, Download, LogIn, LogOut, User, ChevronDown, History, Trash2, Menu, X, MessageSquare, Settings, Zap } from 'lucide-react';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import MobileMenu from './components/MobileMenu';
import TypingIndicator from './components/TypingIndicator';
import MessageBubble from './components/MessageBubble';
import QuickActions from './components/QuickActions';

interface User {
  email: string;
  name: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  isTyping?: boolean;
}

// Simple user database simulation
const userDatabase = new Map<string, { email: string; name: string; password: string }>();

function App() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'enabled');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {type: 'bot', content: '👋 Welcome! I\'m your Smart College Assistant. Ask me anything about college life, academics, or campus facilities!', timestamp: Date.now()}
  ]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<'FAQ' | 'GPT'>('FAQ');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom cursor for desktop only
  useEffect(() => {
    if (isMobile) return;
    
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
  }, [isMobile]);

  // Close menus when clicking outside
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

  // Vanta background effect (disabled on mobile for performance)
  useEffect(() => {
    if (isMobile) return;
    
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
  }, [darkMode, isMobile]);

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
      setMessages([{type: 'bot', content: '👋 Welcome! I\'m your Smart College Assistant. Ask me anything about college life, academics, or campus facilities!', timestamp: Date.now()}]);
      setShowAccountMenu(false);
      setShowMobileMenu(false);
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
    setMessage('');
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: Message = {
      type: 'bot',
      content: '',
      timestamp: Date.now(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      let botReply = '';
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        throw new Error('API URL is not defined. Please set VITE_API_URL in your environment variables.');
      }
      
      if (mode === 'FAQ') {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(message)}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          botReply = data[0].answer;
        } else {
          botReply = '❌ No match found in FAQ. Try switching to GPT mode for more comprehensive answers.';
        }
      } else if (mode === 'GPT') {
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

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessages(prev => [
        ...prev.slice(0, -1), // Remove typing indicator
        {
          type: 'bot',
          content: botReply,
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        type: 'bot',
        content: '⚠️ Error connecting to the server. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const exportChat = () => {
    const chatContent = messages
      .filter(msg => !msg.isTyping)
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
      const existingUser = userDatabase.get(userData.email);
      if (!existingUser) {
        throw new Error('User not found. Please sign up first.');
      }
      if (existingUser.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }
      setUser({ email: existingUser.email, name: existingUser.name });
      localStorage.setItem('user', JSON.stringify({ email: existingUser.email, name: existingUser.name }));
      loadChatHistory(existingUser.email);
    } else {
      if (userDatabase.has(userData.email)) {
        throw new Error('User already exists. Please sign in instead.');
      }
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
      saveChatHistory(user.email, messages);
    }
    setUser(null);
    localStorage.removeItem('user');
    setMessages([{type: 'bot', content: '👋 Welcome! I\'m your Smart College Assistant. Ask me anything about college life, academics, or campus facilities!', timestamp: Date.now()}]);
    setShowAccountMenu(false);
    setShowMobileMenu(false);
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
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''} ${isMobile ? '' : 'cursor-none'}`}>
      {!isMobile && (
        <>
          <div ref={cursorDotRef} className="cursor-dot" />
          <div ref={cursorOutlineRef} className="cursor-outline" />
        </>
      )}
      
      {!isMobile && <div id="vanta-bg" className="fixed inset-0 -z-10" />}
      {isMobile && (
        <div className={`fixed inset-0 -z-10 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`} />
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-slate-800/90 dark:bg-black/50 backdrop-blur-md border-b border-slate-700/50 dark:border-gray-800/50 relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => setShowMobileMenu(true)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors md:hidden"
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                  <h1 className="text-lg md:text-2xl font-bold text-white">
                    {isMobile ? 'College Bot' : 'Smart College Chatbot'}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                {!isMobile && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <select 
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'FAQ' | 'GPT')}
                      className="px-6 py-2 text-sm md:text-lg rounded-xl bg-white/90 dark:bg-gray-800/80 text-gray-800 dark:text-white border-0 shadow-lg backdrop-blur-sm font-medium"
                    >
                      <option value="FAQ">FAQ Mode</option>
                      <option value="GPT">GPT Mode</option>
                    </select>
                  </div>
                )}
                
                {user ? (
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-xl bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-600/50 transition-colors"
                    >
                      <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      <span className="text-white text-xs md:text-sm font-medium hidden sm:inline">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </button>
                    {showAccountMenu && !isMobile && (
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
                              {messages.filter(m => !m.isTyping).length} messages saved
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
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg transition-colors text-xs md:text-sm"
                  >
                    <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}
                
                <button
                  onClick={toggleDarkMode}
                  className="p-2 md:p-2.5 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 backdrop-blur-sm"
                >
                  {darkMode ? <Sun className="w-5 h-5 md:w-6 md:h-6 text-gray-300" /> : <Moon className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto px-2 md:px-4 py-4 md:py-8 w-full relative z-10">
          <div className="bg-slate-800/80 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 dark:border-gray-700/30 h-[calc(100vh-200px)] md:h-[600px] flex flex-col">
            <div 
              ref={chatBoxRef}
              className={`flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth ${messages.length <= 1 ? 'overflow-hidden' : ''}`}
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(99, 102, 241, 0.5) transparent'
              }}
            >
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={idx} 
                  message={msg} 
                  formatDate={formatDate}
                  isMobile={isMobile}
                />
              ))}
            </div>
            
            {/* Quick Actions for mobile */}
            {isMobile && messages.length <= 1 && (
              <QuickActions onQuickAction={handleQuickAction} />
            )}
            
            <div className="border-t border-slate-700/50 dark:border-gray-700/30 p-3 md:p-4">
              <div className="flex gap-2 md:gap-4">
                {!isMobile && (
                  <button
                    onClick={exportChat}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-white/90 dark:bg-gray-700/80 text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-600/80 shadow-md backdrop-blur-sm transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline">Export</span>
                  </button>
                )}
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(); 
                  }}
                  className="flex-1 flex gap-2"
                >
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isMobile ? "Ask me anything..." : "Type your message..."}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-white/90 dark:bg-gray-700/80 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                    disabled={isTyping}
                  />
                  
                  <button
                    type="submit"
                    disabled={isTyping || !message.trim()}
                    className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium shadow-lg transition-colors flex items-center gap-1 md:gap-2 text-sm disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        user={user}
        mode={mode}
        setMode={setMode}
        onAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onClearHistory={clearChatHistory}
        onExportChat={exportChat}
        messages={messages}
        formatDate={formatDate}
      />

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