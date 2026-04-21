import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiMapPin, FiClock, FiCompass, FiMap, 
  FiUser, FiTarget, FiLoader, FiRefreshCw, FiPackage, FiHome,
  FiNavigation, FiAlertCircle, FiPhone, FiMessageSquare
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
  const [mapError, setMapError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);
  const initAttemptedRef = useRef(false);

  // Función para cargar Google Maps dinámicamente (para producción)
  const loadGoogleMapsScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Si ya está cargado
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps ya estaba cargado');
        resolve();
        return;
      }

      // Si ya existe el script cargándose
      const existingScript = document.querySelector('script[src*="maps.googleapis"]');
      if (existingScript) {
        console.log('⏳ Google Maps ya se está cargando, esperando...');
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            console.log('✅ Google Maps cargado');
            resolve();
          }
        }, 200);
        return;
      }

      console.log('🔄 Cargando Google Maps dinámicamente...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCIqvtE3fiX5p78QQ_30iIDWgW_JAn1b40&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps cargado dinámicamente');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Error cargando Google Maps');
        reject(new Error('No se pudo cargar Google Maps'));
      };
      
      document.head.appendChild(script);
    });
  }, []);

  // Cargar orden y luego inicializar mapa
  useEffect(() => {
    const init = async () => {
      await fetchOrder();
    };
    init();
  }, [orderId]);

  // Socket para ubicación en tiempo real
  useEffect(() => {
    if (socket) {
      socket.on('locationUpdate', handleLocationUpdate);
      socket.on('orderUpdated', handleOrderUpdated);
      return () => {
        socket.off('locationUpdate');
        socket.off('orderUpdated');
      };
    }
  }, [socket, orderId]);

  const fetchOrder = async () => {
    try {
      console.log('📦 [Cliente] Cargando orden:', orderId);
      const response = await api.get('/client/orders');
      const found = response.data.find(o => o._id === orderId);
      
      if (!found) {
        toast.error('Orden no encontrada');
        navigate('/client/orders');
        return;
      }
      
      console.log('✅ [Cliente] Orden cargada:', found.status);
      setOrder(found);
      
      // Verificar ubicación del mandadito
      if (found.mandadito?.currentLocation?.lat) {
        console.log('📍 [Cliente] Ubicación inicial del mandadito encontrada');
        setMandaditoLocation(found.mandadito.currentLocation);
        setIsSharing(true);
      }
      
      // Intentar obtener ubicación actualizada
      if (found.mandadito?._id) {
        try {
          const locResponse = await api.get(`/client/orders/${orderId}/location`);
          if (locResponse.data.location) {
            setMandaditoLocation(locResponse.data.location);
            setIsSharing(true);
          }
        } catch (err) {
          console.log('⚠️ [Cliente] Mandadito no está compartiendo ubicación');
          setIsSharing(false);
        }
      }
      
      setLoading(false);
      
      // Cargar Google Maps y luego inicializar el mapa
      try {
        await loadGoogleMapsScript();
        setMapLoading(false);
      } catch (error) {
        console.error('Error cargando Google Maps:', error);
        setMapError('Error al cargar el mapa');
        setMapLoading(false);
      }
      
    } catch (error) {
      console.error('❌ [Cliente] Error cargando orden:', error);
      toast.error('Error al cargar la orden');
      navigate('/client/orders');
      setLoading(false);
      setMapLoading(false);
    }
  };

  // Inicializar mapa cuando los datos estén listos
  useEffect(() => {
    if (!loading && !mapLoading && order && mapContainerRef.current && !mapRef.current && !initAttemptedRef.current) {
      initAttemptedRef.current = true;
      setTimeout(() => {
        initializeMap();
      }, 300);
    }
  }, [loading, mapLoading, order]);

  const handleLocationUpdate = (data) => {
    if (data.orderId === orderId && data.location) {
      console.log('📍 [Cliente] Nueva ubicación recibida');
      setMandaditoLocation(data.location);
      setIsSharing(true);
      setUpdating(true);
      setTimeout(() => setUpdating(false), 1000);
      
      if (mapRef.current) {
        updateMandaditoMarker(data.location);
      }
    }
  };

  const handleOrderUpdated = (updatedOrder) => {
    if (updatedOrder._id === orderId) {
      console.log('🔄 [Cliente] Orden actualizada:', updatedOrder.status);
      setOrder(updatedOrder);
    }
  };

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.google) {
      console.error('❌ No se pudo inicializar el mapa');
      setMapError('No se pudo cargar el mapa');
      return;
    }

    console.log('🗺️ [Cliente] Inicializando mapa...');

    try {
      // Centro por defecto: Juigalpa
      const defaultCenter = { lat: 12.106, lng: -85.364 };
      
      let initialCenter = defaultCenter;
      let initialZoom = 13;
      
      if (mandaditoLocation?.lat) {
        initialCenter = { lat: mandaditoLocation.lat, lng: mandaditoLocation.lng };
        initialZoom = 15;
      } else if (order?.deliveryLocation?.lat) {
        initialCenter = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
        initialZoom = 14;
      }

      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
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
      console.log('✅ [Cliente] Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌ [Cliente] Error inicializando mapa:', error);
      setMapError('Error al cargar el mapa');
    }
  };

  const addAllMarkers = () => {
    if (!mapRef.current || !order) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    // Limpiar marcadores existentes
    Object.values(markersRef.current).forEach(marker => marker?.setMap(null));
    markersRef.current = {};

    // Marcador de recogida (verde)
    if (order.pickupLocation?.lat && order.pickupLocation?.lng) {
      const pickupPos = { 
        lat: order.pickupLocation.lat, 
        lng: order.pickupLocation.lng 
      };
      
      markersRef.current.pickup = new window.google.maps.Marker({
        position: pickupPos,
        map: mapRef.current,
        title: '📍 Punto de recogida',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(45, 45),
        },
        animation: window.google.maps.Animation.DROP,
      });
      
      bounds.extend(pickupPos);
    }

    // Marcador de entrega (rojo)
    if (order.deliveryLocation?.lat && order.deliveryLocation?.lng) {
      const deliveryPos = { 
        lat: order.deliveryLocation.lat, 
        lng: order.deliveryLocation.lng 
      };
      
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

    // Marcador del mandadito (moto)
    if (mandaditoLocation?.lat && mandaditoLocation?.lng) {
      const mandaditoPos = { 
        lat: mandaditoLocation.lat, 
        lng: mandaditoLocation.lng 
      };
      
      markersRef.current.mandadito = new window.google.maps.Marker({
        position: mandaditoPos,
        map: mapRef.current,
        title: `🛵 ${order.mandadito?.name || 'Mandadito'}`,
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        animation: window.google.maps.Animation.BOUNCE,
      });
      
      bounds.extend(mandaditoPos);
      setIsSharing(true);
      
      // Calcular ruta desde mandadito hasta entrega
      if (order.deliveryLocation?.lat) {
        calculateRoute(mandaditoPos, { 
          lat: order.deliveryLocation.lat, 
          lng: order.deliveryLocation.lng 
        });
      }
    }

    // Ajustar el mapa para mostrar todos los puntos
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60,
      });
      
      if (Object.keys(markersRef.current).length === 1) {
        mapRef.current.setZoom(15);
      }
    }
  };

  const updateMandaditoMarker = (location) => {
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
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
    }

    setIsSharing(true);

    // Actualizar ruta
    if (order?.deliveryLocation?.lat) {
      calculateRoute(currentPos, { 
        lat: order.deliveryLocation.lat, 
        lng: order.deliveryLocation.lng 
      });
    }

    // Mover el mapa para seguir al mandadito
    if (markersRef.current.delivery) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(currentPos);
      bounds.extend(markersRef.current.delivery.getPosition());
      mapRef.current.fitBounds(bounds, { padding: 60 });
    }
  };

  const calculateRoute = (origin, destination) => {
    if (!window.google || !directionsRendererRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      { 
        origin, 
        destination, 
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
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
    if (mandaditoLocation?.lat && order?.deliveryLocation?.lat) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${mandaditoLocation.lat},${mandaditoLocation.lng}&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&travelmode=driving`;
      window.open(url, '_blank');
    } else if (order?.deliveryLocation?.lat) {
      const url = `https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleRefreshLocation = async () => {
    try {
      const response = await api.get(`/client/orders/${orderId}/location`);
      if (response.data.location) {
        setMandaditoLocation(response.data.location);
        updateMandaditoMarker(response.data.location);
        setIsSharing(true);
        toast.success('Ubicación actualizada');
      } else {
        toast.error('El mandadito no está compartiendo su ubicación');
      }
    } catch (error) {
      toast.error('No se pudo obtener la ubicación');
    }
  };

  const handleCallMandadito = () => {
    if (order?.mandadito?.phone) {
      window.location.href = `tel:${order.mandadito.phone}`;
    }
  };

  const handleOpenChat = () => {
    navigate(`/client/chat/${orderId}`);
  };

  const handleRetryMap = () => {
    setMapError(null);
    initAttemptedRef.current = false;
    if (mapContainerRef.current && window.google) {
      initializeMap();
    } else {
      loadGoogleMapsScript().then(() => {
        initializeMap();
      }).catch(() => {
        setMapError('Error al cargar el mapa');
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  const isTracking = order?.status === 'accepted' || order?.status === 'delivered';

  return (
    <Background>
      <div className="container mx-auto py-4 px-4 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Seguimiento del Pedido</h1>
            <p className="text-xs text-gray-500">Orden #{order?._id?.slice(-6) || ''}</p>
          </div>
        </div>

        {/* Info de la orden */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center overflow-hidden">
                  {order.mandadito?.profilePhoto ? (
                    <img src={order.mandadito.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="text-[#FF6B35] text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {order.mandadito?.name || 'Mandadito asignado'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'} ${updating ? 'animate-pulse' : ''}`} />
                    <span className="text-xs text-gray-500">
                      {isSharing ? (updating ? 'Actualizando...' : 'En vivo') : 'Sin ubicación'}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                order.status === 'delivered' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {order.status === 'accepted' ? '🛵 En camino' :
                 order.status === 'delivered' ? '📦 Entregado' :
                 order.status === 'completed' ? '✅ Completado' : order.status}
              </div>
            </div>
            
            {/* Botones de contacto */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleCallMandadito}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl flex items-center justify-center gap-2"
              >
                <FiPhone className="text-sm" /> Llamar
              </button>
              <button
                onClick={handleOpenChat}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl flex items-center justify-center gap-2"
              >
                <FiMessageSquare className="text-sm" /> Chat
              </button>
            </div>
            
            {routeInfo && isSharing && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <FiCompass className="text-[#FF6B35]" />
                  <span>{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <FiClock className="text-[#FF6B35]" />
                  <span>{routeInfo.duration}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mapa */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="relative" style={{ height: '400px', width: '100%' }}>
            {/* Estados de carga/error */}
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-30">
                <div className="text-center">
                  <FiLoader className="text-3xl text-[#FF6B35] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando mapa...</p>
                </div>
              </div>
            )}
            
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-30">
                <div className="text-center p-6">
                  <FiAlertCircle className="text-5xl text-red-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">{mapError}</p>
                  <button 
                    onClick={handleRetryMap}
                    className="bg-[#FF6B35] text-white px-5 py-2 rounded-xl"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
            
            {!isSharing && isTracking && !mapError && !mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/95 z-20">
                <div className="text-center p-6">
                  <FiMapPin className="text-5xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-2">
                    El mandadito no está compartiendo su ubicación
                  </p>
                  <button 
                    onClick={handleRefreshLocation}
                    className="bg-[#FF6B35] text-white px-5 py-2 rounded-xl flex items-center gap-2 mx-auto"
                  >
                    <FiRefreshCw /> Verificar ubicación
                  </button>
                </div>
              </div>
            )}
            
            {/* Contenedor del mapa */}
            <div 
              ref={mapContainerRef} 
              style={{ height: '100%', width: '100%', backgroundColor: '#f5f5f5' }}
            />
          </div>
          
          {/* Leyenda */}
          <div className="p-3 bg-gray-50 flex flex-wrap justify-center gap-4 text-xs border-t">
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
              <span>Mandadito</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 rounded-full bg-[#FF6B35]" />
              <span>Ruta</span>
            </div>
          </div>
        </div>

        {/* Direcciones */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FiPackage className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Punto de recogida</p>
                  <p className="text-sm text-gray-700">{order.pickupAddress}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <FiHome className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Punto de entrega</p>
                  <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={openInGoogleMaps}
            className="flex-1 bg-[#FF6B35] text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <FiNavigation /> Abrir en Google Maps
          </button>
          
          {isTracking && (
            <button
              onClick={handleRefreshLocation}
              className="px-4 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>

        {order && !isTracking && order.status !== 'completed' && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center mt-4">
            <FiTarget className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Esperando al mandadito</p>
            <p className="text-sm text-gray-500 mt-1">
              El seguimiento estará disponible cuando el mandadito acepte el pedido.
            </p>
          </div>
        )}
      </div>
    </Background>
  );
};

export default OrderTracking;