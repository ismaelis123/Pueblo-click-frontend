import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('prompt');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por tu navegador');
      setLoading(false);
      setPermission('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state);
        result.onchange = () => setPermission(result.state);
      });
    }

    const success = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setLoading(false);
      setError(null);
    };

    const errorHandler = (err) => {
      let errorMessage = 'Error al obtener ubicación';
      if (err.code === err.PERMISSION_DENIED) {
        errorMessage = 'Permiso denegado. Activa la ubicación.';
        setPermission('denied');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        errorMessage = 'Ubicación no disponible.';
      } else if (err.code === err.TIMEOUT) {
        errorMessage = 'Tiempo de espera agotado.';
      }
      setError(errorMessage);
      setLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(success, errorHandler, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options.enableHighAccuracy, options.timeout]);

  const requestPermission = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setLoading(false);
        setPermission('granted');
      },
      (err) => {
        setError('Permiso denegado');
        setPermission('denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { location, error, loading, permission, requestPermission };
};