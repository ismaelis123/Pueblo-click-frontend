import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado correctamente:', registration);
      })
      .catch(error => {
        console.log('❌ Error al registrar Service Worker:', error);
      });
  });
}

// Detectar si la app se puede instalar como PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('✅ App lista para instalar como PWA');
  window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: deferredPrompt }));
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#FFFFFF',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#FFFFFF' }
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);