import { Heart, Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';
import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="bg-slate-800/90 dark:bg-black/50 backdrop-blur-md border-t border-slate-700/50 dark:border-gray-800/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">About</h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                Smart College Chatbot is an AI-powered assistant designed to help students 
                and faculty with college-related queries. Get instant answers about courses, 
                admissions, campus facilities, and more.
              </p>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Contact</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center text-gray-300 text-xs md:text-sm">
                  <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-indigo-400 flex-shrink-0" />
                  <span className="break-all">pulkitsingh0901@gmail.com</span>
                </div>
                <div className="flex items-center text-gray-300 text-xs md:text-sm">
                  <Phone className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-indigo-400 flex-shrink-0" />
                  <span>+919336324338</span>
                </div>
                <div className="flex items-center text-gray-300 text-xs md:text-sm">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-indigo-400 flex-shrink-0" />
                  <span>SRM Chennai</span>
                </div>
                <div className="flex items-center text-gray-300 text-xs md:text-sm">
                  <Linkedin className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-indigo-400 flex-shrink-0" />
                  <span>
                    <a 
                      href="https://www.linkedin.com/in/pulkit-singh-999796238/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline break-all"
                      aria-label="Visit Pulkit Singh's LinkedIn profile"
                    >
                      Pulkit Singh
                    </a>
                  </span>
                </div>
                <div className="flex items-center text-gray-300 text-xs md:text-sm"> 
                  <Github className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-indigo-400 flex-shrink-0" />
                  <span>
                    <a 
                      href="https://github.com/PulkitSingh09"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                      aria-label="Visit Pulkit Singh's GitHub profile"
                    >
                      PulkitSingh09
                    </a>
                  </span> 
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => openModal('help')}
                  className="block text-gray-300 hover:text-indigo-400 text-xs md:text-sm transition-colors text-left"
                >
                  Help Center
                </button>
                <button 
                  onClick={() => openModal('docs')}
                  className="block text-gray-300 hover:text-indigo-400 text-xs md:text-sm transition-colors text-left"
                >
                  Documentation
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 dark:border-gray-800/50 mt-6 md:mt-8 pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
                © 2024 Smart College Chatbot. All Rights Reserved.
              </p>
              <p className="text-gray-400 text-xs md:text-sm flex items-center">
                Made by Pulkit Singh <Heart className="w-3 h-3 md:w-4 md:h-4 mx-1 text-red-500" /> for education.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Help Center Modal */}
      <Modal isOpen={activeModal === 'help'} onClose={closeModal} title="Help Center">
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-semibold">Getting Started</h3>
          <p>Welcome to Smart College Chatbot! Simply type your question in the chat box and our AI will provide helpful answers about college-related topics.</p>
          
          <h3 className="text-base md:text-lg font-semibold">FAQ Mode vs GPT Mode</h3>
          <p><strong>FAQ Mode:</strong> Provides quick answers to common college questions from our knowledge base.</p>
          <p><strong>GPT Mode:</strong> Uses advanced AI to provide detailed, conversational responses to complex queries.</p>
          
          <h3 className="text-base md:text-lg font-semibold">Account Features</h3>
          <p>Create an account to save your chat history, export conversations, and access personalized recommendations.</p>
          
          <h3 className="text-base md:text-lg font-semibold">Mobile Features</h3>
          <p>On mobile devices, use the menu button to access all features including mode switching, chat export, and account management.</p>
          
          <h3 className="text-base md:text-lg font-semibold">Common Issues</h3>
          <p><strong>Chatbot not responding:</strong> Try refreshing the page or switching between FAQ and GPT modes.</p>
          <p><strong>Login problems:</strong> Ensure you're using the correct email and password.</p>
          
          <h3 className="text-base md:text-lg font-semibold">Contact Support</h3>
          <p>Still need help? Please don't call 🙃</p>
        </div>
      </Modal>

      {/* Documentation Modal */}
      <Modal isOpen={activeModal === 'docs'} onClose={closeModal} title="Documentation">
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-semibold">Features</h3>
          <p>Smart College Chatbot offers comprehensive assistance for college-related queries with two AI modes and cross-platform compatibility.</p>
          
          <h3 className="text-base md:text-lg font-semibold">What You Can Ask</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Course information and schedules</li>
            <li>Admission requirements and deadlines</li>
            <li>Campus facilities and services</li>
            <li>Student life and activities</li>
            <li>Financial aid and scholarships</li>
            <li>Multilingual responses in GPT Mode</li>
          </ul>
          
          <h3 className="text-base md:text-lg font-semibold">Mobile Optimization</h3>
          <p>The app is fully optimized for mobile devices with:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Responsive design for all screen sizes</li>
            <li>Touch-friendly interface</li>
            <li>Optimized performance (no heavy animations)</li>
            <li>Quick action buttons for common questions</li>
            <li>Slide-out menu for easy navigation</li>
          </ul>
          
          <h3 className="text-base md:text-lg font-semibold">Best Practices</h3>
          <p>Tips for getting the most accurate and helpful responses:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Be specific in your questions</li>
            <li>Use clear, simple language</li>
            <li>Try FAQ mode first for quick answers</li>
            <li>Switch to GPT mode for detailed explanations</li>
          </ul>
        </div>
      </Modal>
    </>
  );
}