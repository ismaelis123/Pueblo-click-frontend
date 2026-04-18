import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiMapPin, FiClock, FiCompass, FiMap, 
  FiUser, FiTarget, FiLoader, FiRefreshCw, FiPackage, FiHome,
  FiNavigation, FiMaximize
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
  const [mapReady, setMapReady] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapError, setMapError] = useState(null);
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);

  // Inicializar mapa cuando todo esté listo
  useEffect(() => {
    if (order && mapContainerRef.current && window.google && !mapRef.current) {
      initializeMap();
    }
  }, [order, mapContainerRef.current]);

  // Esperar a que Google Maps esté disponible
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
    
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 300);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('google-maps-loaded', handleMapsLoaded);
    };
  }, []);

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
      console.log('📦 Cargando orden:', orderId);
      const response = await api.get('/client/orders');
      const found = response.data.find(o => o._id === orderId);
      
      if (!found) {
        toast.error('Orden no encontrada');
        navigate('/client/orders');
        return;
      }
      
      console.log('✅ Orden cargada:', found);
      setOrder(found);
      
      // Verificar ubicación del mandadito
      if (found.mandadito?.currentLocation?.lat) {
        console.log('📍 Ubicación del mandadito encontrada:', found.mandadito.currentLocation);
        setMandaditoLocation(found.mandadito.currentLocation);
      }
      
      // Intentar obtener ubicación actualizada
      if (found.mandadito?._id) {
        try {
          const locResponse = await api.get(`/client/orders/${orderId}/location`);
          if (locResponse.data.location) {
            console.log('📍 Ubicación actualizada:', locResponse.data.location);
            setMandaditoLocation(locResponse.data.location);
          }
        } catch (err) {
          console.log('⚠️ Mandadito no está compartiendo ubicación');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando orden:', error);
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
      setUpdating(true);
      setTimeout(() => setUpdating(false), 1000);
      
      if (mapRef.current) {
        updateMandaditoMarker(data.location);
      }
    }
  };

  const initializeMap = () => {
    if (!mapContainerRef.current) {
      console.log('❌ Contenedor del mapa no encontrado');
      setMapError('No se encontró el contenedor del mapa');
      return;
    }

    if (!window.google) {
      console.log('❌ Google Maps no disponible');
      setMapError('Google Maps no está disponible');
      return;
    }

    console.log('🗺️ Inicializando mapa...');

    try {
      // Centro por defecto: Juigalpa
      const defaultCenter = { lat: 12.106, lng: -85.364 };
      
      // Determinar el centro inicial
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
        mapTypeControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
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

      // Agregar marcadores
      addAllMarkers();
      
      setMapError(null);
      console.log('✅ Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
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
        label: {
          text: '📦',
          color: 'white',
          fontSize: '14px',
        },
        animation: window.google.maps.Animation.DROP,
      });

      // InfoWindow para recogida
      const pickupInfo = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <strong>📍 Punto de recogida</strong><br/>
            <span style="font-size: 12px;">${order.pickupAddress || 'Dirección de recogida'}</span>
          </div>
        `
      });
      
      markersRef.current.pickup.addListener('click', () => {
        pickupInfo.open(mapRef.current, markersRef.current.pickup);
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
        label: {
          text: '🏠',
          color: 'white',
          fontSize: '14px',
        },
        animation: window.google.maps.Animation.DROP,
      });

      const deliveryInfo = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <strong>🏠 Punto de entrega</strong><br/>
            <span style="font-size: 12px;">${order.deliveryAddress || 'Dirección de entrega'}</span>
          </div>
        `
      });
      
      markersRef.current.delivery.addListener('click', () => {
        deliveryInfo.open(mapRef.current, markersRef.current.delivery);
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

      const mandaditoInfo = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>🛵 ${order.mandadito?.name || 'Mandadito'}</strong><br/>
            <span style="font-size: 11px;">📍 Ubicación en tiempo real</span>
          </div>
        `
      });
      
      markersRef.current.mandadito.addListener('click', () => {
        mandaditoInfo.open(mapRef.current, markersRef.current.mandadito);
      });
      
      bounds.extend(mandaditoPos);
      
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
      
      // Si solo hay un punto, ajustar zoom
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
      markersRef.current.mandadito.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        markersRef.current.mandadito?.setAnimation(null);
      }, 2000);
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

    // Actualizar ruta
    if (order?.deliveryLocation?.lat) {
      calculateRoute(currentPos, { 
        lat: order.deliveryLocation.lat, 
        lng: order.deliveryLocation.lng 
      });
    }

    // Mover el mapa para seguir al mandadito (opcional)
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
        provideRouteAlternatives: false,
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
        } else {
          console.log('⚠️ No se pudo calcular la ruta:', status);
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
        toast.success('Ubicación actualizada');
      } else {
        toast.error('El mandadito no está compartiendo su ubicación');
      }
    } catch (error) {
      toast.error('No se pudo obtener la ubicación');
    }
  };

  const handleRetryMap = () => {
    setMapError(null);
    if (mapContainerRef.current && window.google) {
      initializeMap();
    }
  };

  if (loading) return <LoadingSpinner />;

  const isTracking = order?.status === 'accepted' || order?.status === 'delivered';
  const isSharing = mandaditoLocation !== null;

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

        {/* Info de la orden y mandadito */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center overflow-hidden">
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
                  <div className="flex items-center gap-2">
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
          <div className="relative" style={{ height: '450px', width: '100%' }}>
            {/* Estados de carga/error */}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-30">
                <div className="text-center p-6">
                  <FiMap className="text-5xl text-gray-400 mx-auto mb-3" />
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
            
            {!isSharing && isTracking && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/95 z-20">
                <div className="text-center p-6">
                  <FiMapPin className="text-5xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-2">
                    El mandadito no está compartiendo su ubicación
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Puedes contactarlo por chat o intentar actualizar
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
              style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }}
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
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FiPackage className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Punto de recogida</p>
                  <p className="text-sm text-gray-700">{order.pickupAddress}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
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
            className="flex-1 bg-[#FF6B35] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e55a2b] transition-colors"
          >
            <FiNavigation /> Abrir en Google Maps
          </button>
          
          {isTracking && (
            <button
              onClick={handleRefreshLocation}
              className="px-4 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>

        {/* Mensaje si no está en seguimiento */}
        {order && !isTracking && order.status !== 'completed' && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center mt-4">
            <FiTarget className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Esperando al mandadito</p>
            <p className="text-sm text-gray-500 mt-1">
              El seguimiento en tiempo real estará disponible cuando el mandadito acepte el pedido.
            </p>
          </div>
        )}
      </div>
    </Background>
  );
};

export default OrderTracking;