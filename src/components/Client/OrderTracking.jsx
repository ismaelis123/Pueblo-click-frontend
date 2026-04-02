import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiNavigation, FiClock, FiCompass, FiRefreshCw, FiMap, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Map from '../Common/Map';
import Background from '../Layout/Background';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [order, setOrder] = useState(null);
  const [mandaditoLocation, setMandaditoLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (socket) {
      socket.on('locationUpdate', handleLocationUpdate);
      return () => socket.off('locationUpdate');
    }
  }, [socket]);

  const fetchOrder = async () => {
    try {
      const response = await api.get('/client/orders');
      const found = response.data.find(o => o._id === orderId);
      setOrder(found);
      
      if (found.mandadito?.currentLocation) {
        setMandaditoLocation(found.mandadito.currentLocation);
      }
    } catch (error) {
      toast.error('Error al cargar la orden');
      navigate('/client/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = (data) => {
    if (data.orderId === orderId && data.location) {
      setMandaditoLocation(data.location);
      calculateDistance(data.location);
      setUpdating(true);
      setTimeout(() => setUpdating(false), 1000);
    }
  };

  const calculateDistance = (currentLoc) => {
    if (!order?.deliveryLocation?.lat) return;
    
    const R = 6371;
    const lat1 = currentLoc.lat * Math.PI / 180;
    const lat2 = order.deliveryLocation.lat * Math.PI / 180;
    const deltaLat = (order.deliveryLocation.lat - currentLoc.lat) * Math.PI / 180;
    const deltaLng = (order.deliveryLocation.lng - currentLoc.lng) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    
    setDistance(distanceKm);
    const speedKmh = 20;
    const timeMinutes = Math.round((distanceKm / speedKmh) * 60);
    setEta(timeMinutes);
  };

  const openInGoogleMaps = () => {
    if (mandaditoLocation && order?.deliveryLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${mandaditoLocation.lat},${mandaditoLocation.lng}&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  if (loading) return <LoadingSpinner />;

  const isTracking = order?.status === 'accepted' || order?.status === 'delivered';

  return (
    <Background>
      <div className="max-w-4xl mx-auto py-4 px-4 pb-24 md:pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Seguimiento del Pedido</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-500">Orden #{order?._id?.slice(-6)}</p>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <FiUser className="text-[#E63946]" /> {order?.mandadito?.name || 'Mandadito asignado'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              order?.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
              order?.status === 'delivered' ? 'bg-yellow-100 text-yellow-700' :
              order?.status === 'completed' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {order?.status === 'accepted' ? '🛵 En camino' :
               order?.status === 'delivered' ? '📦 Entregado - espera confirmación' :
               order?.status === 'completed' ? '✅ Completado' : order?.status}
            </div>
          </div>

          {isTracking && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${updating ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs text-gray-500">
                  {updating ? 'Actualizando...' : 'Ubicación en tiempo real'}
                </span>
              </div>
              {distance !== null && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiCompass className="text-xs" /> {distance.toFixed(1)} km
                </div>
              )}
              {eta !== null && eta > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiClock className="text-xs" /> ≈ {eta} min
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
          <Map
            pickupLocation={order?.pickupLocation}
            deliveryLocation={order?.deliveryLocation}
            currentLocation={mandaditoLocation}
            showRoute={isTracking}
            height="350px"
          />
          <div className="p-3 bg-gray-50 flex justify-center gap-4 text-xs text-gray-500 border-t">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#E63946]" /><span>Ruta</span></div>
            <div className="flex items-center gap-1"><img src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png" className="w-4 h-4" alt="" /><span>Mandadito</span></div>
            <div className="flex items-center gap-1"><img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" className="w-4 h-4" alt="" /><span>Destino</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiMapPin className="text-[#E63946]" /> Direcciones
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">📍</div>
              <div>
                <p className="text-xs text-gray-500">Punto de recogida</p>
                <p className="text-sm text-gray-700">{order?.pickupAddress}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">🏠</div>
              <div>
                <p className="text-xs text-gray-500">Destino</p>
                <p className="text-sm text-gray-700">{order?.deliveryAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {isTracking && mandaditoLocation && (
          <button
            onClick={openInGoogleMaps}
            className="w-full bg-[#E63946] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#c92a2a] transition-colors"
          >
            <FiMap /> Abrir en Google Maps
          </button>
        )}

        {!isTracking && order?.status !== 'completed' && (
          <div className="bg-gray-50 rounded-2xl p-5 text-center">
            <FiMapPin className="text-3xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              El seguimiento estará disponible cuando el mandadito acepte el pedido.
            </p>
          </div>
        )}
      </div>
    </Background>
  );
};

export default OrderTracking;