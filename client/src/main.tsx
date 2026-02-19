import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Service Worker registration with better error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW: Service Worker registered');
        
        // Check for updates every 60 seconds
        const updateInterval = setInterval(() => {
          if (registration.active) {
            registration.update();
          }
        }, 60000);
        
        // Clear interval on page unload
        window.addEventListener('beforeunload', () => {
          clearInterval(updateInterval);
        });
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('SW: New version available');
                // Dispatch custom event to notify the app
                window.dispatchEvent(new CustomEvent('sw-update-available'));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('SW: Service Worker registration failed, app will work without offline support:', error);
      });
  });

  // Handle service worker updates with safety check
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('SW: New service worker activated, reloading page');
    // Only reload if we're not in the middle of navigation
    if (document.readyState === 'complete') {
      window.location.reload();
    }
  });
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

const root = createRoot(container);
root.render(<App />);
