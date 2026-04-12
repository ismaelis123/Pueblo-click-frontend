import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiShare, FiCheck, FiLoader, FiTarget, FiAlertCircle } from 'react-icons/fi';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const ShareLocation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { location, error, loading: locationLoading, permission, requestPermission } = useGeolocation({ enableHighAccuracy: true });
  const [sharing, setSharing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => { 
    fetchOrder();
    // Solicitar permiso automáticamente al cargar
    if (permission === 'prompt') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    if (location && sharing) {
      const interval = setInterval(() => {
        console.log('📍 Enviando ubicación:', location);
        socket.emit('updateLocation', {
          orderId,
          location: { lat: location.lat, lng: location.lng, accuracy: location.accuracy }
        });
        setLastUpdate(new Date());
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [socket, isConnected, location, sharing, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get('/mandadito/orders');
      const found = response.data.find(o => o._id === orderId);
      setOrder(found);
    } catch (error) {
      console.error('Error fetching order');
    }
  };

  const toggleSharing = async () => {
    if (permission !== 'granted') {
      requestPermission();
      toast.info('Primero activa tu ubicación');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.put('/mandadito/share-location/toggle');
      setSharing(response.data.isSharingLocation);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Error al cambiar estado');
    } finally {
      setSending(false);
    }
  };

  const openInMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`, '_blank');
    }
  };

  return (
    <Background>
      <div className="max-w-md mx-auto py-8 px-4 min-h-screen flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="text-3xl text-[#FF6B35]" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-800 mb-2">Compartir Ubicación</h1>
          <p className="text-gray-500 text-sm mb-6">
            Activa el seguimiento para que el cliente pueda ver tu recorrido en tiempo real.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {permission === 'denied' ? (
              <div className="text-center">
                <FiAlertCircle className="text-3xl text-red-400 mx-auto mb-2" />
                <p className="text-red-500 text-sm">Permiso de ubicación denegado</p>
                <p className="text-xs text-gray-500 mt-1">Activa la ubicación en la configuración de tu navegador</p>
                <button onClick={() => toast.info('Activa la ubicación en la configuración del navegador')} className="mt-3 text-[#FF6B35] text-sm underline">
                  ¿Cómo activar?
                </button>
              </div>
            ) : locationLoading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <FiLoader className="animate-spin" /> Obteniendo ubicación...
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm">
                <p>Error: {error}</p>
                <button onClick={requestPermission} className="text-[#FF6B35] underline mt-1">Reintentar</button>
              </div>
            ) : location ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">📍 Ubicación actual</p>
                <p className="text-xs text-gray-400 font-mono">
                  Lat: {location.lat.toFixed(6)}<br />
                  Lng: {location.lng.toFixed(6)}<br />
                  Precisión: ±{Math.round(location.accuracy)}m
                </p>
                {lastUpdate && (
                  <p className="text-xs text-gray-400 mt-2">
                    Última actualización: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 text-sm">Esperando ubicación...</p>
                <button onClick={requestPermission} className="mt-2 text-[#FF6B35] text-sm underline">
                  Solicitar permiso
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleSharing}
            disabled={sending || permission !== 'granted'}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors ${
              sharing && permission === 'granted'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : permission === 'granted'
                  ? 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? <FiLoader className="animate-spin" /> : sharing ? <FiCheck /> : <FiShare />}
            {sharing ? 'Compartiendo ubicación' : permission === 'granted' ? 'Activar seguimiento' : 'Permiso requerido'}
          </button>

          {location && permission === 'granted' && (
            <button onClick={openInMaps} className="w-full mt-3 border border-gray-300 text-gray-600 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <FiNavigation /> Ver en Google Maps
            </button>
          )}

          <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Conectado al servidor' : 'Desconectado'}
          </div>
          
          {order && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700 flex items-center justify-center gap-1">
                <FiTarget className="text-xs" />
                Destino: {order.deliveryAddress?.substring(0, 40)}...
              </p>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/mandadito/orders')} className="mt-4 text-gray-400 text-sm hover:text-gray-600">
          ← Volver a mis órdenes
        </button>
      </div>
    </Background>
  );
};

export default ShareLocation;