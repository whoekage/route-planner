import React from 'react';
import { Card, Badge } from 'react-bootstrap';

const RouteSummary = ({ geocodedAddresses, routeOrder, totalDistance, totalDuration }) => {
  // Преобразуем метры в километры и форматируем
  const formattedDistance = totalDistance ? (totalDistance / 1000).toFixed(1) : 'N/A';
  
  // Преобразуем секунды в часы и минуты
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
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
      </Card.Body>
    </Card>
  );
};

export default RouteSummary; 