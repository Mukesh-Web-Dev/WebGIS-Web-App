/**
 * GeoJSON Parser Utilities
 * 
 * Utilities for parsing GeoJSON with automatic projection detection.
 * Extracted from fileUtils.js for better organization.
 */

import GeoJSON from 'ol/format/GeoJSON';
import { looksLikeLonLat, EPSG_CODES } from './projectionUtils';

/**
 * Parse GeoJSON content with heuristic reprojection
 * 
 * Attempts to automatically detect whether coordinates are in lon/lat (EPSG:4326)
 * or another projection. If coordinates look like lon/lat, assumes EPSG:4326 as
 * data projection. Otherwise reads without projection conversion.
 * 
 * @param {Object|string} geojsonInput - Parsed GeoJSON object or JSON string
 * @param {import('ol/proj/Projection').default|string} mapProjection - Target map projection
 * @param {string} [dataProjectionHint] - Optional explicit data projection (e.g., 'EPSG:4326')
 * @returns {Array<import('ol/Feature').default>} Array of OpenLayers features
 * 
 * @example
 * const features = parseGeoJSONFeatures(geojsonText, 'EPSG:3857');
 */
export function parseGeoJSONFeatures(
  geojsonInput,
  mapProjection,
  dataProjectionHint
) {
  const format = new GeoJSON();
  let obj = geojsonInput;

  // Parse JSON string if needed
  if (typeof geojsonInput === 'string') {
    try {
      obj = JSON.parse(geojsonInput);
    } catch (e) {
      console.warn('Failed to parse GeoJSON string:', e);
    }
  }

  // If caller provided explicit dataProjection, use it
  if (dataProjectionHint) {
    return format.readFeatures(obj, {
      featureProjection: mapProjection,
      dataProjection: dataProjectionHint,
    });
  }

  // First try: assume coordinates are lon/lat (EPSG:4326)
  let features = [];
  try {
    features = format.readFeatures(obj, {
      featureProjection: mapProjection,
      dataProjection: EPSG_CODES.WGS84,
    });

    // Check if the parsed features look like lon/lat coordinates
    if (features && features.length && looksLikeLonLat(features)) {
      return features;
    }
  } catch (e) {
    // Ignore and try another approach
  }

  // Fallback: read without specifying dataProjection
  // (assume already in map projection)
  try {
    features = format.readFeatures(obj, {
      featureProjection: mapProjection
    });
  } catch (e) {
    console.error('Failed to parse GeoJSON:', e);
    throw e;
  }

  return features;
}
