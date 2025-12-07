import { useState, useEffect } from 'react';
import FloatingButtons from '../components/FloatingButtons';
import ChatDialog from '../components/ChatDialog';
import EnvironmentSelector from '../components/EnvironmentSelector';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function ChatboxPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatStatus, setChatStatus] = useState<'idle' | 'active' | 'finished'>('idle');

  // Check for dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Restore chat open state
  useEffect(() => {
    const savedChatOpen = sessionStorage.getItem('chat_open');
    if (savedChatOpen === 'true') {
      setIsChatOpen(true);
    }
  }, []);

  // Save chat open state
  useEffect(() => {
    sessionStorage.setItem('chat_open', isChatOpen ? 'true' : 'false');
  }, [isChatOpen]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleNewMessage = () => {
    if (!isChatOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleChatOpen = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      setIsChatOpen(true);
      setUnreadCount(0);
    }
  };

  const handleChatStatusChange = (status: 'idle' | 'active' | 'finished') => {
    setChatStatus(status);
  };

  const handleNavigateHome = () => {
    window.location.href = '/';
  };

  const handleNavigateAdmin = () => {
    window.location.href = 'http://localhost:5002';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Environment Selector */}
      <EnvironmentSelector />

      {/* Navigation Buttons */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <Button
          onClick={handleNavigateHome}
          variant="outline"
          size="icon"
          className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </Button>
        <Button
          onClick={handleNavigateAdmin}
          variant="outline"
          size="icon"
          className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Admin Panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Overlay to close chat when clicking outside */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Chat with Us
          </h1>
          <p className="text-lg sm:text-2xl text-gray-700 dark:text-gray-300 mb-8">
            We're here to help you succeed. Get in touch with our team today.
          </p>
          <button 
            onClick={handleChatOpen}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Start Chat
          </button>
        </div>
      </section>

      {/* Floating Buttons */}
      <FloatingButtons 
        onWhatsAppClick={handleChatOpen} 
        isChatOpen={isChatOpen}
        unreadCount={unreadCount}
        chatStatus={chatStatus}
      />

      {/* Chat Dialog */}
      <ChatDialog 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        onNewMessage={handleNewMessage}
        onStatusChange={handleChatStatusChange}
      />
    </div>
  );
}

