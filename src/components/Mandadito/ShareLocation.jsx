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
  const [currentDestination, setCurrentDestination] = useState('pickup'); // 'pickup' o 'delivery'
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Verificar si llegó al punto de recogida (menos de 50 metros)
  const checkArrivalAtPickup = (currentPos, pickupPos) => {
    if (!currentPos || !pickupPos) return false;
    const distance = calculateDistance(
      currentPos.lat, currentPos.lng,
      pickupPos.lat, pickupPos.lng
    );
    return distance < 0.05;
  };

  // Verificar si llegó al punto de entrega (menos de 50 metros)
  const checkArrivalAtDelivery = (currentPos, deliveryPos) => {
    if (!currentPos || !deliveryPos) return false;
    const distance = calculateDistance(
      currentPos.lat, currentPos.lng,
      deliveryPos.lat, deliveryPos.lng
    );
    return distance < 0.05;
  };

  // Esperar Google Maps
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapReady(true);
        return true;
      }
      return false;
    };
    
    if (checkGoogleMaps()) return;
    
    const handleMapsLoaded = () => setMapReady(true);
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

  // Actualizar ubicación y verificar destino
  useEffect(() => {
    if (mapRef.current && location && order) {
      const currentPos = { lat: location.lat, lng: location.lng };
      
      // Verificar si llegó al punto de recogida
      if (currentDestination === 'pickup' && order.pickupLocation?.lat) {
        const pickupPos = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
        const arrived = checkArrivalAtPickup(currentPos, pickupPos);
        
        if (arrived) {
          setCurrentDestination('delivery');
          toast.success('✅ Llegaste al punto de recogida. Ahora dirigite al punto de entrega.');
        }
      }
      
      // Verificar si llegó al punto de entrega
      if (currentDestination === 'delivery' && order.deliveryLocation?.lat) {
        const deliveryPos = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
        const arrived = checkArrivalAtDelivery(currentPos, deliveryPos);
        
        if (arrived && order.status === 'accepted') {
          toast.success('📍 Llegaste al punto de entrega. ¡Marcá el pedido como entregado!');
        }
      }
      
      updateMapWithLocation();
    }
  }, [location, order, currentDestination]);

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
      
      // Determinar destino inicial basado en el estado
      if (response.data.status === 'accepted' && !response.data.mandaditoDeliveredAt) {
        setCurrentDestination('pickup');
      } else if (response.data.mandaditoDeliveredAt) {
        setCurrentDestination('delivery');
      }
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
    } catch (error) {
      console.error('Error inicializando mapa:', error);
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
        label: { text: '📦', color: 'white', fontSize: '14px' },
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
        label: { text: '🏠', color: 'white', fontSize: '14px' },
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
      
      // Calcular ruta según destino actual
      let destination;
      if (currentDestination === 'pickup' && order.pickupLocation?.lat) {
        destination = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
      } else if (order.deliveryLocation?.lat) {
        destination = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
      }
      
      if (destination) {
        calculateRoute(currentPos, destination);
      }
    }

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 60 });
    }
  };

  const updateMapWithLocation = () => {
    if (!mapRef.current || !location || !order) return;

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

    // Determinar destino según currentDestination
    let destination;
    if (currentDestination === 'pickup' && order.pickupLocation?.lat) {
      destination = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
    } else if (order.deliveryLocation?.lat) {
      destination = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
    }
    
    if (destination) {
      calculateRoute(currentPos, destination);
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
        } else {
          console.log('No se pudo calcular la ruta:', status);
        }
      }
    );
  };

  const toggleSharing = async () => {
    if (permission !== 'granted') {
      await requestPermission();
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

  const openInGoogleMaps = () => {
    if (!order || !location) return;
    
    let destination;
    if (currentDestination === 'pickup') {
      destination = order.pickupLocation;
    } else {
      destination = order.deliveryLocation;
    }
    
    if (destination?.lat) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`, '_blank');
    }
  };

  const handleRetryMap = () => {
    setMapError(null);
    if (mapContainerRef.current && window.google) {
      initializeMap();
    }
  };

  const handleSwitchDestination = () => {
    if (currentDestination === 'pickup') {
      setCurrentDestination('delivery');
      toast.success('Cambiaste a ruta hacia la entrega');
    } else {
      setCurrentDestination('pickup');
      toast.success('Cambiaste a ruta hacia la recogida');
    }
    updateMapWithLocation();
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

        {/* Indicador de destino actual */}
        <div className={`rounded-xl p-3 mb-4 text-center ${
          currentDestination === 'pickup' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm font-semibold">
            {currentDestination === 'pickup' ? '📦 Dirigiéndote al punto de RECOGIDA' : '🏠 Dirigiéndote al punto de ENTREGA'}
          </p>
          <button onClick={handleSwitchDestination} className="text-xs mt-1 underline">
            Cambiar a {currentDestination === 'pickup' ? 'entrega' : 'recogida'}
          </button>
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
                <p className="text-xs text-gray-500">Tiempo</p>
                <p className="font-semibold text-[#FF6B35]">{routeInfo.duration}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ubicación */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">📍 Tu ubicación</h3>
          {location ? (
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
            <p className="text-gray-500 text-sm">Esperando ubicación...</p>
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