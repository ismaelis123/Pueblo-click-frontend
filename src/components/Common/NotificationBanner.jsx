import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX } from 'react-icons/fi';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const NotificationBanner = () => {
  const { permission, subscribeToPush, isSupported } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('notif-banner-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      setIsDismissed(true);
    }
  }, []);

  if (!isSupported) return null;
  if (permission === 'granted') return null;
  if (permission === 'denied') return null;
  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notif-banner-dismissed', Date.now().toString());
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0"><FiBell className="text-[#FF6B35] text-xl" /></div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Activar notificaciones</h4>
            <p className="text-sm text-gray-500 mt-1">Recibe alertas cuando haya nuevos mandados o actualizaciones.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={subscribeToPush} className="bg-[#FF6B35] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#e55a2b] transition-colors flex items-center gap-1"><FiCheck /> Activar</button>
              <button onClick={handleDismiss} className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">Ahora no</button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600"><FiX /></button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;