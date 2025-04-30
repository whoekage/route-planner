const axios = require('axios');

// Предзагруженные данные дорожной сети Алматы
let almatyRoadNetwork = null;

// OSRM API base URL
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving/';

// Асинхронно загружаем данные дорожной сети
const loadRoadNetworkData = async () => {
  if (almatyRoadNetwork) return almatyRoadNetwork;
  
  try {
    const response = await fetch('/data/almaty_road_network.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    almatyRoadNetwork = await response.json();
    console.log('Данные дорожной сети Алматы успешно загружены');
    console.log('Размер сети:', almatyRoadNetwork ? 
      `${Object.keys(almatyRoadNetwork.nodes).length} узлов, ${almatyRoadNetwork.edges.length} рёбер` : 'нет данных');
    return almatyRoadNetwork;
  } catch (error) {
    console.error('Ошибка загрузки данных дорожной сети:', error);
    return null;
  }
};

// Запускаем загрузку данных сразу
// loadRoadNetworkData();

/**
 * Calculate route between two points
 * @param {Object} start - Start coordinates {lat, lon}
 * @param {Object} end - End coordinates {lat, lon}
 * @returns {Promise<Object>} - Route information with distance and duration
 */
const calculateRoute = (start, end, roadNetwork) => {
  try {
    // Увеличиваем радиус поиска по мере необходимости
    const searchDistances = [100, 200, 500, 1000, 2000];
    let startNode = null;
    let endNode = null;

    // Пробуем разные радиусы поиска для начальной и конечной точек
    for (const distance of searchDistances) {
      if (!startNode) {
        startNode = findNearestNode(start, roadNetwork.nodes, distance);
      }
      if (!endNode) {
        endNode = findNearestNode(end, roadNetwork.nodes, distance);
      }
      if (startNode && endNode) break;
    }
    
    if (!startNode || !endNode) {
      throw new Error('Could not find nearby road network nodes');
    }
    
    console.log(`Расчет маршрута от ${startNode.id} до ${endNode.id}`);
    
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
      success: false,
      error: error.message
    };
  }
};

/**
 * Find the nearest node in the road network to the given coordinates
 * @param {Object} point - Coordinates {lat, lon}
 * @param {Array} nodes - Array of network nodes with coordinates
 * @param {number} maxDistance - Maximum distance to search in meters (optional)
 * @returns {Object} - Nearest node
 */
const findNearestNode = (point, nodes, maxDistance = 300) => {
  let nearestNode = null;
  let minDistance = Infinity;
  let nearbyNodes = [];
  
  console.log(`Ищем ближайший узел к точке: ${point.lat}, ${point.lon}`);
  
  // Use for...in to iterate over object properties
  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const distance = calculateHaversineDistance(
      { lat: point.lat, lon: point.lon },
      { lat: node.lat, lon: node.lon }
    );
    
    // Collect all nodes within reasonable distance for debugging
    if (distance < maxDistance) {
      nearbyNodes.push({ id: nodeId, distance, lat: node.lat, lon: node.lon });
    }
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = node;
    }
  }
  
  // Sort nearby nodes by distance for debugging
  nearbyNodes.sort((a, b) => a.distance - b.distance);
  
  // Get top 5 nearest nodes for logging
  const topNodes = nearbyNodes.slice(0, 5);
  
  if (nearestNode) {
    console.log(`Найден ближайший узел: id=${nearestNode.id}, расстояние=${minDistance.toFixed(2)}м`);
    console.log(`Ближайшие узлы (TOP 5):`, topNodes);
  } else {
    console.error(`Не найдено подходящих узлов в радиусе ${maxDistance}м`);
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
    // Find node with minimum duration (previously distance)
    let current = null;
    let minDuration = Infinity; // Use duration for finding the next node

    // Find the unvisited node with the smallest duration
    for (const nodeId of unvisited) {
      if (durations[nodeId] < minDuration) { 
        minDuration = durations[nodeId]; 
        current = nodeId;
      }
    }
    
    // DEBUG: Log current node and its duration
    // console.log(`Dijkstra: Visiting node ${current} with duration ${minDuration}`);

    // If we've reached the target or there's no path, or the smallest duration is Infinity
    if (current === null || current === endNodeId || minDuration === Infinity) {
      // DEBUG: Log why the loop is breaking
      if (current === endNodeId) {
        console.log(`Dijkstra: Reached end node ${endNodeId}`);
      } else if (minDuration === Infinity) {
        console.log(`Dijkstra: Breaking loop - minimum duration is Infinity (no reachable nodes left)`);
      } else if (current === null) {
         console.log(`Dijkstra: Breaking loop - current node is null (shouldn't happen if unvisited is not empty)`);
      }
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
      
      // Update if better route found based on duration
      if (newDuration < durations[neighbor]) { // Compare durations
        distances[neighbor] = newDistance; // Update distance as well for info
        durations[neighbor] = newDuration; // Update duration
        previous[neighbor] = current; // Path is based on shortest duration
      }
    }
  }
  
  // DEBUG: Log state after loop finishes
  console.log(`Dijkstra: Loop finished. Previous for end node ${endNodeId}:`, previous[endNodeId]);
  console.log(`Dijkstra: Duration for end node ${endNodeId}:`, durations[endNodeId]);

  // Reconstruct path (based on 'previous' which was set using duration)
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
 * Calculate distance matrix between multiple points
 * @param {Array<Object>} points - Array of points with {lat, lon}
 * @returns {Promise<Array<Array<Object>>>} - Matrix of routes between points
 */
