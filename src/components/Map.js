import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing default marker icons in React-Leaflet
// This is necessary because the default icons from Leaflet's CSS are not properly bundled
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker with index number
const createNumberedIcon = (index) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-number">${index}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Helper component to fit map to bounds
const FitBounds = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(point => [point.lat, point.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, points]);
  
  return null;
};

const Map = ({ geocodedAddresses, routeOrder, routeGeometry }) => {
  // Default to Almaty center if no points
  const center = [43.238949, 76.889709]; // Almaty center coordinates
  const zoom = 12;
  
  // Create ordered points array based on route order
  const orderedPoints = routeOrder && geocodedAddresses.length > 0
    ? routeOrder.map(index => geocodedAddresses[index])
    : [];
  
  // Format routing path for polyline
  const pathPoints = routeGeometry?.coordinates
    ? routeGeometry.coordinates.map(coord => [coord[1], coord[0]])
    : [];
  
  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoom} className="leaflet-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Display markers for each point */}
        {orderedPoints.map((point, index) => (
          <Marker 
            key={index} 
            position={[point.lat, point.lon]}
            icon={createNumberedIcon(index)}
          >
            <Popup>
              <strong>Stop {index}: </strong>{point.address}
              <br />
              <small>{point.displayName}</small>
            </Popup>
          </Marker>
        ))}
        
        {/* Display route line */}
        {pathPoints.length > 0 && (
          <Polyline 
            positions={pathPoints} 
            color="#0d6efd" 
            weight={5} 
            opacity={0.7}
          />
        )}
        
        {/* Auto fit map to all points */}
        {geocodedAddresses.length > 0 && <FitBounds points={geocodedAddresses} />}
      </MapContainer>
    </div>
  );
};

export default Map; 