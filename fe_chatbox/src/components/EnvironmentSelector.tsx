import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

type Environment = 'testing-mock' | 'testing-real' | 'production-real';

export default function EnvironmentSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [environment, setEnvironment] = useState<Environment>('testing-mock');

  useEffect(() => {
    const savedEnv = localStorage.getItem('chat_environment') as Environment;
    if (savedEnv) {
      setEnvironment(savedEnv);
    }
  }, []);

  const handleEnvironmentChange = (env: Environment) => {
    setEnvironment(env);
    localStorage.setItem('chat_environment', env);
    setIsOpen(false);
  };

  const handleNavigateToAdmin = () => {
    window.location.href = 'http://localhost:5002';
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={handleNavigateToAdmin}
        className="fixed top-6 right-6 z-50 w-10 h-10 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Admin settings"
        title="Open Admin Panel"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Environment Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="fixed top-20 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Environment Settings</h3>
            
            <div className="space-y-2">
              {/* Testing Mock */}
              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="environment"
                  value="testing-mock"
                  checked={environment === 'testing-mock'}
                  onChange={() => handleEnvironmentChange('testing-mock')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">Testing (Mock)</div>
                  <div className="text-sm text-gray-600">
                    Mock email & auto-reply. No real API calls.
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Perfect for UI testing
                  </div>
                </div>
              </label>

              {/* Testing Real */}
              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="environment"
                  value="testing-real"
                  checked={environment === 'testing-real'}
                  onChange={() => handleEnvironmentChange('testing-real')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">Testing (Real)</div>
                  <div className="text-sm text-gray-600">
                    Real SMTP & database with console.log debugging.
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    ✓ Full functionality testing
                  </div>
                </div>
              </label>

              {/* Production Real */}
              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="environment"
                  value="production-real"
                  checked={environment === 'production-real'}
                  onChange={() => handleEnvironmentChange('production-real')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">Production (Real)</div>
                  <div className="text-sm text-gray-600">
                    Real SMTP & database without console logs.
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    ✓ Live production mode
                  </div>
                </div>
              </label>
            </div>

            {/* Current Status */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-600">Current mode:</div>
              <div className="font-semibold text-gray-800 capitalize">
                {environment.replace('-', ' ')}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
