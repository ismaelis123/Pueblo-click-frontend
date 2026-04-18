import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiNavigation, FiShare, FiCheck, FiLoader, 
  FiTarget, FiAlertCircle, FiArrowLeft, FiPackage, FiHome,
  FiRefreshCw
} from 'react-icons/fi';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const ShareLocation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { location, error, loading: locationLoading, permission, requestPermission } = useGeolocation({ 
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
  
  const [sharing, setSharing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapError, setMapError] = useState(null);
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);

  // Esperar Google Maps
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps disponible');
        setMapReady(true);
        return true;
      }
      return false;
    };
    
    if (checkGoogleMaps()) return;
    
    const handleMapsLoaded = () => {
      console.log('✅ Google Maps cargado por evento');
      setMapReady(true);
    };
    
    window.addEventListener('google-maps-loaded', handleMapsLoaded);
    const interval = setInterval(checkGoogleMaps, 300);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('google-maps-loaded', handleMapsLoaded);
    };
  }, []);

  // Cargar orden
  useEffect(() => {
    fetchOrderDetails();
    if (permission === 'prompt') {
      requestPermission();
    }
  }, [orderId]);

  // Inicializar mapa
  useEffect(() => {
    if (order && mapReady && mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, [order, mapReady]);

  // Actualizar ubicación en el mapa
  useEffect(() => {
    if (mapRef.current && location && order) {
      updateMapWithLocation();
    }
  }, [location, order]);

  // Enviar ubicación periódicamente
  useEffect(() => {
    if (!location || !sharing) return;
    
    const sendLocation = async () => {
      try {
        await api.post('/mandadito/location', {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy
        });
        
        if (socket && isConnected) {
          socket.emit('updateLocation', {
            orderId,
            location: { lat: location.lat, lng: location.lng }
          });
        }
        
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error enviando ubicación:', error);
      }
    };
    
    sendLocation();
    const interval = setInterval(sendLocation, 8000);
    
    return () => clearInterval(interval);
  }, [location, sharing, orderId, socket, isConnected]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/mandadito/orders/${orderId}`);
      setOrder(response.data);
      setSharing(response.data.mandadito?.isSharingLocation || false);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error al cargar la orden');
    }
  };

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.google) {
      setMapError('No se pudo cargar el mapa');
      return;
    }

    console.log('🗺️ Inicializando mapa para mandadito...');

    try {
      const defaultCenter = { lat: 12.106, lng: -85.364 };
      
      let initialCenter = defaultCenter;
      if (location?.lat) {
        initialCenter = { lat: location.lat, lng: location.lng };
      } else if (order?.pickupLocation?.lat) {
        initialCenter = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
      }

      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#FF6B35',
          strokeWeight: 6,
          strokeOpacity: 0.9,
        },
      });

      addAllMarkers();
      setMapError(null);
      console.log('✅ Mapa del mandadito inicializado');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      setMapError('Error al cargar el mapa');
    }
  };

  const addAllMarkers = () => {
    if (!mapRef.current || !order) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    Object.values(markersRef.current).forEach(marker => marker?.setMap(null));
    markersRef.current = {};

    // Marcador de recogida
    if (order.pickupLocation?.lat) {
      const pickupPos = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
      markersRef.current.pickup = new window.google.maps.Marker({
        position: pickupPos,
        map: mapRef.current,
        title: '📦 Punto de recogida',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(45, 45),
        },
        animation: window.google.maps.Animation.DROP,
      });
      bounds.extend(pickupPos);
    }

    // Marcador de entrega
    if (order.deliveryLocation?.lat) {
      const deliveryPos = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
      markersRef.current.delivery = new window.google.maps.Marker({
        position: deliveryPos,
        map: mapRef.current,
        title: '🏠 Punto de entrega',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(45, 45),
        },
        animation: window.google.maps.Animation.DROP,
      });
      bounds.extend(deliveryPos);
    }

    // Marcador del mandadito
    if (location?.lat) {
      const currentPos = { lat: location.lat, lng: location.lng };
      markersRef.current.mandadito = new window.google.maps.Marker({
        position: currentPos,
        map: mapRef.current,
        title: '🛵 Tu ubicación',
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
      bounds.extend(currentPos);
      
      // Calcular ruta hacia recogida o entrega
      const destination = order.status === 'accepted' && !order.mandaditoDeliveredAt 
        ? order.pickupLocation 
        : order.deliveryLocation;
        
      if (destination?.lat) {
        calculateRoute(currentPos, { lat: destination.lat, lng: destination.lng });
      }
    }

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 60 });
    }
  };

  const updateMapWithLocation = () => {
    if (!mapRef.current || !location) return;

    const currentPos = { lat: location.lat, lng: location.lng };

    if (markersRef.current.mandadito) {
      markersRef.current.mandadito.setPosition(currentPos);
    } else {
      markersRef.current.mandadito = new window.google.maps.Marker({
        position: currentPos,
        map: mapRef.current,
        title: '🛵 Tu ubicación',
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
    }

    // Actualizar ruta
    const destination = order?.status === 'accepted' && !order?.mandaditoDeliveredAt 
      ? order?.pickupLocation 
      : order?.deliveryLocation;
      
    if (destination?.lat) {
      calculateRoute(currentPos, { lat: destination.lat, lng: destination.lng });
    }
  };

  const calculateRoute = (origin, destination) => {
    if (!window.google || !directionsRendererRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      { origin, destination, travelMode: window.google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          const route = result.routes[0];
          if (route?.legs[0]) {
            setRouteInfo({
              distance: route.legs[0].distance.text,
              duration: route.legs[0].duration.text,
            });
          }
        }
      }
    );
  };

  const toggleSharing = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Necesitas activar la ubicación para compartir');
        return;
      }
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

  const openInGoogleMaps = () => {
    if (!order) return;
    
    const destination = order.status === 'accepted' && !order.mandaditoDeliveredAt 
      ? order.pickupLocation 
      : order.deliveryLocation;
    
    if (location?.lat && destination?.lat) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`, '_blank');
    }
  };

  const handleRetryMap = () => {
    setMapError(null);
    if (mapContainerRef.current && window.google) {
      initializeMap();
    }
  };

  return (
    <Background>
      <div className="max-w-md mx-auto py-4 px-4 min-h-screen flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Compartir Ubicación</h1>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="relative" style={{ height: '350px', width: '100%' }}>
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-30">
                <div className="text-center p-4">
                  <FiAlertCircle className="text-4xl text-red-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-3">{mapError}</p>
                  <button onClick={handleRetryMap} className="bg-[#FF6B35] text-white px-4 py-2 rounded-xl">
                    Reintentar
                  </button>
                </div>
              </div>
            )}
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }} />
          </div>
          
          <div className="p-3 bg-gray-50 flex flex-wrap justify-center gap-4 text-xs border-t">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Recogida</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Entrega</span></div>
            <div className="flex items-center gap-1"><img src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png" className="w-4 h-4" alt="" /><span>Tú</span></div>
          </div>
        </div>

        {/* Info de ruta */}
        {routeInfo && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-xs text-gray-500">Distancia</p>
                <p className="font-semibold text-[#FF6B35]">{routeInfo.distance}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Tiempo estimado</p>
                <p className="font-semibold text-[#FF6B35]">{routeInfo.duration}</p>
              </div>
            </div>
          </div>
        )}

        {/* Panel de ubicación */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">📍 Tu ubicación</h3>
          
          {permission === 'denied' ? (
            <div className="text-center py-2">
              <FiAlertCircle className="text-3xl text-red-400 mx-auto mb-2" />
              <p className="text-red-500 text-sm">Permiso denegado</p>
              <button onClick={requestPermission} className="mt-2 text-[#FF6B35] underline text-sm">
                Solicitar permiso
              </button>
            </div>
          ) : locationLoading ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <FiLoader className="animate-spin" /> Obteniendo ubicación...
            </div>
          ) : location ? (
            <div>
              <p className="text-xs text-gray-500 font-mono">
                Lat: {location.lat.toFixed(6)}<br />
                Lng: {location.lng.toFixed(6)}
              </p>
              {lastUpdate && (
                <p className="text-xs text-gray-400 mt-2">
                  Actualizado: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-2">Esperando ubicación...</p>
          )}
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={toggleSharing}
            disabled={sending || permission !== 'granted'}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold ${
              sharing && permission === 'granted'
                ? 'bg-green-500 text-white'
                : permission === 'granted'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {sending ? <FiLoader className="animate-spin" /> : sharing ? <FiCheck /> : <FiShare />}
            {sharing ? 'Compartiendo ubicación' : 'Activar seguimiento'}
          </button>

          {location && permission === 'granted' && (
            <button onClick={openInGoogleMaps} className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl flex items-center justify-center gap-2">
              <FiNavigation /> Abrir en Google Maps
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>
      </div>
    </Background>
  );
};

export default ShareLocation;