import { useState, useEffect, useRef } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('prompt');
  const watchIdRef = useRef(null);

  const clearWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por tu navegador');
      setLoading(false);
      setPermission('unsupported');
      return;
    }

    clearWatch();

    const success = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setLoading(false);
      setError(null);
      setPermission('granted');
    };

    const errorHandler = (err) => {
      let errorMessage = 'Error al obtener ubicación';
      if (err.code === 1) {
        errorMessage = 'Permiso denegado. Activa la ubicación.';
        setPermission('denied');
      } else if (err.code === 2) {
        errorMessage = 'Ubicación no disponible.';
      } else if (err.code === 3) {
        errorMessage = 'Tiempo de espera agotado.';
      }
      setError(errorMessage);
      setLoading(false);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(success, errorHandler, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options
    });
  };

  const requestPermission = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      setLoading(false);
      return false;
    }

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
        startWatching();
      },
      (err) => {
        setError('Permiso denegado');
        setPermission('denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    
    return true;
  };

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state);
        result.onchange = () => setPermission(result.state);
      });
    }

    startWatching();

    return () => clearWatch();
  }, []);

  return { location, error, loading, permission, requestPermission };
};