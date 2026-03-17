/**
 * File Utilities
 * 
 * High-level file utilities for GIS data processing.
 * Refactored to use modular projection and GeoJSON parsing utilities.
 */

// Re-export core parsing functionality from specialized modules
export { parseGeoJSONFeatures } from './openlayers/geoJSONParser';
export { looksLikeLonLat, EPSG_CODES, getDataProjection } from './openlayers/projectionUtils';

