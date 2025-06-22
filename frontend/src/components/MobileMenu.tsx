import { X, User, LogIn, LogOut, History, Trash2, Download, Settings, Zap, MessageSquare } from 'lucide-react';

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

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  mode: 'FAQ' | 'GPT';
  setMode: (mode: 'FAQ' | 'GPT') => void;
  onAuth: () => void;
  onLogout: () => void;
  onClearHistory: () => void;
  onExportChat: () => void;
  messages: Message[];
  formatDate: (timestamp: number) => string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  user,
  mode,
  setMode,
  onAuth,
  onLogout,
  onClearHistory,
  onExportChat,
  messages,
  formatDate
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] md:hidden">
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* User Section */}
            {user ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Chat History</span>
                    <History className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {messages.filter(m => !m.isTyping).length} messages saved
                  </p>
                  {messages.length > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last: {formatDate(messages[messages.length - 1].timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onAuth();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Sign In</span>
              </button>
            )}

            {/* Mode Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">AI Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('FAQ')}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    mode === 'FAQ'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  FAQ Mode
                </button>
                <button
                  onClick={() => setMode('GPT')}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    mode === 'GPT'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  GPT Mode
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                {mode === 'FAQ' 
                  ? 'Quick answers from our knowledge base'
                  : 'Advanced AI for detailed conversations'
                }
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Actions
              </h3>
              
              <button
                onClick={() => {
                  onExportChat();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Chat</span>
              </button>

              {user && (
                <button
                  onClick={() => {
                    onClearHistory();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}