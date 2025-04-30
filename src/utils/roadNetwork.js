/**
 * Sample road network for central Almaty area
 * This is a simplified graph representation for demonstration purposes
 * In a real application, this data would be loaded from OpenStreetMap data
 */

/**
 * Road network structure:
 * - nodes: Object containing node IDs mapped to objects with lat/lon coordinates
 * - edges: Array of road segments with from/to node IDs, distance, duration, and oneway status
 */
export const almatyRoadNetwork = {
  nodes: {
    // Downtown area nodes
    "n1": { id: "n1", lat: 43.238949, lon: 76.889709 }, // Almaty center
    "n2": { id: "n2", lat: 43.243700, lon: 76.895000 }, // Near Republic Square
    "n3": { id: "n3", lat: 43.237800, lon: 76.899200 }, // Near Panfilov Park
    "n4": { id: "n4", lat: 43.232600, lon: 76.895400 }, // Near Green Bazaar
    "n5": { id: "n5", lat: 43.234900, lon: 76.882300 }, // Near Abai Square
    "n6": { id: "n6", lat: 43.245200, lon: 76.882200 }, // Near Almaty Tower
    "n7": { id: "n7", lat: 43.251600, lon: 76.891800 }, // Near Botanical Garden
    "n8": { id: "n8", lat: 43.227200, lon: 76.906100 }, // Near Medeu District
    "n9": { id: "n9", lat: 43.230100, lon: 76.875200 }, // Near Almaly District
    "n10": { id: "n10", lat: 43.255800, lon: 76.913900 } // Near Baganashyl
  },
  
  edges: [
    // Main roads - bidirectional
    { from: "n1", to: "n2", distance: 1200, duration: 180, oneway: "no" }, // Center to Republic Square
    { from: "n2", to: "n1", distance: 1200, duration: 180, oneway: "no" },
    
    { from: "n1", to: "n3", distance: 950, duration: 150, oneway: "no" }, // Center to Panfilov Park
    { from: "n3", to: "n1", distance: 950, duration: 150, oneway: "no" },
    
    { from: "n1", to: "n5", distance: 1100, duration: 170, oneway: "no" }, // Center to Abai Square
    { from: "n5", to: "n1", distance: 1100, duration: 170, oneway: "no" },
    
    { from: "n2", to: "n6", distance: 1500, duration: 240, oneway: "no" }, // Republic Square to Almaty Tower
    { from: "n6", to: "n2", distance: 1500, duration: 240, oneway: "no" },
    
    { from: "n2", to: "n7", distance: 1800, duration: 290, oneway: "no" }, // Republic Square to Botanical Garden
    { from: "n7", to: "n2", distance: 1800, duration: 290, oneway: "no" },
    
    { from: "n3", to: "n4", distance: 800, duration: 130, oneway: "no" }, // Panfilov Park to Green Bazaar
    { from: "n4", to: "n3", distance: 800, duration: 130, oneway: "no" },
    
    { from: "n4", to: "n8", distance: 1300, duration: 200, oneway: "no" }, // Green Bazaar to Medeu District
    { from: "n8", to: "n4", distance: 1300, duration: 200, oneway: "no" },
    
    { from: "n5", to: "n9", distance: 900, duration: 140, oneway: "no" }, // Abai Square to Almaly District
    { from: "n9", to: "n5", distance: 900, duration: 140, oneway: "no" },
    
    { from: "n7", to: "n10", distance: 2200, duration: 330, oneway: "no" }, // Botanical Garden to Baganashyl
    { from: "n10", to: "n7", distance: 2200, duration: 330, oneway: "no" },
    
    // One-way streets
    { from: "n1", to: "n6", distance: 1700, duration: 220, oneway: "yes" }, // Center to Almaty Tower (one-way)
    { from: "n6", to: "n7", distance: 1100, duration: 160, oneway: "yes" }, // Almaty Tower to Botanical Garden (one-way)
    { from: "n4", to: "n9", distance: 1900, duration: 280, oneway: "yes" }, // Green Bazaar to Almaly District (one-way)
    { from: "n8", to: "n3", distance: 1600, duration: 240, oneway: "yes" }, // Medeu District to Panfilov Park (one-way)
    { from: "n5", to: "n2", distance: 1400, duration: 210, oneway: "yes" }, // Abai Square to Republic Square (one-way)
    
    // Reverse one-way streets (using -1)
    { from: "n9", to: "n3", distance: 2100, duration: 310, oneway: "-1" }, // Technically from n3 to n9 (one-way)
    { from: "n3", to: "n9", distance: 2100, duration: 310, oneway: "-1" }, // Only this direction is allowed
    
    // Connecting roads
    { from: "n9", to: "n8", distance: 2400, duration: 360, oneway: "no" }, // Almaly District to Medeu District
    { from: "n8", to: "n9", distance: 2400, duration: 360, oneway: "no" },
    
    { from: "n10", to: "n8", distance: 3000, duration: 450, oneway: "no" }, // Baganashyl to Medeu District
    { from: "n8", to: "n10", distance: 3000, duration: 450, oneway: "no" }
  ]
};

