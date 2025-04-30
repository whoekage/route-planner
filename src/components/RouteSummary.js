import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

const RouteSummary = ({ geocodedAddresses, routeOrder, totalDistance, totalDuration }) => {
  // If no route has been calculated yet
  if (!routeOrder || routeOrder.length === 0) {
    return null;
  }
  
  // Create ordered address list
  const orderedAddresses = routeOrder.map(index => geocodedAddresses[index]);
  
  // Format distance (convert meters to km)
  const formattedDistance = totalDistance 
    ? `${(totalDistance / 1000).toFixed(2)} km` 
    : 'N/A';
  
  // Format duration (convert seconds to minutes and hours)
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };
  
  return (
    <Card className="route-summary">
      <Card.Header>
        <h4>Optimized Route</h4>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <Badge bg="primary" className="me-2">
              Total Distance: {formattedDistance}
            </Badge>
            <Badge bg="success">
              Estimated Time: {formatDuration(totalDuration)}
            </Badge>
          </div>
          <div>
            <Badge bg="info">
              {orderedAddresses.length} Stops
            </Badge>
          </div>
        </div>
        
        <h5>Stops in Order</h5>
        <ListGroup variant="flush">
          {orderedAddresses.map((address, index) => (
            <ListGroup.Item key={index} className="d-flex align-items-center">
              <div className="marker-number me-2">{index}</div>
              <div>
                <div><strong>{address.address}</strong></div>
                <small className="text-muted">{address.displayName}</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default RouteSummary; 