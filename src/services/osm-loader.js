const axios = require('axios');

/**
 * IndexedDB wrapper for OSM data storage
 */
const osmStorage = {
  DB_NAME: 'osmRouterDB',
  DB_VERSION: 1,
  STORE_NAME: 'roadNetworks',

  /**
   * Open IndexedDB connection
   * @returns {Promise<IDBDatabase>}
   */
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  },

  /**
   * Save road network data to IndexedDB
   * @param {Object} roadNetwork - Road network data
   * @param {string} id - Identifier for the data
   * @returns {Promise<void>}
   */
  async saveRoadNetwork(roadNetwork, id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      // Add metadata to the roadNetwork object
      const dataToStore = {
        id,
        roadNetwork,
        timestamp: Date.now()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(dataToStore);
        
        request.onsuccess = () => {
          console.log(`Road network saved with ID: ${id}`);
          resolve();
        };
        
        request.onerror = () => {
          reject(new Error('Error saving road network data to IndexedDB'));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error in saveRoadNetwork:', error);
      throw error;
    }
  },

  /**
   * Load road network data from IndexedDB
   * @param {string} id - Identifier for the data
   * @returns {Promise<Object|null>} - Road network data or null if not found
   */
  async loadRoadNetwork(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          if (request.result) {
            console.log(`Road network loaded with ID: ${id}`);
            resolve(request.result.roadNetwork);
          } else {
            console.log(`Road network with ID ${id} not found`);
            resolve(null);
          }
        };
        
        request.onerror = () => {
          reject(new Error('Error loading road network data from IndexedDB'));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error in loadRoadNetwork:', error);
      return null;
    }
  }
};

/**
 * Download OSM data for a specific area using Overpass API
 * @param {Object} bounds - Bounding box {minLat, minLon, maxLat, maxLon}
 * @returns {Promise<Object>} - OSM data in JSON format
 */
const downloadOsmData = async (bounds) => {
  try {
    // Create Overpass query to get roads and intersections
    const query = `
      [out:json][timeout:90];
      (
        way[highway](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
        node(w);
      );
      out body;
      >;
      out skel qt;
    `;
    
    // Use Overpass API to get data
    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading OSM data:', error);
    throw error;
  }
};

/**
 * Process OSM data into a road network format
 * @param {Object} osmData - Raw OSM data from Overpass API
 * @returns {Object} - Road network with nodes and edges
 */
const processOsmData = (osmData) => {
  // Initialize road network
  const roadNetwork = {
    nodes: {},
    edges: []
  };
  
  // First pass: process all nodes
  const nodes = osmData.elements.filter(el => el.type === 'node');
  nodes.forEach(node => {
    roadNetwork.nodes[node.id] = {
      id: node.id.toString(),
      lat: node.lat,
      lon: node.lon,
      tags: node.tags || {}
    };
  });
  
  // Second pass: process all ways (roads)
  const ways = osmData.elements.filter(el => el.type === 'way' && el.tags && el.tags.highway);
  ways.forEach(way => {
    // Get road properties
    const isOneway = way.tags.oneway === 'yes' || way.tags.oneway === '1' || way.tags.highway === 'motorway';
    const isReversedOneway = way.tags.oneway === '-1';
    const speed = getSpeedFromTags(way.tags);
    
    // Process all nodes in the way
    for (let i = 0; i < way.nodes.length - 1; i++) {
      const fromNodeId = way.nodes[i].toString();
      const toNodeId = way.nodes[i + 1].toString();
      
      // Skip if nodes don't exist in our nodes map
      if (!roadNetwork.nodes[fromNodeId] || !roadNetwork.nodes[toNodeId]) {
        continue;
      }
      
      // Calculate distance between nodes
      const distance = calculateDistance(
        roadNetwork.nodes[fromNodeId],
        roadNetwork.nodes[toNodeId]
      );
      
      // Calculate duration based on distance and speed
      const duration = (distance / speed) * 3.6; // Convert to seconds
      
      // Create forward edge
      roadNetwork.edges.push({
        id: `${fromNodeId}-${toNodeId}`,
        from: fromNodeId,
        to: toNodeId,
        distance: distance,
        duration: duration,
        wayId: way.id,
        tags: way.tags,
        oneway: isOneway ? 'yes' : (isReversedOneway ? '-1' : 'no')
      });
      
      // Create reverse edge if not one-way
      if (!isOneway && !isReversedOneway) {
        roadNetwork.edges.push({
          id: `${toNodeId}-${fromNodeId}`,
          from: toNodeId,
          to: fromNodeId,
          distance: distance,
          duration: duration,
          wayId: way.id,
          tags: way.tags,
          oneway: 'no'
        });
      }
      
      // Create reverse edge if reversed one-way
      if (isReversedOneway) {
        roadNetwork.edges.push({
          id: `${toNodeId}-${fromNodeId}`,
          from: toNodeId,
          to: fromNodeId,
          distance: distance,
          duration: duration,
          wayId: way.id,
          tags: way.tags,
          oneway: '-1'
        });
      }
    }
  });
  
  return roadNetwork;
};

