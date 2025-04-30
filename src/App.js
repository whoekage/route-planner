import React, { useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import AddressInput from './components/AddressInput';
import Map from './components/Map';
import RouteSummary from './components/RouteSummary';
import { batchGeocodeAddresses } from './services/geocoding';
import { calculateDistanceMatrix, getFullRoute } from './services/routing';
import { solveTSP } from './utils/tsp';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [geocodedAddresses, setGeocodedAddresses] = useState([]);
  const [routeSolution, setRouteSolution] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Process addresses and calculate optimized route
  const processAddresses = async (addresses) => {
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Geocode all addresses
      const geocoded = await batchGeocodeAddresses(addresses);
      
      // Check for geocoding errors
      const geocodingErrors = geocoded.filter(result => result.error);
      if (geocodingErrors.length > 0) {
        throw new Error(`Could not geocode: ${geocodingErrors.map(e => e.address).join(', ')}`);
      }
      
      setGeocodedAddresses(geocoded);
      
      // Step 2: Calculate distance matrix
      const distanceMatrix = await calculateDistanceMatrix(geocoded);
      
      // Step 3: Solve TSP to find optimal route
      const solution = solveTSP(distanceMatrix, 0, true); // Start from first address, optimize for duration
      setRouteSolution(solution);
      
      // Step 4: Get full route geometry for display
      const orderedPoints = solution.order.map(index => geocoded[index]);
      const fullRoute = await getFullRoute(orderedPoints);
      
      if (fullRoute.success) {
        setRouteGeometry(fullRoute.geometry);
      }
      
    } catch (err) {
      setError(err.message || 'An error occurred while calculating the route');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Route Planner</h1>
          <p>Enter addresses in Almaty to find the optimal route visiting all locations.</p>
        </Col>
      </Row>
      
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      
      <Row>
        <Col md={4}>
          <AddressInput onAddressesSubmit={processAddresses} isLoading={loading} />
          
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Calculating optimal route...</p>
            </div>
          )}
          
          {routeSolution && (
            <RouteSummary 
              geocodedAddresses={geocodedAddresses}
              routeOrder={routeSolution.order}
              totalDistance={routeSolution.totalDistance}
              totalDuration={routeSolution.totalDuration}
            />
          )}
        </Col>
        
        <Col md={8}>
          <Map 
            geocodedAddresses={geocodedAddresses} 
            routeOrder={routeSolution?.order || []}
            routeGeometry={routeGeometry}
          />
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col>
          <footer className="text-center text-muted">
            <small>
              Route Planner | Using OpenStreetMap data | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
            </small>
          </footer>
        </Col>
      </Row>
    </Container>
  );
}

export default App; 