import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorkerAndSync, offlineCapableFetch } from './client/utils/sync';

// Register Service Worker
registerServiceWorkerAndSync();

// Override global fetch to enable offline sync interception
const originalFetch = window.fetch;
window.fetch = function() {
  // Check if first arg is a Request object or string, and second arg is RequestInit
  const url = arguments[0];
  const options = arguments[1] || {};
  
  const method = (options.method || 'GET').toUpperCase();
  // Don't intercept GET requests (they are handled by SW) or non-API calls
  if (method === 'GET' || (typeof url === 'string' && !url.startsWith('/api/'))) {
    return originalFetch.apply(this, arguments as any);
  }

  // Intercept mutations (POST, PUT, DELETE, PATCH)
  return offlineCapableFetch(url as string, options);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
