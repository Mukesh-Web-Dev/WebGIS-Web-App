/**
 * OpenLayers Projection Utilities
 * 
 * Utilities for handling coordinate projections and transformations.
 * Includes heuristic detection of coordinate systems.
 */

/**
 * Heuristic to determine if coordinates look like lon/lat (degrees) rather than web mercator (meters)
 * 
 * Examines the first feature's coordinates to determine if they're in geographic coordinates
 * (typical range: -180 to 180 for longitude, -90 to 90 for latitude) or projected coordinates
 * (much larger values in meters).
 * 
 * @param {Array<import('ol/Feature').default>} features - Array of OpenLayers features
 * @returns {boolean} True if coordinates appear to be in lon/lat format
 * 
 * @example
 * if (looksLikeLonLat(features)) {
 *   // Use EPSG:4326 as data projection
 * }
 */
export function looksLikeLonLat(features) {
  if (!features || !features.length) return false;

  const sample = features[0];
  try {
    const geom = sample.getGeometry && sample.getGeometry();
    if (!geom || typeof geom.getCoordinates !== 'function') return false;

    const coords = geom.getCoordinates();

    // Recursively walk the coordinates tree to find the first numeric values
    const nums = findFirstNumbers(coords);
    if (!nums || nums.length < 2) return false;

    // Assume first two are lon/lat
    const lon = nums[0];
    const lat = nums[1];

    if (typeof lon !== 'number' || typeof lat !== 'number') return false;

    // Check if values are within typical lon/lat ranges
    return Math.abs(lon) <= 180 && Math.abs(lat) <= 90;
  } catch (error) {
    return false;
  }
}

/**
 * Recursively finds the first numeric coordinate values in a nested array structure
 * 
 * @param {*} node - Coordinate node to traverse
 * @returns {Array<number>} Array containing first two numeric values found
 * 
 * @private
 */
function findFirstNumbers(node) {
  if (typeof node === 'number') return [node];
  if (!node) return [];

  if (Array.isArray(node)) {
    for (const el of node) {
      const res = findFirstNumbers(el);
      if (res && res.length) return res;
    }
    return [];
  }

  return [];
}

/**
 * Common EPSG codes for reference
 */
export const EPSG_CODES = {
  WGS84: 'EPSG:4326',           // World Geodetic System 1984 (lon/lat)
  WEB_MERCATOR: 'EPSG:3857',    // Web Mercator (default for web maps)
  UTM_NORTH: 'EPSG:32600',      // UTM Northern Hemisphere (base code)
  UTM_SOUTH: 'EPSG:32700',      // UTM Southern Hemisphere (base code)
};

/**
 * Gets the default data projection based on heuristic analysis
 * 
 * @param {Array<import('ol/Feature').default>} features - Features to analyze
 * @returns {string} EPSG code for likely data projection
 * 
 * @example
 * const dataProj = getDataProjection(features);
 * // Returns 'EPSG:4326' or 'EPSG:3857'
 */
export function getDataProjection(features) {
  return looksLikeLonLat(features) ? EPSG_CODES.WGS84 : EPSG_CODES.WEB_MERCATOR;
}
