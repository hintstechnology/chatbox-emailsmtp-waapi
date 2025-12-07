import React, { useState, useEffect } from 'react';
import App from './App';
import AdminPage from './admin/page';

export default function Router() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Simple navigation helper
  (window as any).navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  if (route === '/admin' || route === '/admin/') {
    return <AdminPage />;
  }

  return <App />;
}
