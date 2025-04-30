import axios from 'axios';

// Cache for geocoding results to avoid duplicate requests
const geocodeCache = {};

/**
 * Geocodes an address using Nominatim API
 * @param {string} address - The address to geocode
 * @param {boolean} limit - Maximum number of results
 * @returns {Promise<Object>} - Geocoding result with lat/lon
 */
export const geocodeAddress = async (address, limit = 1) => {
  // Check cache first
  if (geocodeCache[address]) {
    return geocodeCache[address];
  }

  try {
    // Add "Almaty" to the query if not present to focus on Almaty city
    const searchQuery = address.toLowerCase().includes('almaty') 
      ? address 
      : `${address}, Almaty`;
    
    // Use Nominatim API
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: searchQuery,
        format: 'json',
        limit,
        'accept-language': 'ru,en', // Prioritize Russian and English results
        countrycodes: 'kz', // Limit to Kazakhstan
      },
      headers: {
        'User-Agent': 'RoutePlannerApp/1.0' // Required by Nominatim
      }
    });

    // Throttle requests to comply with Nominatim usage policy
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (response.data && response.data.length > 0) {
      const result = {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
        displayName: response.data[0].display_name
      };
      
      // Cache the result
      geocodeCache[address] = result;
      return result;
    }
    
    throw new Error(`Address not found: ${address}`);
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Batch geocode multiple addresses
 * @param {Array<string>} addresses - Array of addresses to geocode
 * @returns {Promise<Array<Object>>} - Array of geocoding results
 */
export const batchGeocodeAddresses = async (addresses) => {
  const results = [];
  
  // Process addresses sequentially to respect rate limits
  for (const address of addresses) {
    try {
      const result = await geocodeAddress(address);
      results.push({
        address,
        ...result
      });
    } catch (error) {
      results.push({
        address,
        error: error.message
      });
    }
  }
  
  return results;
}; 