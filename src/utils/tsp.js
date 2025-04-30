/**
 * Solves the Traveling Salesman Problem (TSP) using nearest neighbor + 2-opt
 * @param {Array<Array<Object>>} distanceMatrix - Matrix of distances/durations between points
 * @param {number} startIndex - Index of the starting point (default: 0)
 * @param {boolean} useDuration - Whether to optimize for duration instead of distance (default: true)
 * @returns {Object} - Solution with ordered indices and total cost
 */
export const solveTSP = (distanceMatrix, startIndex = 0, useDuration = true) => {
  const n = distanceMatrix.length;
  
  // If there are only 1 or 2 points, return the trivial solution
  if (n <= 1) {
    return { 
      order: [0], 
      totalDistance: 0, 
      totalDuration: 0 
    };
  }
  
  if (n === 2) {
    const route01 = distanceMatrix[0][1];
    const route10 = distanceMatrix[1][0];
    return {
      order: [0, 1, 0],
      totalDistance: route01.distance + route10.distance,
      totalDuration: route01.duration + route10.duration
    };
  }
  
  // Use nearest neighbor algorithm to find initial solution
  const order = nearestNeighbor(distanceMatrix, startIndex, useDuration);
  
  // Improve solution using 2-opt
  const improvedOrder = twoOpt(order, distanceMatrix, useDuration);
  
  // Calculate total cost
  const totalDistance = calculateTotalDistance(improvedOrder, distanceMatrix);
  const totalDuration = calculateTotalDuration(improvedOrder, distanceMatrix);
  
  return {
    order: improvedOrder,
    totalDistance,
    totalDuration
  };
};

/**
 * Nearest neighbor algorithm for TSP
 * @param {Array<Array<Object>>} distanceMatrix - Matrix of distances/durations between points
 * @param {number} startIndex - Index of the starting point
 * @param {boolean} useDuration - Whether to optimize for duration instead of distance
 * @returns {Array<number>} - Order of visits as indices
 */
const nearestNeighbor = (distanceMatrix, startIndex, useDuration) => {
  const n = distanceMatrix.length;
  const visited = new Array(n).fill(false);
  const order = [startIndex];
  
  visited[startIndex] = true;
  
  // Add n-1 points
  for (let i = 1; i < n; i++) {
    const lastPoint = order[order.length - 1];
    let bestNextPoint = -1;
    let bestCost = Infinity;
    
    // Find the nearest unvisited point
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const route = distanceMatrix[lastPoint][j];
        const cost = useDuration ? route.duration : route.distance;
        
        if (cost < bestCost && route.success) {
          bestCost = cost;
          bestNextPoint = j;
        }
      }
    }
    
    if (bestNextPoint !== -1) {
      order.push(bestNextPoint);
      visited[bestNextPoint] = true;
    }
  }
  
  // Add the start point at the end to complete the cycle
  order.push(startIndex);
  
  return order;
};

/**
 * 2-opt improvement algorithm
 * @param {Array<number>} initialOrder - Initial order of visits
 * @param {Array<Array<Object>>} distanceMatrix - Matrix of distances/durations between points
 * @param {boolean} useDuration - Whether to optimize for duration instead of distance
 * @returns {Array<number>} - Improved order of visits
 */
const twoOpt = (initialOrder, distanceMatrix, useDuration) => {
  let bestOrder = [...initialOrder];
  let improvement = true;
  let iterations = 0;
  const maxIterations = 1000; // Limit the number of iterations for large problems
  
  while (improvement && iterations < maxIterations) {
    improvement = false;
    iterations++;
    
    const currentCost = useDuration 
      ? calculateTotalDuration(bestOrder, distanceMatrix)
      : calculateTotalDistance(bestOrder, distanceMatrix);
    
    // Try all possible 2-opt swaps
    for (let i = 1; i < bestOrder.length - 2; i++) {
      for (let j = i + 1; j < bestOrder.length - 1; j++) {
        // Create new order with the segment between i and j reversed
        const newOrder = [...bestOrder];
        let left = i;
        let right = j;
        
        while (left < right) {
          // Swap
          const temp = newOrder[left];
          newOrder[left] = newOrder[right];
          newOrder[right] = temp;
          
          left++;
          right--;
        }
        
        // Calculate new cost
        const newCost = useDuration
          ? calculateTotalDuration(newOrder, distanceMatrix)
          : calculateTotalDistance(newOrder, distanceMatrix);
        
        // If better, update best order
        if (newCost < currentCost) {
          bestOrder = newOrder;
          improvement = true;
          break;
        }
      }
      
      if (improvement) break;
    }
  }
  
  return bestOrder;
};

/**
 * Calculate total distance of a route
 * @param {Array<number>} order - Order of visits as indices
 * @param {Array<Array<Object>>} distanceMatrix - Matrix of distances between points
 * @returns {number} - Total distance
 */
const calculateTotalDistance = (order, distanceMatrix) => {
  let totalDistance = 0;
  
  for (let i = 0; i < order.length - 1; i++) {
    const from = order[i];
    const to = order[i + 1];
    const route = distanceMatrix[from][to];
    
    if (route.success) {
      totalDistance += route.distance;
    }
  }
  
  return totalDistance;
};

/**
 * Calculate total duration of a route
 * @param {Array<number>} order - Order of visits as indices
 * @param {Array<Array<Object>>} distanceMatrix - Matrix of durations between points
 * @returns {number} - Total duration
 */
const calculateTotalDuration = (order, distanceMatrix) => {
  let totalDuration = 0;
  
  for (let i = 0; i < order.length - 1; i++) {
    const from = order[i];
    const to = order[i + 1];
    const route = distanceMatrix[from][to];
    
    if (route.success) {
      totalDuration += route.duration;
    }
  }
  
  return totalDuration;
}; 