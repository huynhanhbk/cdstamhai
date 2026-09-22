// Compatibility shim: Prevent "Cannot set property fetch of #<Window> which has only a getter"
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  try {
    const _origFetch = window.fetch.bind(window);
    let _currentFetch = _origFetch;
    Object.defineProperty(window, 'fetch', {
      get: () => _currentFetch,
      set: (fn) => {
        _currentFetch = fn;
      },
      configurable: true,
      enumerable: true,
    });
  } catch {
    // Ignore if not configurable
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
