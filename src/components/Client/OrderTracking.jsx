import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiClock, FiCompass, FiMap, FiUser, FiTarget, FiLoader, FiRefreshCw } from 'react-icons/fi';
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
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Función para inicializar el mapa
  const initMap = useCallback(() => {
    if (!mapContainerRef.current) {
      console.log('❌ Contenedor del mapa no encontrado');
      return;
    }

    if (!window.google || !window.google.maps) {
      console.log('⏳ Google Maps no cargado aún');
      setMapError('Google Maps no está listo. Esperando...');
      return;
    }

    setMapLoading(true);
    setMapError(null);

    try {
      let center = { lat: 12.106, lng: -85.364 }; // Juigalpa
      
      if (mandaditoLocation && mandaditoLocation.lat) {
        center = { lat: mandaditoLocation.lat, lng: mandaditoLocation.lng };
      } else if (order?.deliveryLocation?.lat) {
        center = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
      }

      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: center,
        zoom: 14,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e3f5' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
        ],
      });

      // Marcador de destino
      if (order?.deliveryLocation?.lat && order?.deliveryLocation?.lng) {
        const destinationPos = { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng };
        destinationMarkerRef.current = new window.google.maps.Marker({
          position: destinationPos,
          map: mapRef.current,
          title: 'Destino',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
      }

      // Marcador de recogida
      if (order?.pickupLocation?.lat && order?.pickupLocation?.lng) {
        new window.google.maps.Marker({
          position: { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng },
          map: mapRef.current,
          title: 'Recogida',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
      }

      // Marcador del mandadito
      if (mandaditoLocation?.lat && mandaditoLocation?.lng) {
        const mandaditoPos = { lat: mandaditoLocation.lat, lng: mandaditoLocation.lng };
        markerRef.current = new window.google.maps.Marker({
          position: mandaditoPos,
          map: mapRef.current,
          title: 'Mandadito',
          icon: {
            url: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
      }

      // Si hay ambos puntos, calcular ruta
      if (mandaditoLocation?.lat && order?.deliveryLocation?.lat) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: mapRef.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#FF6B35',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        });

        directionsService.route(
          {
            origin: { lat: mandaditoLocation.lat, lng: mandaditoLocation.lng },
            destination: { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            setMapLoading(false);
            if (status === 'OK') {
              directionsRendererRef.current.setDirections(result);
              const route = result.routes[0];
              if (route && route.legs[0]) {
                setDistance(route.legs[0].distance.value / 1000);
                setEta(Math.round(route.legs[0].duration.value / 60));
              }
            } else {
              console.error('Error al calcular ruta:', status);
            }
          }
        );
      } else {
        setMapLoading(false);
      }

      console.log('✅ Mapa inicializado correctamente');
    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setMapError('Error al cargar el mapa. Intenta recargar.');
      setMapLoading(false);
    }
  }, [mandaditoLocation, order]);

  // Efecto para cargar la orden
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Efecto para inicializar el mapa cuando los datos estén listos
  useEffect(() => {
    if (!loading && !mapRef.current) {
      // Esperar a que Google Maps esté disponible
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 300);
      
      return () => clearInterval(checkGoogleMaps);
    }
  }, [loading, initMap]);

  // Efecto para actualizar el mapa cuando cambia la ubicación
  useEffect(() => {
    if (mapRef.current && mandaditoLocation?.lat) {
      const pos = { lat: mandaditoLocation.lat, lng: mandaditoLocation.lng };
      
      if (markerRef.current) {
        markerRef.current.setPosition(pos);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: pos,
          map: mapRef.current,
          title: 'Mandadito',
          icon: {
            url: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
      }
      
      mapRef.current.setCenter(pos);
      
      // Actualizar ruta
      if (order?.deliveryLocation?.lat && directionsRendererRef.current) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: pos,
            destination: { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') {
              directionsRendererRef.current.setDirections(result);
              const route = result.routes[0];
              if (route && route.legs[0]) {
                setDistance(route.legs[0].distance.value / 1000);
                setEta(Math.round(route.legs[0].duration.value / 60));
              }
            }
          }
        );
      }
    }
  }, [mandaditoLocation, order]);

  // Socket para recibir actualizaciones
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
      
      // También obtener ubicación actual del mandadito
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
      console.log('📍 Nueva ubicación recibida:', data.location);
      setMandaditoLocation(data.location);
      setUpdating(true);
      setTimeout(() => setUpdating(false), 1000);
    }
  };

  const openInGoogleMaps = () => {
    if (mandaditoLocation && order?.deliveryLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${mandaditoLocation.lat},${mandaditoLocation.lng}&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&travelmode=driving`;
      window.open(url, '_blank');
    } else if (order?.deliveryLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}&travelmode=driving`;
      window.open(url, '_blank');
    } else {
      toast.error('No hay ubicación de destino disponible');
    }
  };

  const handleRefreshLocation = async () => {
    try {
      const response = await api.get(`/client/orders/${orderId}/location`);
      if (response.data.location) {
        setMandaditoLocation(response.data.location);
        toast.success('Ubicación actualizada');
      } else {
        toast.error('El mandadito no está compartiendo su ubicación');
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Seguimiento del Pedido</h1>
        </div>

        {/* Información de la orden */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-gray-500">Orden #{order._id.slice(-6)}</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <FiUser className="text-[#FF6B35]" /> {order.mandadito?.name || 'Mandadito asignado'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                order.status === 'delivered' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {order.status === 'accepted' ? '🛵 En camino' :
                 order.status === 'delivered' ? '📦 Entregado - espera confirmación' :
                 order.status === 'completed' ? '✅ Completado' : order.status}
              </div>
            </div>

            {isTracking && (
              <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'} ${updating ? 'animate-pulse' : ''}`} />
                  <span className="text-xs text-gray-500">
                    {isConnected ? (updating ? 'Actualizando...' : 'Conectado') : 'Desconectado'}
                  </span>
                </div>
                {!isSharing && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleRefreshLocation}
                      className="text-xs text-[#FF6B35] flex items-center gap-1 hover:underline"
                    >
                      <FiRefreshCw className="text-xs" /> Actualizar ubicación
                    </button>
                  </div>
                )}
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
        )}

        {/* Mapa */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="relative" style={{ height: '400px', width: '100%' }}>
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <FiLoader className="text-3xl text-[#FF6B35] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando mapa...</p>
                </div>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center px-4">
                  <FiMap className="text-4xl text-red-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">{mapError}</p>
                  <button
                    onClick={initMap}
                    className="mt-3 bg-[#FF6B35] text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
            {!isSharing && !mapLoading && !mapError && isTracking && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                <div className="text-center px-4">
                  <FiMapPin className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-medium">El mandadito no está compartiendo su ubicación</p>
                  <p className="text-xs text-gray-400 mt-1">Puedes contactarlo por chat o llamada</p>
                  <button
                    onClick={handleRefreshLocation}
                    className="mt-3 bg-[#FF6B35] text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 mx-auto"
                  >
                    <FiRefreshCw className="text-sm" /> Verificar ubicación
                  </button>
                </div>
              </div>
            )}
            <div 
              ref={mapContainerRef} 
              id="tracking-map" 
              style={{ height: '100%', width: '100%' }} 
            />
          </div>
          <div className="p-3 bg-gray-50 flex flex-wrap justify-center gap-4 text-xs text-gray-500 border-t">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#FF6B35]" /><span>Ruta</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Recogida</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Destino</span></div>
            <div className="flex items-center gap-1"><img src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png" className="w-4 h-4" alt="" /><span>Mandadito</span></div>
          </div>
        </div>

        {/* Direcciones */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiMapPin className="text-[#FF6B35]" /> Direcciones
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-sm">📍</div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Punto de recogida</p>
                  <p className="text-sm text-gray-700 break-words">{order.pickupAddress}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-sm">🏠</div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Destino</p>
                  <p className="text-sm text-gray-700 break-words">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={openInGoogleMaps}
            className="flex-1 bg-[#FF6B35] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e55a2b] transition-colors"
          >
            <FiMap /> Abrir en Google Maps
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

        {order && !isTracking && order.status !== 'completed' && (
          <div className="bg-gray-50 rounded-2xl p-5 text-center mt-4">
            <FiTarget className="text-3xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              El seguimiento en tiempo real estará disponible cuando el mandadito acepte el pedido.
            </p>
          </div>
        )}
      </div>
    </Background>
  );
};

export default OrderTracking;