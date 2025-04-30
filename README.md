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
- Geocoding by [Nominatim](https://nominatim.org/) 