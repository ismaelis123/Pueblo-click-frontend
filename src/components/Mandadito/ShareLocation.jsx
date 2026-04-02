import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiShare, FiCheck, FiLoader } from 'react-icons/fi';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const ShareLocation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { location, error, loading: locationLoading } = useGeolocation({ enableHighAccuracy: true });
  const [sharing, setSharing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected) return;

    if (location && sharing) {
      const interval = setInterval(() => {
        socket.emit('updateLocation', {
          orderId,
          location: { lat: location.lat, lng: location.lng, accuracy: location.accuracy }
        });
        setLastUpdate(new Date());
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [socket, isConnected, location, sharing, orderId]);

  const toggleSharing = async () => {
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
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-20 h-20 bg-[#E63946]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="text-3xl text-[#E63946]" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-800 mb-2">Compartir Ubicación</h1>
          <p className="text-gray-500 text-sm mb-6">
            Activa el seguimiento para que el cliente pueda ver tu recorrido en tiempo real.
          </p>

          {/* Estado de ubicación */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {locationLoading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <FiLoader className="animate-spin" /> Obteniendo ubicación...
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm">
                <p>Error: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-[#E63946] underline mt-1"
                >
                  Reintentar
                </button>
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
            ) : null}
          </div>

          {/* Botón compartir */}
          <button
            onClick={toggleSharing}
            disabled={sending || !location}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors ${
              sharing && location
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {sending ? <FiLoader className="animate-spin" /> : sharing ? <FiCheck /> : <FiShare />}
            {sharing ? 'Compartiendo ubicación' : 'Activar seguimiento'}
          </button>

          {/* Botón abrir mapa */}
          {location && (
            <button
              onClick={openInMaps}
              className="w-full mt-3 border border-gray-300 text-gray-600 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FiNavigation /> Ver en Google Maps
            </button>
          )}

          {/* Estado de conexión */}
          <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Conectado al servidor' : 'Desconectado'}
          </div>
        </div>

        <button
          onClick={() => navigate('/mandadito/orders')}
          className="mt-4 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          ← Volver a mis órdenes
        </button>
      </div>
    </Background>
  );
};

export default ShareLocation;