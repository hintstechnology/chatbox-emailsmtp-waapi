import { useState, useEffect } from 'react';
import FloatingButtons from './components/FloatingButtons';
import ChatDialog from './components/ChatDialog';
import EnvironmentSelector from './components/EnvironmentSelector';
import AdminPage from './admin/page';
import ChatboxPage from './pages/ChatboxPage';

export default function App() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [route, setRoute] = useState(window.location.pathname);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatStatus, setChatStatus] = useState<'idle' | 'active' | 'finished'>('idle');

  // Simple router
  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Simple navigation helper
  useEffect(() => {
    (window as any).navigateTo = (path: string) => {
      window.history.pushState({}, '', path);
      setRoute(path);
    };
  }, []);

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

  // Route handling - normalize route
  const normalizedRoute = route.replace(/\/$/, '') || '/';

  // Conditional returns AFTER all hooks
  if (normalizedRoute === '/admin') {
    return <AdminPage />;
  }

  if (normalizedRoute === '/chatbox') {
    return <ChatboxPage />;
  }

  // Main landing page handlers
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

  const handleNavigateToChatbox = () => {
    (window as any).navigateTo('/chatbox');
  };

  const handleNavigateToAdmin = () => {
    (window as any).navigateTo('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Environment Selector */}
      <EnvironmentSelector />

      {/* Navigation Buttons */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <button
          onClick={handleNavigateToChatbox}
          className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Chatbox"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button
          onClick={handleNavigateToAdmin}
          className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Admin Panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
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
            Welcome to Our Business
          </h1>
          <p className="text-lg sm:text-2xl text-gray-700 dark:text-gray-300 mb-8">
            We're here to help you succeed. Get in touch with our team today.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleChatOpen}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Contact Us Now
            </button>
            <button 
              onClick={handleNavigateToChatbox}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Go to Chatbox
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl text-center mb-12 text-gray-800 dark:text-gray-100">Our Services</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl mb-3 text-gray-800 dark:text-gray-100">Fast Service</h3>
              <p className="text-gray-600 dark:text-gray-400">Quick response times and efficient solutions for your business needs.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl mb-3 text-gray-800 dark:text-gray-100">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-400">Your data is safe with our industry-leading security measures.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl mb-3 text-gray-800 dark:text-gray-100">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-400">Our team is always ready to assist you anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl mb-8 text-gray-800 dark:text-gray-100">Why Choose Us?</h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            With years of experience and a dedicated team of professionals, we provide top-notch solutions 
            tailored to your specific needs. Our commitment to excellence and customer satisfaction sets us apart.
          </p>
          <button 
            onClick={handleChatOpen}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            Chat with Us Now
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
