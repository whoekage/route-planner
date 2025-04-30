<<<<<<< HEAD
const axios = require('axios');

// Предзагруженные данные дорожной сети Алматы
let almatyRoadNetwork = null;
=======
import axios from 'axios';
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a

// OSRM API base URL
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving/';

<<<<<<< HEAD
// Попытка загрузить предзагруженные данные
try {
  almatyRoadNetwork = require('../data/almaty_road_network.json');
  console.log('Загружены предзагруженные данные дорожной сети Алматы');
} catch (error) {
  console.warn('Не удалось загрузить предзагруженные данные:', error);
}

=======
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
/**
 * Calculate route between two points
 * @param {Object} start - Start coordinates {lat, lon}
 * @param {Object} end - End coordinates {lat, lon}
 * @returns {Promise<Object>} - Route information with distance and duration
 */
<<<<<<< HEAD
const calculateRoute = (start, end, roadNetwork) => {
  try {
    // Find nearest nodes in the graph to the start and end coordinates
    const startNode = findNearestNode(start, roadNetwork.nodes);
    const endNode = findNearestNode(end, roadNetwork.nodes);
    
    if (!startNode || !endNode) {
      throw new Error('Could not find nearby road network nodes');
    }
    
    // Perform Dijkstra's algorithm to find shortest path
    const result = dijkstra(roadNetwork, startNode.id, endNode.id);
    
    if (!result.path.length) {
      throw new Error('No route found between these points');
    }
    
    return {
      distance: result.distance, // in meters
      duration: result.duration, // in seconds
      path: result.path,
      geometry: createLineStringFromPath(result.path, roadNetwork.nodes),
      success: true
    };
  } catch (error) {
    console.error('Local routing error:', error);
    return {
      distance: 0,
      duration: 0,
      path: [],
      geometry: null,
=======
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
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
      success: false,
      error: error.message
    };
  }
};

/**
<<<<<<< HEAD
 * Find the nearest node in the road network to the given coordinates
 * @param {Object} point - Coordinates {lat, lon}
 * @param {Array} nodes - Array of network nodes with coordinates
 * @returns {Object} - Nearest node
 */
const findNearestNode = (point, nodes) => {
  let nearestNode = null;
  let minDistance = Infinity;
  
  // Use for...in to iterate over object properties
  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const distance = calculateHaversineDistance(
      { lat: point.lat, lon: point.lon },
      { lat: node.lat, lon: node.lon }
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = node;
    }
  }
  
  return nearestNode;
};

/**
 * Calculate the Haversine distance between two points (great-circle distance)
 * @param {Object} point1 - First point {lat, lon}
 * @param {Object} point2 - Second point {lat, lon}
 * @returns {number} - Distance in meters
 */
const calculateHaversineDistance = (point1, point2) => {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lon - point1.lon) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

/**
 * Dijkstra's algorithm implementation for finding shortest path in a road network
 * @param {Object} roadNetwork - Graph representing the road network
 * @param {string} startNodeId - ID of the start node
 * @param {string} endNodeId - ID of the end node
 * @returns {Object} - Path, total distance and duration
 */
const dijkstra = (roadNetwork, startNodeId, endNodeId) => {
  // Initialize data structures
  const distances = {};
  const durations = {};
  const previous = {};
  const unvisited = new Set();
  
  // Initialize all nodes with infinite distance
  for (const nodeId in roadNetwork.nodes) {
    distances[nodeId] = Infinity;
    durations[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  }
  
  // Set distance to start node as 0
  distances[startNodeId] = 0;
  durations[startNodeId] = 0;
  
  // Main Dijkstra loop
  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current = null;
    let minDistance = Infinity;
    
    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        current = nodeId;
      }
    }
    
    // If we've reached the target or there's no path
    if (current === null || current === endNodeId || minDistance === Infinity) {
      break;
    }
    
    // Remove current from unvisited
    unvisited.delete(current);
    
    // Check all neighbors
    const edges = roadNetwork.edges.filter(edge => edge.from === current);
    
    for (const edge of edges) {
      // Skip if one-way and wrong direction
      if (edge.oneway && edge.oneway === 'yes' && edge.from !== current) {
        continue;
      }
      if (edge.oneway && edge.oneway === '-1' && edge.to !== current) {
        continue;
      }
      
      const neighbor = edge.to;
      
      // Skip if neighbor already processed
      if (!unvisited.has(neighbor)) {
        continue;
      }
      
      // Calculate new distance and duration
      const newDistance = distances[current] + edge.distance;
      const newDuration = durations[current] + edge.duration;
      
      // Update if better route found
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        durations[neighbor] = newDuration;
        previous[neighbor] = current;
      }
    }
  }
  
  // Reconstruct path
  const path = [];
  let current = endNodeId;
  
  // If no path found
  if (previous[endNodeId] === null && endNodeId !== startNodeId) {
    return { path: [], distance: 0, duration: 0 };
  }
  
  // Build path from end to start, then reverse
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  return {
    path,
    distance: distances[endNodeId],
    duration: durations[endNodeId]
  };
};

