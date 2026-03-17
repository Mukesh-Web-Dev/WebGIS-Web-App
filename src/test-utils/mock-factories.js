/**
 * Test Utilities - Mock Factories
 * 
 * Factory functions for creating mock objects used in tests.
 * Provides consistent, reusable mock data with sensible defaults.
 */

/**
 * Creates a mock OpenLayers layer object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock layer
 */
export const mockLayer = (overrides = {}) => {
  const defaults = {
    title: 'Test Layer',
    visible: true,
    opacity: 1,
    isBaseLayer: false,
  };

  const properties = { ...defaults, ...overrides };

  return {
    get: jest.fn((key) => properties[key]),
    set: jest.fn((key, value) => {
      properties[key] = value;
    }),
    getVisible: jest.fn(() => properties.visible),
    setVisible: jest.fn((visible) => {
      properties.visible = visible;
    }),
    getOpacity: jest.fn(() => properties.opacity),
    setOpacity: jest.fn((opacity) => {
      properties.opacity = opacity;
    }),
    ...overrides,
  };
};

/**
 * Creates a mock toast notification object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock toast
 */
export const mockToast = (overrides = {}) => ({
  id: `toast-${Date.now()}`,
  message: 'Test notification',
  type: 'info',
  ttl: 5000,
  ...overrides,
});

/**
 * Creates a mock upload toast object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock upload toast
 */
export const mockUploadToast = (overrides = {}) => ({
  id: `upload-${Date.now()}`,
  fileName: 'test-file.geojson',
  message: 'Processing...',
  type: 'upload',
  uploadStatus: 'reading',
  progress: 0,
  ttl: null,
  ...overrides,
});

/**
 * Creates a mock layer item object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock layer item
 */
export const mockLayerItem = (overrides = {}) => ({
  id: `layer-${Date.now()}`,
  title: 'Test Layer',
  visible: true,
  opacity: 1,
  isBaseLayer: false,
  layer: mockLayer(),
  ...overrides,
});

/**
 * Creates a mock file object
 * @param {Object} overrides - Properties to override
 * @returns {File} Mock file
 */
export const mockFile = (overrides = {}) => {
  const {
    name = 'test-file.geojson',
    size = 1024,
    type = 'application/json',
    content = '{"type":"FeatureCollection","features":[]}',
  } = overrides;

  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  Object.defineProperty(file, 'size', { value: size });

  return file;
};
