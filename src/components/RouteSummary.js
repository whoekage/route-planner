import React from 'react';
<<<<<<< HEAD
import { Card, Badge } from 'react-bootstrap';

const RouteSummary = ({ geocodedAddresses, routeOrder, totalDistance, totalDuration }) => {
  // Преобразуем метры в километры и форматируем
  const formattedDistance = totalDistance ? (totalDistance / 1000).toFixed(1) : 'N/A';
  
  // Преобразуем секунды в часы и минуты
=======
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
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
<<<<<<< HEAD
      return `${hours} ч ${minutes} мин`;
    } else {
      return `${minutes} мин`;
    }
  };
  
  const formattedDuration = formatDuration(totalDuration);
  
  return (
    <Card className="mb-4">
      <Card.Header as="h5">Оптимизированный маршрут</Card.Header>
      <Card.Body>
        <div className="route-info mb-3">
          <div>
            <Badge bg="primary" className="me-2">Общее расстояние: {formattedDistance} км</Badge>
          </div>
          <div>
            <Badge bg="success">Расчетное время: {formattedDuration}</Badge>
          </div>
        </div>
        
        <h6>Остановки по порядку</h6>
        <ol className="list-group list-group-numbered">
          {routeOrder && routeOrder.map((pointIndex, orderIndex) => {
            const point = geocodedAddresses[pointIndex];
            return (
              <li key={orderIndex} className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{point.name || `Точка ${pointIndex + 1}`}</div>
                  {point.display_name || point.formatted || ''}
                </div>
                <Badge bg="primary" pill>{orderIndex + 1}</Badge>
              </li>
            );
          })}
        </ol>
=======
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
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
      </Card.Body>
    </Card>
  );
};

export default RouteSummary; 