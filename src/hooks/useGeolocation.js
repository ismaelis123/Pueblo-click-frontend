import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por tu navegador');
      setLoading(false);
      return;
    }

    const success = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setLoading(false);
    };

    const errorHandler = (err) => {
      console.error('Error de geolocalización:', err);
      let errorMessage = 'Error al obtener ubicación';
      
      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Permiso denegado. Activa la ubicación en tu navegador.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Información de ubicación no disponible.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Tiempo de espera agotado.';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(success, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options.enableHighAccuracy, options.timeout]);

  return { location, error, loading };
};