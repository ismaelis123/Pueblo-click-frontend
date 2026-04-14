import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiNavigation, FiShare, FiCheck, FiLoader, 
  FiTarget, FiAlertCircle, FiArrowLeft, FiPackage, FiHome 
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);

  // Cargar detalles de la orden
  useEffect(() => {
    fetchOrderDetails();
    if (permission === 'prompt') {
      requestPermission();
    }
  }, [orderId]);

  // Inicializar mapa cuando tengamos la orden
  useEffect(() => {
    if (order && !mapLoaded) {
      initMap();
    }
  }, [order, mapLoaded]);

  // Actualizar marcadores cuando cambia la ubicación
  useEffect(() => {
    if (mapRef.current && location && order) {
      updateMapWithLocation();
    }
  }, [location, order]);

  // Enviar ubicación al backend periódicamente
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
            location: { lat: location.lat, lng: location.lng, accuracy: location.accuracy }
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
      toast.error('Error al cargar los detalles de la orden');
    }
  };

  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google) return;

    const defaultCenter = { lat: 12.106, lng: -85.364 };
    
    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: mapRef.current,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#FF6B35',
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });

    setMapLoaded(true);
    updateMapWithOrderData();
  }, [order]);

  const updateMapWithOrderData = () => {
    if (!mapRef.current || !order) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    // Limpiar marcadores existentes
    Object.values(markersRef.current).forEach(marker => marker?.setMap(null));
    markersRef.current = {};

    // Marcador de recogida (verde)
    if (order.pickupLocation?.lat) {
      const pickupPos = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
      markersRef.current.pickup = new window.google.maps.Marker({
        position: pickupPos,
        map: mapRef.current,
        title: '📍 Punto de recogida',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        label: {
          text: '📦',
          color: 'white',
          fontSize: '14px',
          className: 'marker-label'
        }
      });
      bounds.extend(pickupPos);
    }

    // Marcador de entrega (rojo)
    if (order.deliveryLocation?.lat) {
      const deliveryPos = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
      markersRef.current.delivery = new window.google.maps.Marker({
        position: deliveryPos,
        map: mapRef.current,
        title: '🏠 Punto de entrega',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        label: {
          text: '🏠',
          color: 'white',
          fontSize: '14px',
        }
      });
      bounds.extend(deliveryPos);
    }

    // Calcular ruta entre recogida y entrega
    if (order.pickupLocation?.lat && order.deliveryLocation?.lat) {
      calculateRoute(
        { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng },
        { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng }
      );
    }

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const updateMapWithLocation = () => {
    if (!mapRef.current || !location || !order) return;

    const currentPos = { lat: location.lat, lng: location.lng };

    // Actualizar o crear marcador del mandadito
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
        label: {
          text: '🛵',
          color: 'white',
          fontSize: '14px',
        }
      });
    }

    // Actualizar ruta desde ubicación actual hasta recogida o entrega
    if (order.status === 'accepted') {
      if (!order.mandaditoDeliveredAt && order.pickupLocation?.lat) {
        // Si no ha recogido, ruta hacia punto de recogida
        calculateRoute(
          currentPos,
          { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng }
        );
      } else if (order.deliveryLocation?.lat) {
        // Si ya recogió, ruta hacia punto de entrega
        calculateRoute(
          currentPos,
          { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng }
        );
      }
    }
  };

  const calculateRoute = (origin, destination) => {
    if (!window.google || !directionsRendererRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          const route = result.routes[0];
          if (route && route.legs[0]) {
            setRouteInfo({
              distance: route.legs[0].distance.text,
              duration: route.legs[0].duration.text,
            });
          }
        } else {
          console.log('No se pudo calcular la ruta:', status);
          // Fallback: línea recta
          if (markersRef.current.pickup && markersRef.current.delivery) {
            mapRef.current.fitBounds(
              new window.google.maps.LatLngBounds(origin, destination),
              { padding: 50 }
            );
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
    
    let destination;
    if (order.status === 'accepted' && !order.mandaditoDeliveredAt) {
      destination = order.pickupLocation;
    } else {
      destination = order.deliveryLocation;
    }
    
    if (location && destination?.lat) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  return (
    <Background>
      <div className="max-w-md mx-auto py-4 px-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Compartir Ubicación</h1>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="relative" style={{ height: '350px', width: '100%' }}>
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <FiLoader className="text-3xl text-[#FF6B35] animate-spin" />
              </div>
            )}
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
          </div>
          
          {/* Leyenda del mapa */}
          <div className="p-3 bg-gray-50 flex flex-wrap justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Recogida</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Entrega</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png" className="w-4 h-4" alt="" />
              <span>Tú</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
              <span>Ruta</span>
            </div>
          </div>
        </div>

        {/* Panel de información */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">📋 Información de la ruta</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <FiPackage className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Punto de recogida</p>
                <p className="text-sm text-gray-700">{order?.pickupAddress}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FiHome className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Punto de entrega</p>
                <p className="text-sm text-gray-700">{order?.deliveryAddress}</p>
              </div>
            </div>
            
            {routeInfo && (
              <div className="bg-gray-50 rounded-xl p-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Distancia:</span>
                  <span className="font-semibold">{routeInfo.distance}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Tiempo estimado:</span>
                  <span className="font-semibold">{routeInfo.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de ubicación actual */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">📍 Tu ubicación</h3>
          
          {permission === 'denied' ? (
            <div className="text-center py-4">
              <FiAlertCircle className="text-3xl text-red-400 mx-auto mb-2" />
              <p className="text-red-500 text-sm">Permiso de ubicación denegado</p>
              <button onClick={requestPermission} className="mt-2 text-[#FF6B35] underline">
                Solicitar permiso
              </button>
            </div>
          ) : locationLoading ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <FiLoader className="animate-spin" /> Obteniendo ubicación...
            </div>
          ) : location ? (
            <div>
              <p className="text-sm text-gray-600">
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
            <div className="text-center py-4">
              <p className="text-gray-500">Esperando ubicación...</p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
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
            <button 
              onClick={openInGoogleMaps} 
              className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <FiNavigation /> Abrir en Google Maps
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Conectado al servidor' : 'Desconectado'}
          </div>
        </div>
      </div>
    </Background>
  );
};

export default ShareLocation;