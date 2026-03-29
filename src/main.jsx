import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

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
              background: '#011627',
              color: '#FDFFFC',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#2EC4B6',
                secondary: '#FDFFFC',
              },
            },
            error: {
              iconTheme: {
                primary: '#E71D36',
                secondary: '#FDFFFC',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);