# Almaty Route Planner

A web application for planning optimal routes between multiple addresses in Almaty, Kazakhstan. The application uses OpenStreetMap data to find the shortest path visiting all specified locations and returning to the starting point.

## Features

- Input multiple addresses in Almaty
- Geocode addresses to coordinates using OpenStreetMap Nominatim
- Calculate optimized routes using OSRM (Open Source Routing Machine)
- Solve the Traveling Salesman Problem to minimize total travel time
- Display the route on an interactive map
- Show detailed route information including distance and estimated time

## Technologies Used

- React for the frontend
- React-Leaflet for map integration
- Bootstrap for UI components
- OpenStreetMap Nominatim API for geocoding
- OSRM API for route calculation
- Custom implementation of the TSP algorithm (nearest neighbor + 2-opt)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd route-planner
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter two or more addresses in Almaty in the input fields
2. Click "Calculate Route" to find the optimal path
3. View the route on the map with numbered markers showing the visit order
4. Check the route summary for total distance and estimated time
5. The application will automatically return to the starting point

## API Usage Limitations

- Nominatim API: Limited to 1 request per second
- OSRM API: Public instances have usage limits
- Both require proper attribution to OpenStreetMap

## License

This project uses data from OpenStreetMap, which is licensed under the Open Data Commons Open Database License (ODbL).

## Attribution

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Routing powered by [OSRM](http://project-osrm.org/)
<<<<<<< HEAD
- Geocoding by [Nominatim](https://nominatim.org/)

## Local Routing with OpenStreetMap

This application now supports local routing using OpenStreetMap data for Almaty. This allows for routing calculations to be performed locally without depending on external APIs.

### Setup

1. Install dependencies:
```
npm install
```

2. Download OSM data for Almaty (only needs to be done once):
```
npm run download-osm
```
This will download road network data for Almaty and save it in the `data` folder.

### Using Local Routing

To use local routing in your code:

```javascript
import { loadAlmatyRoadNetwork, getFullRouteLocal } from 'src/services';

// Load the road network (will use cached file if available)
const roadNetwork = await loadAlmatyRoadNetwork();

// Define waypoints
const points = [
  { lat: 43.2422465, lon: 76.9026493 },
  { lat: 43.2490378, lon: 76.9186243 },
  { lat: 43.2422465, lon: 76.9026493 }
];

// Calculate route
const route = await getFullRouteLocal(points, roadNetwork);

// Use the route data (same format as OSRM API response)
console.log(`Distance: ${route.distance} meters`);
console.log(`Duration: ${route.duration} seconds`);
// route.geometry contains the GeoJSON LineString for mapping
```

### Updating OSM Data

To update the OSM data (e.g., if roads have changed):

```
npm run download-osm
```

This will force a fresh download of the data. 
=======
- Geocoding by [Nominatim](https://nominatim.org/) 
>>>>>>> ddbf7a4912a3826fe78e0f704e7de725cd97cb5a