/**
 * Create a GeoJSON LineString from a path of node IDs
 * @param {Array} path - Array of node IDs representing the path
 * @param {Object} nodes - Map of node IDs to node objects with coordinates
 * @returns {Object} - GeoJSON LineString geometry
 */
const createLineStringFromPath = (path, nodes) => {
  const coordinates = path.map(nodeId => {
    const node = nodes[nodeId];
    return [node.lon, node.lat]; // GeoJSON uses [longitude, latitude] format
  });
  
  return {
    type: 'LineString',
    coordinates
  };
};

/**
=======
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
 * Calculate distance matrix between multiple points
 * @param {Array<Object>} points - Array of points with {lat, lon}
 * @returns {Promise<Array<Array<Object>>>} - Matrix of routes between points
 */
<<<<<<< HEAD
const calculateDistanceMatrix = async (points) => {
=======
export const calculateDistanceMatrix = async (points) => {
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
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
<<<<<<< HEAD
        // Use local calculation if road network is available
        if (almatyRoadNetwork) {
          const route = calculateRoute(points[i], points[j], almatyRoadNetwork);
          row.push(route);
        } else {
          // Fallback to API
          try {
            const fromPoint = `${points[i].lon},${points[i].lat}`;
            const toPoint = `${points[j].lon},${points[j].lat}`;
            const url = `${OSRM_API}${fromPoint};${toPoint}?overview=false`;
            const response = await axios.get(url);
            
            if (response.data && response.data.routes && response.data.routes.length > 0) {
              const route = response.data.routes[0];
              row.push({
                distance: route.distance,
                duration: route.duration,
                success: true
              });
            } else {
              row.push({ distance: 0, duration: 0, success: false });
            }
          } catch (error) {
            console.error('Matrix API error:', error);
            row.push({ distance: 0, duration: 0, success: false });
          }
          
          // Add a small delay between API calls
          await new Promise(resolve => setTimeout(resolve, 200));
        }
=======
        // Calculate actual route
        const route = await calculateRoute(points[i], points[j]);
        row.push(route);
        
        // Add a small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 200));
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
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
<<<<<<< HEAD
const getFullRoute = async (orderedPoints) => {
  try {
    // Try using local data first if available
    if (almatyRoadNetwork) {
      return getFullRouteLocal(orderedPoints, almatyRoadNetwork);
    }
    
    // Fallback to OSRM API
=======
export const getFullRoute = async (orderedPoints) => {
  try {
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
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
<<<<<<< HEAD
        source: 'osrm-api',
=======
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
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
<<<<<<< HEAD
      source: 'none',
      error: error.message
    };
  }
};

/**
 * Get full route details between ordered points using local road network data
 * @param {Array<Object>} orderedPoints - Array of points in visit order with {lat, lon}
 * @param {Object} roadNetwork - Road network data with nodes and edges
 * @returns {Object} - Detailed route with geometry
 */
const getFullRouteLocal = async (orderedPoints, roadNetwork) => {
  try {
    let totalDistance = 0;
    let totalDuration = 0;
    const allCoordinates = [];
    
    // Calculate routes between consecutive points
    for (let i = 0; i < orderedPoints.length - 1; i++) {
      const start = orderedPoints[i];
      const end = orderedPoints[i + 1];
      
      const segmentRoute = calculateRoute(start, end, roadNetwork);
      
      if (!segmentRoute.success) {
        throw new Error(`Failed to calculate route segment ${i}`);
      }
      
      totalDistance += segmentRoute.distance;
      totalDuration += segmentRoute.duration;
      
      // Add coordinates from this segment (avoiding duplicates)
      if (i === 0) {
        // For first segment, add all coordinates
        allCoordinates.push(...segmentRoute.geometry.coordinates);
      } else {
        // For other segments, skip the first point to avoid duplicates
        allCoordinates.push(...segmentRoute.geometry.coordinates.slice(1));
      }
    }
    
    return {
      distance: totalDistance,
      duration: totalDuration,
      geometry: {
        type: 'LineString',
        coordinates: allCoordinates
      },
      source: 'local-osm',
      success: true
    };
  } catch (error) {
    console.error('Local routing error:', error);
    return {
      distance: 0,
      duration: 0,
      geometry: null,
      success: false,
      source: 'none',
      error: error.message
    };
  }
};

module.exports = {
  calculateRoute,
  calculateDistanceMatrix,
  getFullRoute,
  getFullRouteLocal
=======
      error: error.message
    };
  }
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
}; 