/**
 * Get the speed for a road based on its tags
 * @param {Object} tags - OSM way tags
 * @returns {number} - Speed in km/h
 */
const getSpeedFromTags = (tags) => {
  // If maxspeed is specified, use that
  if (tags.maxspeed) {
    const speed = parseInt(tags.maxspeed);
    if (!isNaN(speed)) {
      return speed;
    }
  }
  
  // Otherwise estimate based on road type
  const highwayType = tags.highway;
  switch (highwayType) {
    case 'motorway':
      return 110;
    case 'trunk':
      return 90;
    case 'primary':
      return 70;
    case 'secondary':
      return 60;
    case 'tertiary':
      return 50;
    case 'residential':
      return 40;
    case 'service':
      return 30;
    case 'living_street':
      return 20;
    default:
      return 50; // Default speed
  }
};

/**
 * Calculate the distance between two nodes using Haversine formula
 * @param {Object} node1 - First node with lat and lon
 * @param {Object} node2 - Second node with lat and lon
 * @returns {number} - Distance in meters
 */
const calculateDistance = (node1, node2) => {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (node1.lat * Math.PI) / 180;
  const φ2 = (node2.lat * Math.PI) / 180;
  const Δφ = ((node2.lat - node1.lat) * Math.PI) / 180;
  const Δλ = ((node2.lon - node1.lon) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

/**
 * Load Almaty road network data
 * @param {boolean} forceDownload - Whether to force download even if local data exists
 * @returns {Promise<Object>} - Road network data
 */
const loadAlmatyRoadNetwork = async (forceDownload = false) => {
  const networkId = 'almaty_road_network';
  
  // Try to load from IndexedDB first, unless forced to download
  if (!forceDownload) {
    const localData = await osmStorage.loadRoadNetwork(networkId);
    if (localData) {
      return localData;
    }
  }
  
  // If no local data or forced download, get data from OSM
  // Bounding box for Almaty city
  const almatyBounds = {
    minLat: 43.1981,
    minLon: 76.7800,
    maxLat: 43.3507,
    maxLon: 77.0729
  };
  
  try {
    console.log('Downloading OSM data for Almaty...');
    const osmData = await downloadOsmData(almatyBounds);
    
    console.log('Processing OSM data into road network...');
    const roadNetwork = processOsmData(osmData);
    
    console.log(`Road network created with ${Object.keys(roadNetwork.nodes).length} nodes and ${roadNetwork.edges.length} edges`);
    
    // Save to IndexedDB for future use
    await osmStorage.saveRoadNetwork(roadNetwork, networkId);
    
    return roadNetwork;
  } catch (error) {
    console.error('Failed to load Almaty road network:', error);
    throw error;
  }
};

// Export all functions
module.exports = {
  downloadOsmData,
  processOsmData,
  loadAlmatyRoadNetwork
}; 