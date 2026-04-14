import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiMapPin, FiClock, FiCompass, FiMap, 
  FiUser, FiTarget, FiLoader, FiRefreshCw, FiPackage, FiHome 
} from 'react-icons/fi';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [order, setOrder] = useState(null);
  const [mandaditoLocation, setMandaditoLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);
  const googleMapsLoadedRef = useRef(false);

  // Esperar a que Google Maps esté listo
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps listo');
        googleMapsLoadedRef.current = true;
        if (order && !mapRef.current) {
          initMap();
        }
      }
    };
    
    checkGoogleMaps();
    
    if (!window.google) {
      window.addEventListener('google-maps-loaded', checkGoogleMaps);
      const interval = setInterval(checkGoogleMaps, 500);
      return () => {
        clearInterval(interval);
        window.removeEventListener('google-maps-loaded', checkGoogleMaps);
      };
    }
  }, [order]);

  // Cargar orden
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Socket para ubicación en tiempo real
  useEffect(() => {
    if (socket) {
      socket.on('locationUpdate', handleLocationUpdate);
      return () => socket.off('locationUpdate');
    }
  }, [socket, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get('/client/orders');
      const found = response.data.find(o => o._id === orderId);
      setOrder(found);
      
      if (found.mandadito?.currentLocation) {
        setMandaditoLocation(found.mandadito.currentLocation);
      }
      
      if (found.mandadito?._id) {
        try {
          const locResponse = await api.get(`/client/orders/${orderId}/location`);
          if (locResponse.data.location) {
            setMandaditoLocation(locResponse.data.location);
          }
        } catch (err) {
          console.log('Mandadito no está compartiendo ubicación');
        }
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
      setUpdating(true);
      setTimeout(() => setUpdating(false), 1000);
      updateMapWithLocation(data.location);
    }
  };

  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google || !order) {
      console.log('⏳ Esperando condiciones para inicializar mapa...');
      return;
    }

    console.log('🗺️ Inicializando mapa...');
    setMapLoading(true);

    try {
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

      updateMapWithOrderData();
      setMapLoading(false);
      console.log('✅ Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      setMapLoading(false);
    }
  }, [order]);

  const updateMapWithOrderData = () => {
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
        title: '📍 Punto de recogida',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
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
        },
      });
      bounds.extend(deliveryPos);
    }

    // Marcador del mandadito
    if (mandaditoLocation?.lat) {
      const mandaditoPos = { lat: mandaditoLocation.lat, lng: mandaditoLocation.lng };
      markersRef.current.mandadito = new window.google.maps.Marker({
        position: mandaditoPos,
        map: mapRef.current,
        title: `🛵 ${order.mandadito?.name || 'Mandadito'}`,
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
          scaledSize: new window.google.maps.Size(35, 35),
        },
      });
      bounds.extend(mandaditoPos);
      
      // Calcular ruta
      if (order.deliveryLocation?.lat) {
        calculateRoute(mandaditoPos, { 
          lat: order.deliveryLocation.lat, 
          lng: order.deliveryLocation.lng 
        });
      }
    }

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const updateMapWithLocation = (location) => {
    if (!mapRef.current || !location) return;

    const currentPos = { lat: location.lat, lng: location.lng };

    if (markersRef.current.mandadito) {
      markersRef.current.mandadito.setPosition(currentPos);
    } else {
      markersRef.current.mandadito = new window.google.maps.Marker({
        position: currentPos,
        map: mapRef.current,
        title: `🛵 ${order?.mandadito?.name || 'Mandadito'}`,
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
          scaledSize: new window.google.maps.Size(35, 35),
        },
      });
    }

    if (order?.deliveryLocation?.lat) {
      calculateRoute(currentPos, { 
        lat: order.deliveryLocation.lat, 
        lng: order.deliveryLocation.lng 
      });
    }

    if (markersRef.current.delivery) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(currentPos);
      bounds.extend(markersRef.current.delivery.getPosition());
      mapRef.current.fitBounds(bounds, { padding: 50 });
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

  const openInGoogleMaps = () => {
    if (mandaditoLocation && order?.deliveryLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${mandaditoLocation.lat},${mandaditoLocation.lng}&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&travelmode=driving`, '_blank');
    }
  };

  const handleRefreshLocation = async () => {
    try {
      const response = await api.get(`/client/orders/${orderId}/location`);
      if (response.data.location) {
        setMandaditoLocation(response.data.location);
        updateMapWithLocation(response.data.location);
        toast.success('Ubicación actualizada');
      }
    } catch (error) {
      toast.error('No se pudo obtener la ubicación');
    }
  };

  if (loading) return <LoadingSpinner />;

  const isTracking = order?.status === 'accepted' || order?.status === 'delivered';
  const isSharing = mandaditoLocation !== null;

  return (
    <Background>
      <div className="container mx-auto py-4 px-4 pb-24 md:pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Seguimiento del Pedido</h1>
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold">
                <FiUser className="inline mr-1 text-[#FF6B35]" /> 
                {order.mandadito?.name || 'Mandadito asignado'}
              </p>
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                order.status === 'delivered' ? 'bg-yellow-100 text-yellow-700' : ''
              }`}>
                {order.status === 'accepted' ? '🛵 En camino' : '📦 Entregado'}
              </span>
            </div>
            {routeInfo && (
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span><FiCompass className="inline" /> {routeInfo.distance}</span>
                <span><FiClock className="inline" /> {routeInfo.duration}</span>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="relative" style={{ height: '400px' }}>
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                <FiLoader className="text-3xl text-[#FF6B35] animate-spin" />
              </div>
            )}
            {!isSharing && !loading && isTracking && !mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 z-10">
                <div className="text-center">
                  <FiMapPin className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Mandadito no comparte ubicación</p>
                  <button onClick={handleRefreshLocation} className="mt-3 bg-[#FF6B35] text-white px-4 py-2 rounded-xl">
                    <FiRefreshCw className="inline mr-1" /> Verificar
                  </button>
                </div>
              </div>
            )}
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <FiPackage className="text-green-600" />
                <div><p className="text-xs text-gray-500">Recoger en</p>
                <p className="text-sm">{order.pickupAddress}</p></div>
              </div>
              <div className="flex gap-3">
                <FiHome className="text-red-600" />
                <div><p className="text-xs text-gray-500">Entregar en</p>
                <p className="text-sm">{order.deliveryAddress}</p></div>
              </div>
            </div>
          </div>
        )}

        <button onClick={openInGoogleMaps} className="w-full bg-[#FF6B35] text-white py-3 rounded-xl flex items-center justify-center gap-2">
          <FiMap /> Abrir en Google Maps
        </button>
      </div>
    </Background>
  );
};

export default OrderTracking;