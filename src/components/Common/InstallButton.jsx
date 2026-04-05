import React, { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleInstallReady = (e) => {
      setDeferredPrompt(e.detail);
      setShowButton(true);
    };
    window.addEventListener('pwa-install-ready', handleInstallReady);
    return () => window.removeEventListener('pwa-install-ready', handleInstallReady);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowButton(false);
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <button onClick={handleInstall} className="fixed bottom-20 right-4 z-50 bg-[#FF6B35] text-white p-3 rounded-full shadow-lg hover:bg-[#e55a2b] transition-all animate-bounce">
      <FiDownload className="text-xl" />
    </button>
  );
};

export default InstallButton;