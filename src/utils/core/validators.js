/**
 * Core Validators
 * 
 * Common validation utilities used across the application.
 * Provides file validation, type checking, and data validation functions.
 */

import { MAX_FILE_BYTES } from '../constants';

/**
 * Validates file size against maximum allowed size
 * 
 * @param {File} file - File to validate
 * @param {number} [maxBytes=MAX_FILE_BYTES] - Maximum allowed size in bytes
 * @returns {Object} Validation result with valid flag and optional error message
 * 
 * @example
 * const { valid, error } = validateFileSize(file);
 * if (!valid) console.error(error);
 */
export const validateFileSize = (file, maxBytes = MAX_FILE_BYTES) => {
  if (!file || !file.size) {
    return { valid: false, error: 'Invalid file object' };
  }

  if (file.size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(1);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${fileMB} MB). Maximum: ${maxMB} MB`
    };
  }

  return { valid: true };
};

/**
 * Validates if a string is valid JSON
 * 
 * @param {string} jsonString - String to validate
 * @returns {Object} Validation result with valid flag, parsed data, and optional error
 * 
 * @example
 * const { valid, data, error } = validateJSON(content);
 */
export const validateJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Validates if a string is valid GeoJSON
 * 
 * @param {string} jsonString - String to validate
 * @returns {Object} Validation result with valid flag, parsed data, and optional error
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

    const validTypes = [
      'FeatureCollection', 'Feature', 'Point', 'LineString',
      'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon',
      'GeometryCollection'
    ];

    if (!validTypes.includes(data.type)) {
      return { valid: false, error: `Invalid type: ${data.type}` };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Checks if a value is a valid extent (bounding box)
 * 
 * @param {Array<number>} extent - Extent array [minX, minY, maxX, maxY]
 * @returns {boolean} True if extent is valid
 * 
 * @example
 * if (isValidExtent(extent)) {
 *   map.getView().fit(extent);
 * }
 */
export const isValidExtent = (extent) => {
  return (
    extent &&
    Array.isArray(extent) &&
    extent.length === 4 &&
    extent.every(val => isFinite(val))
  );
};

/**
 * Validates layer name
 * 
 * @param {string} name - Layer name to validate
 * @returns {Object} Validation result
 * 
 * @example
 * const { valid, error } = validateLayerName(newName);
 */
export const validateLayerName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Layer name must be a string' };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Layer name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Layer name too long (max 100 characters)' };
  }

  return { valid: true, name: trimmed };
};
