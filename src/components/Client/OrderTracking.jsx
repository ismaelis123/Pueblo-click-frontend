import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiNavigation, FiClock, FiCompass, FiMap, FiUser, FiTarget, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

// Función para cargar Leaflet dinámicamente
const loadLeaflet = () => {
  return Promise.all([
    import('leaflet'),
    import('leaflet/dist/leaflet.css')
  ]).then(([L]) => L);
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [order, setOrder] = useState(null);
  const [mandaditoLocation, setMandaditoLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [L, setL] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  // Cargar Leaflet
  useEffect(() => {
    loadLeaflet().then(leaflet => {
      setL(leaflet);
    }).catch(err => {
      console.error('Error cargando Leaflet:', err);
      setMapError('Error al cargar el mapa');
    });
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (socket) {
      socket.on('locationUpdate', handleLocationUpdate);
      return () => socket.off('locationUpdate');
    }
  }, [socket]);

  useEffect(() => {
    if (L && mapContainerRef.current && (order?.deliveryLocation || mandaditoLocation)) {
      setTimeout(() => initMap(), 100);
    }
  }, [L, order, mandaditoLocation]);

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
      console.log('📍 Nueva ubicación recibida:', data.location);
      setMandaditoLocation(data.location);
      calculateDistance(data.location);
      setUpdating(true);
      setTimeout(() => setUpdating(false), 1000);
      
      // Actualizar marcador en el mapa
      if (mapRef.current && markersRef.current.mandadito) {
        markersRef.current.mandadito.setLatLng([data.location.lat, data.location.lng]);
        const time = new Date().toLocaleTimeString();
        markersRef.current.mandadito.setPopupContent(`🛵 Mandadito aquí<br><small>Actualizado: ${time}</small>`);
        mapRef.current.setView([data.location.lat, data.location.lng], 15);
        
        // Actualizar ruta
        if (order?.deliveryLocation?.lat) {
          if (polylineRef.current) polylineRef.current.remove();
          const points = [[data.location.lat, data.location.lng], [order.deliveryLocation.lat, order.deliveryLocation.lng]];
          polylineRef.current = L.polyline(points, { color: '#FF6B35', weight: 4, opacity: 0.8, dashArray: '5, 10' }).addTo(mapRef.current);
        }
      }
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

  const initMap = () => {
    if (!mapContainerRef.current || !L) return;
    
    try {
      // Configurar íconos de Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Ícono personalizado para mandadito
      const mandaditoIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
        iconRetinaUrl: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Ícono para destino
      const destinationIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
        iconRetinaUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Centro del mapa
      let center = [12.106, -85.364];
      if (mandaditoLocation) center = [mandaditoLocation.lat, mandaditoLocation.lng];
      else if (order?.deliveryLocation?.lat) center = [order.deliveryLocation.lat, order.deliveryLocation.lng];
      
      mapRef.current = L.map(mapContainerRef.current).setView(center, 13);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapRef.current);
      
      // Marcador de destino
      if (order?.deliveryLocation?.lat) {
        markersRef.current.delivery = L.marker([order.deliveryLocation.lat, order.deliveryLocation.lng], { icon: destinationIcon })
          .addTo(mapRef.current)
          .bindPopup('🏠 Destino');
      }
      
      // Marcador de mandadito
      if (mandaditoLocation?.lat) {
        const popupContent = mandaditoLocation.lastUpdate 
          ? `🛵 Mandadito aquí<br><small>Actualizado: ${new Date(mandaditoLocation.lastUpdate).toLocaleTimeString()}</small>`
          : '🛵 Mandadito aquí';
        markersRef.current.mandadito = L.marker([mandaditoLocation.lat, mandaditoLocation.lng], { icon: mandaditoIcon })
          .addTo(mapRef.current)
          .bindPopup(popupContent);
      }
      
      // Dibujar ruta
      if (mandaditoLocation?.lat && order?.deliveryLocation?.lat) {
        const points = [[mandaditoLocation.lat, mandaditoLocation.lng], [order.deliveryLocation.lat, order.deliveryLocation.lng]];
        polylineRef.current = L.polyline(points, { color: '#FF6B35', weight: 4, opacity: 0.8, dashArray: '5, 10' }).addTo(mapRef.current);
        const bounds = L.latLngBounds(points);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
      
      setMapError(null);
    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setMapError('Error al inicializar el mapa');
    }
  };

  const openInGoogleMaps = () => {
    if (mandaditoLocation && order?.deliveryLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${mandaditoLocation.lat},${mandaditoLocation.lng}&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&travelmode=driving`;
      window.open(url, '_blank');
    } else if (order?.deliveryLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  if (loading) return <LoadingSpinner />;

  const isTracking = order?.status === 'accepted' || order?.status === 'delivered';

  return (
    <Background>
      <div className="container mx-auto py-4 px-4 pb-24 md:pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Seguimiento del Pedido</h1>
        </div>

        {/* Estado */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-500">Orden #{order?._id?.slice(-6)}</p>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <FiUser className="text-[#FF6B35]" /> {order?.mandadito?.name || 'Mandadito asignado'}
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

        {/* Mapa */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {mapError ? (
            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-100">
              <FiAlertCircle className="text-4xl text-red-400 mb-3" />
              <p className="text-gray-500 text-center">{mapError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 btn-primary py-2 px-4 text-sm"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div ref={mapContainerRef} style={{ height: '400px', width: '100%' }} />
          )}
          <div className="p-3 bg-gray-50 flex justify-center gap-4 text-xs text-gray-500 border-t">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#FF6B35]" /><span>Ruta</span></div>
            <div className="flex items-center gap-1"><img src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png" className="w-4 h-4" alt="" /><span>Mandadito</span></div>
            <div className="flex items-center gap-1"><img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" className="w-4 h-4" alt="" /><span>Destino</span></div>
          </div>
        </div>

        {/* Direcciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiMapPin className="text-[#FF6B35]" /> Direcciones
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

        {/* Acciones */}
        {order?.deliveryLocation && (
          <button onClick={openInGoogleMaps} className="w-full bg-[#FF6B35] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e55a2b] transition-colors">
            <FiMap /> Abrir en Google Maps
          </button>
        )}

        {!isTracking && order?.status !== 'completed' && (
          <div className="bg-gray-50 rounded-2xl p-5 text-center mt-4">
            <FiTarget className="text-3xl text-gray-300 mx-auto mb-2" />
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