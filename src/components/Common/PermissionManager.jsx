import React, { useState, useEffect } from 'react';
import { FiBell, FiMapPin, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const PermissionManager = () => {
  const { user } = useAuth();
  const { permission, subscribeToPush } = usePushNotifications();
  const [showBanner, setShowBanner] = useState(true);
  const [permissions, setPermissions] = useState({ notifications: false, location: false });

  useEffect(() => {
    setPermissions({ notifications: permission === 'granted', location: false });
    
    if (user?.role === 'mandadito' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setPermissions(prev => ({ ...prev, location: result.state === 'granted' }));
      });
    }
  }, [permission, user]);

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setPermissions(prev => ({ ...prev, location: true })),
        () => setPermissions(prev => ({ ...prev, location: false })),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleActivateNotifications = async () => {
    await subscribeToPush();
  };

  const allGranted = permissions.notifications && (user?.role !== 'mandadito' || permissions.location);
  if (!showBanner || allGranted) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
            <FiBell className="text-[#FF6B35] text-xl" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Activar permisos</h4>
            <p className="text-sm text-gray-500 mt-1">Para una mejor experiencia, necesitamos algunos permisos:</p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              {!permissions.notifications && (
                <li className="flex items-center gap-2"><FiBell className="text-[#FF6B35]" /> Notificaciones - Recibir alertas</li>
              )}
              {user?.role === 'mandadito' && !permissions.location && (
                <li className="flex items-center gap-2"><FiMapPin className="text-[#FF6B35]" /> Ubicación - Compartir tu ruta</li>
              )}
            </ul>
            <div className="flex gap-2 mt-3">
              {!permissions.notifications && (
                <button onClick={handleActivateNotifications} className="bg-[#FF6B35] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#e55a2b] transition-colors flex items-center gap-1">
                  <FiCheck /> Activar notificaciones
                </button>
              )}
              {user?.role === 'mandadito' && !permissions.location && (
                <button onClick={requestLocationPermission} className="border border-[#FF6B35] text-[#FF6B35] text-sm px-4 py-2 rounded-xl hover:bg-[#FF6B35] hover:text-white transition-colors flex items-center gap-1">
                  <FiMapPin /> Activar ubicación
                </button>
              )}
              <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <FiX />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;