import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar íconos de Leaflet manualmente (solución para Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Ícono personalizado para el mandadito
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

// Ícono para recogida
const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconRetinaUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Map = ({ 
  pickupLocation, 
  deliveryLocation, 
  currentLocation,
  showRoute = true,
  height = '400px'
}) => {
  // Calcular el centro del mapa basado en las ubicaciones disponibles
  const getCenter = () => {
    if (currentLocation?.lat && currentLocation?.lng) {
      return [currentLocation.lat, currentLocation.lng];
    }
    if (pickupLocation?.lat && pickupLocation?.lng) {
      return [pickupLocation.lat, pickupLocation.lng];
    }
    if (deliveryLocation?.lat && deliveryLocation?.lng) {
      return [deliveryLocation.lat, deliveryLocation.lng];
    }
    return [12.106, -85.364]; // Juigalpa, Chontales
  };

  // Calcular los puntos de la ruta
  const getRoutePoints = () => {
    const points = [];
    
    // Si hay ubicación actual, empezar desde ahí
    if (currentLocation?.lat && currentLocation?.lng && showRoute) {
      points.push([currentLocation.lat, currentLocation.lng]);
    }
    
    // Punto de recogida
    if (pickupLocation?.lat && pickupLocation?.lng) {
      points.push([pickupLocation.lat, pickupLocation.lng]);
    }
    
    // Punto de destino
    if (deliveryLocation?.lat && deliveryLocation?.lng) {
      points.push([deliveryLocation.lat, deliveryLocation.lng]);
    }
    
    return points;
  };

  const center = getCenter();
  const routePoints = getRoutePoints();

  return (
    <div style={{ height, width: '100%', borderRadius: '16px', overflow: 'hidden', zIndex: 1 }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        
        {/* Marcador de recogida */}
        {pickupLocation?.lat && pickupLocation?.lng && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              <strong>📍 Punto de recogida</strong>
              <br />
              {pickupLocation.address || 'Dirección de recogida'}
            </Popup>
          </Marker>
        )}
        
        {/* Marcador de destino */}
        {deliveryLocation?.lat && deliveryLocation?.lng && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={destinationIcon}>
            <Popup>
              <strong>🏠 Destino</strong>
              <br />
              {deliveryLocation.address || 'Dirección de entrega'}
            </Popup>
          </Marker>
        )}
        
        {/* Marcador del mandadito */}
        {currentLocation?.lat && currentLocation?.lng && showRoute && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={mandaditoIcon}>
            <Popup>
              <strong>🛵 Mandadito</strong>
              <br />
              {currentLocation.lastUpdate && (
                <>Actualizado: {new Date(currentLocation.lastUpdate).toLocaleTimeString()}</>
              )}
            </Popup>
          </Marker>
        )}
        
        {/* Ruta */}
        {showRoute && routePoints.length >= 2 && (
          <Polyline
            positions={routePoints}
            color="#E63946"
            weight={4}
            opacity={0.8}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;