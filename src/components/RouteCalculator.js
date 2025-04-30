import React, { useState } from 'react';
import { Button, Form, Spinner, Alert, Card } from 'react-bootstrap';
import { calculateLocalRoute } from '../services/routing';

const RouteCalculator = () => {
  const [points, setPoints] = useState([
    { lat: 43.2422465, lon: 76.9026493, name: 'Точка 1' },
    { lat: 43.2490378, lon: 76.9186243, name: 'Точка 2' }
  ]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Добавить новую точку
  const addPoint = () => {
    setPoints([...points, { lat: '', lon: '', name: `Точка ${points.length + 1}` }]);
  };

  // Удалить точку
  const removePoint = (index) => {
    if (points.length <= 2) {
      setError('Требуется минимум 2 точки');
      return;
    }
    
    const newPoints = [...points];
    newPoints.splice(index, 1);
    setPoints(newPoints);
  };

  // Обновить данные точки
  const updatePoint = (index, field, value) => {
    const newPoints = [...points];
    newPoints[index][field] = field === 'name' ? value : parseFloat(value);
    setPoints(newPoints);
  };

  // Рассчитать маршрут
  const calculateRoute = async () => {
    // Проверить заполнены ли все координаты
    const isValid = points.every(point => 
      !isNaN(point.lat) && !isNaN(point.lon) && 
      point.lat !== '' && point.lon !== ''
    );

    if (!isValid) {
      setError('Заполните все координаты');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Рассчитать маршрут с замыканием круга (добавить первую точку в конец)
      const routePoints = [...points];
      if (points.length > 2 && 
          (points[0].lat !== points[points.length-1].lat || 
           points[0].lon !== points[points.length-1].lon)) {
        routePoints.push(points[0]);
      }
      
      const result = await calculateLocalRoute(routePoints);
      
      if (!result.success) {
        throw new Error(result.error || 'Не удалось рассчитать маршрут');
      }
      
      setRoute(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-calculator">
      <h2>Расчет маршрута</h2>
      <Card className="mb-4">
        <Card.Body>
          <h3>Точки маршрута</h3>
          {points.map((point, index) => (
            <div key={index} className="point-row mb-3">
              <Form.Group className="mb-2">
                <Form.Label>Название точки {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={point.name}
                  onChange={(e) => updatePoint(index, 'name', e.target.value)}
                />
              </Form.Group>
              
              <div className="d-flex gap-3">
                <Form.Group className="flex-grow-1">
                  <Form.Label>Широта</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0000001"
                    value={point.lat || ''}
                    onChange={(e) => updatePoint(index, 'lat', e.target.value)}
                    placeholder="43.2422465"
                  />
                </Form.Group>
                
                <Form.Group className="flex-grow-1">
                  <Form.Label>Долгота</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0000001"
                    value={point.lon || ''}
                    onChange={(e) => updatePoint(index, 'lon', e.target.value)}
                    placeholder="76.9026493"
                  />
                </Form.Group>
                
                <div className="d-flex align-items-end mb-3">
                  <Button 
                    variant="danger"
                    onClick={() => removePoint(index)}
                    disabled={points.length <= 2}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
              
              {index < points.length - 1 && <hr />}
            </div>
          ))}
          
          <div className="d-flex gap-2 mt-3">
            <Button variant="secondary" onClick={addPoint}>
              Добавить точку
            </Button>
            
            <Button 
              variant="primary" 
              onClick={calculateRoute}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Расчет...
                </>
              ) : 'Рассчитать маршрут'}
            </Button>
          </div>
          
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Card.Body>
      </Card>
      
      {route && (
        <Card>
          <Card.Body>
            <h3>Результаты</h3>
            <p><strong>Источник данных:</strong> {route.source === 'local-osm' ? 'Локальные OSM данные' : 'OSRM API'}</p>
            <p><strong>Расстояние:</strong> {(route.distance / 1000).toFixed(2)} км</p>
            <p><strong>Время в пути:</strong> {Math.floor(route.duration / 60)} мин {Math.round(route.duration % 60)} сек</p>
            <p><strong>Количество точек маршрута:</strong> {route.geometry.coordinates.length}</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RouteCalculator; 