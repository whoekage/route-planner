// Export routing functions
const routing = require('./routing');

// Export OSM loader functions
const osmLoader = require('./osm-loader');

// Combine all exports
module.exports = {
  ...routing,
  ...osmLoader
}; 