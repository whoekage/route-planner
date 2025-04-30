import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for numbered markers
const createNumberedIcon = (number) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #3388ff; width: 24px; height: 24px; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: bold; border: 2px solid white;">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const Map = ({ geocodedAddresses, routeOrder, routeGeometry }) => {
  const [center, setCenter] = useState([43.25, 76.95]); // Almaty coordinates
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    // Adjust map view if we have geocoded addresses
    if (geocodedAddresses && geocodedAddresses.length > 0) {
      const lats = geocodedAddresses.map(addr => addr.lat);
      const lons = geocodedAddresses.map(addr => addr.lon);
      
      const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
      const centerLon = (Math.max(...lons) + Math.min(...lons)) / 2;
      
      setCenter([centerLat, centerLon]);
      
      // Set zoom level based on the distance between points
      if (geocodedAddresses.length > 1) {
        setZoom(13); // Set a reasonable zoom level for multiple points
      }
    }
  }, [geocodedAddresses]);

  // Prepare route line coordinates if we have route geometry
  const routeLine = routeGeometry ? 
    routeGeometry.coordinates.map(coord => [coord[1], coord[0]]) : 
    [];

  return (
    <div style={{ height: '500px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Display the optimized route as a polyline */}
        {routeLine.length > 0 && (
          <Polyline 
            positions={routeLine} 
            color="#0088ff" 
            weight={5} 
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
        
        {/* Display markers for each address with order number */}
        {geocodedAddresses.map((address, index) => {
          // Find this address's position in the route order
          const orderIndex = routeOrder.findIndex(i => i === index);
          const orderNumber = orderIndex !== -1 ? orderIndex + 1 : '?';
          
          return (
            <Marker 
              key={index} 
              position={[address.lat, address.lon]}
              icon={createNumberedIcon(orderNumber)}
            >
              <Popup>
                <div>
                  <strong>{address.name || 'Точка ' + (index + 1)}</strong>
                  <p>{address.display_name || address.formatted}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map; 