const calculateDistanceMatrix = async (points) => {
  const matrix = [];
  
  // Сначала дождемся загрузки данных дорожной сети
  const roadNetwork = await loadRoadNetworkData();
  
  // For each start point
  for (let i = 0; i < points.length; i++) {
    const row = [];
    
    // For each end point
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        // Distance to self is 0
        row.push({ distance: 0, duration: 0, success: true });
      } else {
        // Use local calculation if road network is available
        if (roadNetwork) {
          const route = calculateRoute(points[i], points[j], roadNetwork);
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
      }
    }
    
    matrix.push(row);
  }
  
  return matrix;
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
    
    console.log('Calculating route for points:', orderedPoints);
    
    // Calculate routes between consecutive points
    for (let i = 0; i < orderedPoints.length - 1; i++) {
      const start = orderedPoints[i];
      const end = orderedPoints[i + 1];
      
      console.log(`Calculating segment ${i}: ${start.lat},${start.lon} to ${end.lat},${end.lon}`);
      
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
    
    const result = {
      distance: totalDistance,
      duration: totalDuration,
      geometry: {
        type: 'LineString',
        coordinates: allCoordinates
      },
      source: 'local-osm',
      success: true
    };
    
    console.log('Local routing complete, coordinates count:', allCoordinates.length);
    return result;
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

/**
 * Get full route details between ordered points
 * @param {Array<Object>} orderedPoints - Array of points in visit order with {lat, lon}
 * @returns {Promise<Object>} - Detailed route with geometry
 */
const getFullRoute = async (orderedPoints) => {
  let roadNetwork = null; // Declare variable here
  try {
    // Сначала дождемся загрузки данных дорожной сети
    roadNetwork = await loadRoadNetworkData();
    
    // Используем только локальные данные
    if (roadNetwork) {
      console.log('Using local OSM data for routing');
      const result = await getFullRouteLocal(orderedPoints, roadNetwork);
      console.log('Local routing result:', result);
      return result;
    } else {
      // Если нет данных дорожной сети
      throw new Error('Road network data not available');
    }
  } catch (error) {
    console.error('Routing error:', error);
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
  loadRoadNetworkData,
  findNearestNode,
  dijkstra,
  createLineStringFromPath,
  calculateHaversineDistance,
  calculateRoute,
  calculateDistanceMatrix,
  getFullRoute,
  getFullRouteLocal,
}; 