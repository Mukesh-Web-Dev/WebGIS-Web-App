/**
 * OpenLayers Style Utilities
 * 
 * Centralized utilities for creating and manipulating OpenLayers styles.
 * Provides consistent style creation across the application.
 */

import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';

/**
 * Default color for vector layers
 */
export const DEFAULT_LAYER_COLOR = '#4AE661';

/**
 * Creates a standard vector layer style with the specified color
 * 
 * @param {string} color - Hex color code (e.g., "#FF5733")
 * @param {Object} [options={}] - Style options
 * @param {number} [options.strokeWidth=2] - Stroke width in pixels
 * @param {number} [options.fillOpacity=0.25] - Fill opacity (0-1)
 * @param {number} [options.pointRadius=6] - Point radius in pixels
 * @returns {Style} OpenLayers Style object
 * 
 * @example
 * const style = createVectorStyle("#FF5733");
 * layer.setStyle(style);
 */
export const createVectorStyle = (color, options = {}) => {
  const {
    strokeWidth = 2,
    fillOpacity = 0.25,
    pointRadius = 6
  } = options;

  // Convert hex to rgba for fill
  const fillColor = hexToRgba(color, fillOpacity);

  return new Style({
    stroke: new Stroke({
      color: color,
      width: strokeWidth,
    }),
    fill: new Fill({
      color: fillColor,
    }),
    image: new CircleStyle({
      radius: pointRadius,
      fill: new Fill({
        color: color,
      }),
      stroke: new Stroke({
        color: '#FFFFFF',
        width: 1,
      }),
    }),
  });
};

/**
 * Extracts color from a layer's style
 * 
 * Attempts to retrieve stroke or fill color from a layer's style.
 * Returns default color if extraction fails.
 * 
 * @param {import('ol/layer/Layer').default} layer - OpenLayers layer
 * @returns {string} Color as CSS string (hex, rgb, or rgba)
 * 
 * @example
 * const color = getLayerColor(layer); // "#4AE661"
 */
export const getLayerColor = (layer) => {
  try {
    const styleRaw = typeof layer.getStyle === 'function' ? layer.getStyle() : null;
    if (!styleRaw) return DEFAULT_LAYER_COLOR;

    const resolved = typeof styleRaw === 'function' ? styleRaw(layer) : styleRaw;
    const styleObj = Array.isArray(resolved) && resolved.length ? resolved[0] : resolved;

    if (!styleObj) return DEFAULT_LAYER_COLOR;

    const stroke = styleObj.getStroke?.();
    const fill = styleObj.getFill?.();
    const col = (stroke?.getColor?.()) || (fill?.getColor?.());

    if (!col) return DEFAULT_LAYER_COLOR;

    // Handle string colors
    if (typeof col === 'string') return col;

    // Handle array colors [r, g, b, a]
    if (Array.isArray(col)) {
      const [r, g, b, a] = col;
      return typeof a === 'number' ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    }

    return String(col);
  } catch (error) {
    console.error('Error extracting layer color:', error);
    return DEFAULT_LAYER_COLOR;
  }
};

/**
 * Converts hex color to rgba string
 * 
 * @param {string} hex - Hex color code (e.g., "#FF5733")
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 * 
 * @example
 * hexToRgba("#FF5733", 0.5); // "rgba(255, 87, 51, 0.5)"
 */
export const hexToRgba = (hex, alpha = 1) => {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Checks if a layer is a vector layer (supports styling)
 * 
 * @param {import('ol/layer/Layer').default} layer - Layer to check
 * @returns {boolean} True if layer is a vector layer
 * 
 * @example
 * if (isVectorLayer(layer)) {
 *   changeLayerColor(layer, "#FF0000");
 * }
 */
export const isVectorLayer = (layer) => {
  try {
    const source = layer.getSource();
    return source && (
      source.constructor.name === 'VectorSource' ||
      typeof source.getFeatures === 'function'
    );
  } catch (error) {
    return false;
  }
};

/**
 * Creates a default style for dropped/uploaded GIS data
 * 
 * @param {string} [color='#319FD3'] - Base color for the style
 * @returns {Style} OpenLayers Style object
 */
export const createDefaultUploadStyle = (color = '#319FD3') => {
  return new Style({
    stroke: new Stroke({ color: color, width: 2 }),
    fill: new Fill({ color: 'rgba(255, 255, 255, 0.4)' }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: color }),
    }),
  });
};
