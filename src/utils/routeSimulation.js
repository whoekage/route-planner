import { calculateRoute } from '../services/routing';
import { almatyRoadNetwork } from './roadNetwork';
import { solveTSP } from './tsp';

/**
 * Simulate route planning between multiple points using the local implementation
 * @param {Array<Object>} points - Array of points with {lat, lon}
 * @returns {Object} - Route solution including ordered points, total distance, duration and path
 */
export const simulateLocalRoutePlanning = (points) => {
  try {
    // Calculate distance matrix between all points
    const distanceMatrix = calculateLocalDistanceMatrix(points, almatyRoadNetwork);
    
    // Solve TSP to find optimal visit order
    const solution = solveTSP(distanceMatrix, 0, true); // Start from first point, optimize for duration
    
    // Get ordered points based on TSP solution
    const orderedPoints = solution.order.map(index => points[index]);
    
    // Calculate full route details through all points in order
    let totalDistance = 0;
    let totalDuration = 0;
    const paths = [];
    const routeDetails = [];
    
    for (let i = 0; i < orderedPoints.length - 1; i++) {
      const start = orderedPoints[i];
      const end = orderedPoints[i + 1];
      
      const routeSegment = calculateRoute(start, end, almatyRoadNetwork);
      
      if (routeSegment.success) {
        totalDistance += routeSegment.distance;
        totalDuration += routeSegment.duration;
        paths.push(routeSegment.path);
        
        routeDetails.push({
          from: i,
          to: i + 1,
          distance: routeSegment.distance,
          duration: routeSegment.duration,
          path: routeSegment.path
        });
      } else {
        throw new Error(`Could not find route between points ${i} and ${i+1}`);
      }
    }
    
    return {
      success: true,
      order: solution.order,
      orderedPoints,
      totalDistance,
      totalDuration,
      paths,
      routeDetails
    };
  } catch (error) {
    console.error('Route simulation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate a distance matrix between multiple points using the local routing algorithm
 * @param {Array<Object>} points - Array of points with {lat, lon}
 * @param {Object} roadNetwork - Graph representing the road network
 * @returns {Array<Array<Object>>} - Matrix of distances/durations between points
 */
export const calculateLocalDistanceMatrix = (points, roadNetwork) => {
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
        // Calculate route
        const route = calculateRoute(points[i], points[j], roadNetwork);
        row.push(route);
      }
    }
    
    matrix.push(row);
  }
  
  return matrix;
};

/**
 * Compare routes calculated by OSRM API and local implementation
 * @param {Object} start - Start coordinates {lat, lon}
 * @param {Object} end - End coordinates {lat, lon}
 * @param {Function} calculateRouteAPI - Function to calculate route using API
 * @param {Object} roadNetwork - Graph representing the road network
 * @returns {Object} - Comparison results
 */
export const compareRouteCalculations = async (start, end, calculateRouteAPI, roadNetwork) => {
  // Calculate route using API
  const apiRoute = await calculateRouteAPI(start, end);
  
  // Calculate route using local implementation
  const localRoute = calculateRouteLocal(start, end, roadNetwork);
  
  // Calculate difference percentage for distance and duration
  const distanceDiffPercent = apiRoute.success && localRoute.success
    ? Math.abs((localRoute.distance - apiRoute.distance) / apiRoute.distance) * 100
    : null;
  
  const durationDiffPercent = apiRoute.success && localRoute.success
    ? Math.abs((localRoute.duration - apiRoute.duration) / apiRoute.duration) * 100
    : null;
  
  return {
    apiRoute,
    localRoute,
    comparison: {
      distanceDiff: localRoute.distance - apiRoute.distance,
      distanceDiffPercent,
      durationDiff: localRoute.duration - apiRoute.duration,
      durationDiffPercent,
      bothSucceeded: apiRoute.success && localRoute.success
    }
  };
};

/**
 * Format distance in a human-readable way
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string} - Formatted distance
 */
export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(2)} km`;
  }
};

/**
 * Format duration in a human-readable way
 * @param {number} durationInSeconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
export const formatDuration = (durationInSeconds) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.round(durationInSeconds % 60);
  
  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  } else if (minutes > 0) {
    return `${minutes} min ${seconds} s`;
  } else {
    return `${seconds} s`;
  }
}; 