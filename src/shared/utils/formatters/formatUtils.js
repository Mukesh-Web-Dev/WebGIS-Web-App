/**
 * File Format Utilities
 * 
 * Utilities for detecting file formats, creating layer names,
 * and formatting file information for display.
 */

/**
 * Detects file format from filename
 * 
 * @param {string} filename - Name of the file
 * @returns {Object} Format information with format type and GIS flag
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
  if (lower.endsWith('.kmz')) {
    return { format: 'kmz', isGIS: true };
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
 * Creates a unique layer name from filename
 * 
 * @param {string} baseName - Base name for the layer
 * @param {string} [suffix=''] - Optional suffix for uniqueness
 * @returns {string} Formatted layer name
 * 
 * @example
 * const name = createLayerName("data.geojson", "-001");
 * // "data-001"
 */
export const createLayerName = (baseName, suffix = '') => {
  // Remove file extension
  const sanitized = baseName.replace(/\.[^/.]+$/, '');
  return `${sanitized}${suffix}`;
};

/**
 * Formats file size for human-readable display
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
 * Generates a unique upload ID
 * 
 * @param {string} fileName - Name of the file
 * @param {number} index - Index in upload queue
 * @returns {string} Unique upload ID
 * 
 * @example
 * const id = generateUploadId("data.geojson", 0);
 */
export const generateUploadId = (fileName, index) => {
  return `${fileName}-${index}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};
