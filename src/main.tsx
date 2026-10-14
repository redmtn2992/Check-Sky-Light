import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// In AI Studio iFrame / preview environment, Vite HMR WebSocket connections are inactive.
// Prevent benign WebSocket transport error events from triggering error banners.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.target instanceof WebSocket ||
      (event.message && (
        event.message.includes('WebSocket') ||
        event.message.includes('createWebSocketModuleRunnerTransport') ||
        event.message.includes('@vite/client')
      ))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    if (
      reasonStr.includes('WebSocket') ||
      reasonStr.includes('createWebSocketModuleRunnerTransport') ||
      reasonStr.includes('@vite/client')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