/**
 * Function to find road network nodes within a specific area
 * @param {Object} boundingBox - {minLat, maxLat, minLon, maxLon}
 * @param {Object} roadNetwork - The complete road network
 * @returns {Object} - Filtered road network containing only nodes and edges within the bounding box
 */
export const getNetworkInBoundingBox = (boundingBox, roadNetwork) => {
  const { minLat, maxLat, minLon, maxLon } = boundingBox;
  
  // Filter nodes within bounding box
  const filteredNodes = {};
  const nodeIds = new Set();
  
  for (const nodeId in roadNetwork.nodes) {
    const node = roadNetwork.nodes[nodeId];
    if (
      node.lat >= minLat && 
      node.lat <= maxLat && 
      node.lon >= minLon && 
      node.lon <= maxLon
    ) {
      filteredNodes[nodeId] = node;
      nodeIds.add(nodeId);
    }
  }
  
  // Filter edges that connect nodes within the bounding box
  const filteredEdges = roadNetwork.edges.filter(
    edge => nodeIds.has(edge.from) && nodeIds.has(edge.to)
  );
  
  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
};

/**
 * Get estimated travel time between two points (simplified)
 * @param {number} distance - Distance in meters
 * @returns {number} - Estimated duration in seconds
 */
export const estimateDuration = (distance) => {
  // Simple formula: assuming 30 km/h average speed in city
  // 30 km/h = 8.33 m/s
  return distance / 8.33;
};

/**
 * Calculate the straight-line distance between all nodes in the network
 * Useful for creating a complete graph when road data is incomplete
 * @param {Object} roadNetwork - Road network with nodes
 * @returns {Array} - Array of edges with calculated distances and durations
 */
export const calculateStraightLineEdges = (roadNetwork) => {
  const edges = [];
  const nodeIds = Object.keys(roadNetwork.nodes);
  
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      const fromId = nodeIds[i];
      const toId = nodeIds[j];
      const fromNode = roadNetwork.nodes[fromId];
      const toNode = roadNetwork.nodes[toId];
      
      // Calculate Haversine distance
      const distance = haversineDistance(
        { lat: fromNode.lat, lon: fromNode.lon },
        { lat: toNode.lat, lon: toNode.lon }
      );
      
      // Estimate duration based on distance
      const duration = estimateDuration(distance);
      
      // Add bidirectional edges
      edges.push({
        from: fromId,
        to: toId,
        distance,
        duration,
        oneway: "no"
      });
      
      edges.push({
        from: toId,
        to: fromId,
        distance,
        duration,
        oneway: "no"
      });
    }
  }
  
  return edges;
};

/**
 * Haversine formula implementation
 * @param {Object} point1 - First point {lat, lon}
 * @param {Object} point2 - Second point {lat, lon}
 * @returns {number} - Distance in meters
 */
const haversineDistance = (point1, point2) => {
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