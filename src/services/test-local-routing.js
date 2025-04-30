const path = require('path');
// Temporarily adjust require path if routing.js isn't directly exportable/runnable under node
// This assumes routing.js is structured with module.exports
const { 
    loadRoadNetworkData, 
    findNearestNode, 
    calculateRoute,
    dijkstra, // Keep dijkstra if we want to test it separately later
    createLineStringFromPath // Import this function
} = require('./routing.js'); 

// --- Test Configuration ---
const point1 = { name: "Курмангазы 155", lat: 43.2422465, lon: 76.9026493 };
const point2 = { name: "Муратбаева 183", lat: 43.2490378, lon: 76.9186243 };
const SEARCH_RADIUS = 1000; // Radius for findNearestNode (meters)

// --- Test Execution ---
async function runLocalRouteTest() {
    console.log("--- Starting Local Routing Test ---");

    // 1. Load Road Network Data
    console.log("\n1. Loading Road Network Data...");
    // Adjust path relative to where routing.js expects it or provide absolute path
    // NOTE: fetch() is not available in standard Node.js, routing.js needs adjustment
    //       or we need to load the file directly here using 'fs'.
    //       Let's try loading directly with fs for this test script.
    
    let roadNetwork;
    try {
        const networkPath = path.join(__dirname, '../../osm-data/almaty_road_network.json');
        console.log(`Attempting to load network from: ${networkPath}`);
        const rawData = require('fs').readFileSync(networkPath, 'utf8');
        roadNetwork = JSON.parse(rawData);
        console.log("Road network loaded successfully via fs.");
        console.log(`Nodes: ${Object.keys(roadNetwork.nodes || {}).length}, Edges: ${(roadNetwork.edges || []).length}`);
        if (!roadNetwork.nodes || !roadNetwork.edges) {
             throw new Error("Loaded network is missing 'nodes' or 'edges' key.");
        }
    } catch (error) {
        console.error("Error loading road network directly:", error);
        console.log("--- Test Failed: Could not load network data ---");
        return; // Stop the test if data can't load
    }


    // 2. Find Nearest Nodes
    console.log("\n2. Finding Nearest Nodes...");
    const startNode = findNearestNode(point1, roadNetwork.nodes, SEARCH_RADIUS);
    const endNode = findNearestNode(point2, roadNetwork.nodes, SEARCH_RADIUS);

    if (!startNode || !endNode) {
        console.error("Error: Could not find nearest node(s).");
        if (!startNode) console.log(`Failed for point1: ${point1.name}`);
        if (!endNode) console.log(`Failed for point2: ${point2.name}`);
        console.log("--- Test Failed: Node finding error ---");
        return; 
    }
    console.log(`Nearest node for ${point1.name}: ID ${startNode.id}`);
    console.log(`Nearest node for ${point2.name}: ID ${endNode.id}`);


    // --- MODIFICATION: Force start node for testing ---
    const forcedStartNodeId = "11287949279"; // Use the second nearest node found previously
    console.log(`\n!!! MODIFICATION: Forcing start node to ${forcedStartNodeId} instead of ${startNode.id} !!!\n`);
    // --- End Modification ---

    // 3. Calculate Route using the function from routing.js
    // console.log(`\n3. Calculating Route between node ${startNode.id} and ${endNode.id}...`);
    // const routeResult = calculateRoute(point1, point2, roadNetwork); // Pass original points and network

    // --- MODIFICATION: Call dijkstra directly with forced start node --- 
    console.log(`\n3. Calculating Route DIRECTLY between node ${forcedStartNodeId} and ${endNode.id} using Dijkstra...`);
    const dijkstraResult = dijkstra(roadNetwork, forcedStartNodeId, endNode.id);
    console.log("\n--- Dijkstra Direct Result ---");
    console.log(JSON.stringify(dijkstraResult, null, 2));

    // --- Reconstruct result similar to calculateRoute for comparison ---
    let routeResult;
    if (dijkstraResult.path && dijkstraResult.path.length > 0) {
        const geometry = createLineStringFromPath(dijkstraResult.path, roadNetwork.nodes);
        routeResult = {
            distance: dijkstraResult.distance,
            duration: dijkstraResult.duration,
            path: dijkstraResult.path,
            geometry: geometry,
            success: true,
            error: null
        };
    } else {
        routeResult = {
            distance: 0,
            duration: 0,
            path: [],
            geometry: null,
            success: false,
            error: "No route found between these points (Direct Dijkstra Call)"
        };
    }
    // --- End Modification ---

    console.log("\n--- Full Reconstructed routeResult ---");
    console.log(JSON.stringify(routeResult, null, 2));

    if (routeResult.success) {
        console.log("\nRoute found successfully!");
        console.log(`Distance: ${routeResult.distance.toFixed(2)} meters`);
        console.log(`Duration: ${routeResult.duration.toFixed(2)} seconds`);
        console.log(`Path Nodes: ${routeResult.path.join(' -> ')}`);
        console.log(`Geometry Coordinates Count: ${routeResult.geometry?.coordinates?.length || 0}`);
    } else {
        console.log("\nRoute calculation failed.");
        console.log(`Error: ${routeResult.error}`);
    }
    
    console.log("\n--- Test Finished ---");
}

// --- Run the test ---
runLocalRouteTest(); 