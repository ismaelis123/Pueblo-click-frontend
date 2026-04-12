import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('prompt');

  useEffect(() => {
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por tu navegador');
      setLoading(false);
      setPermission('unsupported');
      return;
    }

    // Verificar el estado del permiso
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
      console.error('Error de geolocalización:', err);
      let errorMessage = 'Error al obtener ubicación';
      
      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Permiso denegado. Activa la ubicación en tu navegador.';
          setPermission('denied');
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

    // Solicitar ubicación
    const watchId = navigator.geolocation.watchPosition(success, errorHandler, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
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
        setError('Permiso denegado. Activa la ubicación para compartir tu ruta.');
        setPermission('denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { location, error, loading, permission, requestPermission };
};