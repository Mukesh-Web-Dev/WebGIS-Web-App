/**
 * File Service
 * 
 * Utilities for file reading, validation, and format detection.
 * Handles various GIS file formats including GeoJSON, KML, GPX, and Shapefiles.
 */

import { MAX_FILE_BYTES } from '../utils/constants';

/**
 * Reads a file as text
 * 
 * @param {FileReader} reader - FileReader instance
 * @param {File} file - File to read
 * @returns {Promise<string>} File content as text
 * 
 * @example
 * const reader = new FileReader();
 * const content = await readAsText(reader, file);
 */
export const readAsText = (reader, file) =>
  new Promise((resolve, reject) => {
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });

/**
 * Reads a file as ArrayBuffer
 * 
 * @param {FileReader} reader - FileReader instance
 * @param {File} file - File to read
 * @returns {Promise<ArrayBuffer>} File content as ArrayBuffer
 * 
 * @example
 * const reader = new FileReader();
 * const buffer = await readAsArrayBuffer(reader, file);
 */
export const readAsArrayBuffer = (reader, file) =>
  new Promise((resolve, reject) => {
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });

/**
 * Validates file size
 * 
 * @param {File} file - File to validate
 * @param {number} [maxBytes=MAX_FILE_BYTES] - Maximum allowed size in bytes
 * @returns {Object} Validation result
 * @returns {boolean} valid - Whether file is valid
 * @returns {string} [error] - Error message if invalid
 * 
 * @example
 * const { valid, error } = validateFileSize(file);
 * if (!valid) console.error(error);
 */
export const validateFileSize = (file, maxBytes = MAX_FILE_BYTES) => {
  if (file.size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(1);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${fileMB} MB). Max: ${maxMB} MB`
    };
  }
  return { valid: true };
};

/**
 * Detects file format from filename
 * 
 * @param {string} filename - Name of the file
 * @returns {Object} Format information
 * @returns {string} format - File format (geojson, kml, gpx, shp, zip, unknown)
 * @returns {boolean} isGIS - Whether it's a recognized GIS format
 * 
 * @example
 * const { format, isGIS } = detectFileFormat("data.geojson");
 * // { format: "geojson", isGIS: true }
 */
export const detectFileFormat = (filename) => {
  const lower = filename.toLowerCase();
  
  if (lower.endsWith('.json') || lower.endsWith('.geojson')) {
    return { format: 'geojson', isGIS: true };
  }
  if (lower.endsWith('.kml')) {
    return { format: 'kml', isGIS: true };
  }
  if (lower.endsWith('.gpx')) {
    return { format: 'gpx', isGIS: true };
  }
  if (lower.endsWith('.shp')) {
    return { format: 'shp', isGIS: true };
  }
  if (lower.endsWith('.zip')) {
    return { format: 'zip', isGIS: true }; // Might contain shapefile
  }
  
  return { format: 'unknown', isGIS: false };
};

/**
 * Creates a unique layer name
 * 
 * @param {string} baseName - Base name for the layer
 * @param {string} [suffix=''] - Optional suffix
 * @returns {string} Unique layer name
 * 
 * @example
 * const name = createLayerName("MyLayer", "-001");
 * // "MyLayer-001"
 */
export const createLayerName = (baseName, suffix = '') => {
  const sanitized = baseName.replace(/\.[^/.]+$/, ''); // Remove extension
  return `${sanitized}${suffix}`;
};

/**
 * Formats file size for display
 * 
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 * 
 * @example
 * formatFileSize(2500000); // "2.4 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Validates if a string is valid GeoJSON
 * 
 * @param {string} jsonString - String to validate
 * @returns {Object} Validation result
 * @returns {boolean} valid - Whether string is valid GeoJSON
 * @returns {Object} [data] - Parsed GeoJSON if valid
 * @returns {string} [error] - Error message if invalid
 * 
 * @example
 * const { valid, data, error } = validateGeoJSON(content);
 */
export const validateGeoJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.type) {
      return { valid: false, error: 'Missing "type" property' };
    }
    
    const validTypes = ['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
    
    if (!validTypes.includes(data.type)) {
      return { valid: false, error: `Invalid type: ${data.type}` };
    }
    
    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
