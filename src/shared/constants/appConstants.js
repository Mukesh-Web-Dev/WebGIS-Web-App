/**
 * Application Constants
 * 
 * Application-wide constant values.
 */

// File upload constraints
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const SUPPORTED_FILE_TYPES = [
  '.json',
  '.geojson',
  '.kml',
  '.kmz',
  '.zip'
];

// Toast notification durations
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
  ERROR: 8000
};

// Layer defaults
export const DEFAULT_LAYER_OPACITY = 1.0;
export const DEFAULT_LAYER_COLOR = '#319FD3';

// Map defaults
export const DEFAULT_MAP_CENTER = [0, 0];
export const DEFAULT_MAP_ZOOM = 2;
export const MAX_MAP_ZOOM = 20;
export const MIN_MAP_ZOOM = 1;

// Storage keys
export const STORAGE_KEYS = {
  LAYER_STATE: 'layerState',
  USER_PREFERENCES: 'userPreferences',
  MAP_VIEW: 'mapView'
};
