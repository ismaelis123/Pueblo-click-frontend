import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleInstallReady = (e) => {
      setDeferredPrompt(e.detail);
      setShowButton(true);
    };

    window.addEventListener('pwa-install-ready', handleInstallReady);
    
    // También escuchar el evento beforeinstallprompt directamente
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    });

    // Escuchar cuando se instala la app
    window.addEventListener('appinstalled', () => {
      setShowButton(false);
      setIsInstalled(true);
      console.log('✅ App instalada correctamente');
    });

    return () => {
      window.removeEventListener('pwa-install-ready', handleInstallReady);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar el prompt de instalación
    deferredPrompt.prompt();
    
    // Esperar la elección del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó la instalación');
      setShowButton(false);
    } else {
      console.log('❌ Usuario rechazó la instalación');
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowButton(false);
    // Guardar en localStorage para no mostrar por un tiempo
    localStorage.setItem('pwa-dismissed', Date.now());
  };

  if (isInstalled) return null;
  if (!showButton) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-bounce">
      <button
        onClick={handleInstall}
        className="bg-[#FF6B35] text-white p-3 rounded-full shadow-lg hover:bg-[#e55a2b] transition-all flex items-center gap-2"
      >
        <FiDownload className="text-xl" />
        <span className="text-sm font-medium hidden sm:inline">Instalar App</span>
      </button>
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-600"
      >
        <FiX />
      </button>
    </div>
  );
};

export default InstallButton;