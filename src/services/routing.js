import axios from 'axios';

// OSRM API base URL
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving/';

/**
 * Calculate route between two points
 * @param {Object} start - Start coordinates {lat, lon}
 * @param {Object} end - End coordinates {lat, lon}
 * @returns {Promise<Object>} - Route information with distance and duration
 */
export const calculateRoute = async (start, end) => {
  try {
    const url = `${OSRM_API}${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`;
    const response = await axios.get(url);
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        success: true
      };
    }
    
    throw new Error('No route found');
  } catch (error) {
    console.error('Routing error:', error);
    return {
      distance: 0,
      duration: 0,
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate distance matrix between multiple points
 * @param {Array<Object>} points - Array of points with {lat, lon}
 * @returns {Promise<Array<Array<Object>>>} - Matrix of routes between points
 */
export const calculateDistanceMatrix = async (points) => {
  const matrix = [];
  
  // For each start point
  for (let i = 0; i < points.length; i++) {
    const row = [];
    
    // For each end point
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        // Distance to self is 0
        row.push({ distance: 0, duration: 0, success: true });
      } else {
        // Calculate actual route
        const route = await calculateRoute(points[i], points[j]);
        row.push(route);
        
        // Add a small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    matrix.push(row);
  }
  
  return matrix;
};

/**
 * Get full route details between ordered points
 * @param {Array<Object>} orderedPoints - Array of points in visit order with {lat, lon}
 * @returns {Promise<Object>} - Detailed route with geometry
 */
export const getFullRoute = async (orderedPoints) => {
  try {
    // Create coordinates string for API
    const coordinatesStr = orderedPoints
      .map(point => `${point.lon},${point.lat}`)
      .join(';');
    
    const url = `${OSRM_API}${coordinatesStr}?overview=full&geometries=geojson`;
    const response = await axios.get(url);
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        geometry: route.geometry, // GeoJSON LineString
        success: true
      };
    }
    
    throw new Error('No route found');
  } catch (error) {
    console.error('Routing error:', error);
    return {
      distance: 0,
      duration: 0,
      geometry: null,
      success: false,
      error: error.message
    };
  }
}; 