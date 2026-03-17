/**
 * Layer Service
 * 
 * Centralized service for layer operations including color changes,
 * zoom functionality, and layer property extraction.
 */

/**
 * Changes the color of a vector layer
 * 
 * Creates new OpenLayers styles with the specified color for fill, stroke,
 * and point features. Automatically adds transparency to fill colors.
 * 
 * @param {ol.layer.Vector} layerObj - OpenLayers vector layer
 * @param {string} newColor - Hex color code (e.g., "#4AE661")
 * @param {Function} syncLayerList - Callback to trigger layer list refresh
 * @returns {Promise<void>}
 * 
 * @example
 * await changeLayerColor(layer, "#FF0000", syncLayerList);
 */
export const changeLayerColor = async (layerObj, newColor, syncLayerList) => {
  if (!layerObj) return;

  try {
    const { Style, Fill, Stroke, Circle: CircleStyle } = await import('ol/style');

    const newStyle = new Style({
      fill: new Fill({
        color: `${newColor}40`, // Add alpha for transparency
      }),
      stroke: new Stroke({
        color: newColor,
        width: 2,
      }),
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: newColor,
        }),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 1,
        }),
      }),
    });

    layerObj.setStyle(newStyle);
    
    if (syncLayerList) {
      syncLayerList();
    }
  } catch (error) {
    console.error('Error changing layer color:', error);
    throw error;
  }
};

/**
 * Zooms the map to fit a layer's extent
 * 
 * Calculates the bounding box of all features in the layer and
 * animates the map view to fit that extent with padding.
 * 
 * @param {ol.layer.Vector} layerObj - Layer to zoom to
 * @param {ol.Map} mapInstance - OpenLayers map instance
 * @param {Object} [options] - Zoom options
 * @param {number} [options.duration=1000] - Animation duration in ms
 * @param {number} [options.maxZoom=16] - Maximum zoom level
 * @param {Array<number>} [options.padding=[50,50,50,50]] - Padding in pixels [top, right, bottom, left]
 * @returns {boolean} Success status
 * 
 * @example
 * const success = zoomToLayer(layer, map, { maxZoom: 18 });
 */
export const zoomToLayer = (layerObj, mapInstance, options = {}) => {
  if (!layerObj || !mapInstance) return false;

  const {
    duration = 1000,
    maxZoom = 16,
    padding = [50, 50, 50, 50]
  } = options;

  try {
    const source = layerObj.getSource();
    if (!source) {
      console.warn('Layer has no source');
      return false;
    }

    const extent = source.getExtent();
    
    if (!extent || !extent.every(val => isFinite(val))) {
      console.warn('Layer has no valid extent');
      return false;
    }

    mapInstance.getView().fit(extent, {
      size: mapInstance.getSize(),
      padding,
      duration,
      maxZoom,
    });

    return true;
  } catch (error) {
    console.error('Error zooming to layer:', error);
    return false;
  }
};

/**
 * Extracts the color from a layer's style
 * 
 * Attempts to retrieve the stroke or fill color from a layer's style.
 * Returns a default color if extraction fails.
 * 
 * @param {ol.layer.Vector} layer - Layer to extract color from
 * @returns {string} Color as CSS string (hex, rgb, or rgba)
 * 
 * @example
 * const color = getLayerColor(layer); // "#4AE661"
 */
export const getLayerColor = (layer) => {
  const DEFAULT_COLOR = '#4AE661';

  try {
    const styleRaw = typeof layer.getStyle === 'function' ? layer.getStyle() : null;
    if (!styleRaw) return DEFAULT_COLOR;

    const resolved = typeof styleRaw === 'function' ? styleRaw(layer) : styleRaw;
    const styleObj = Array.isArray(resolved) && resolved.length ? resolved[0] : resolved;
    
    if (!styleObj) return DEFAULT_COLOR;

    const stroke = styleObj.getStroke?.();
    const fill = styleObj.getFill?.();
    const col = (stroke?.getColor?.()) || (fill?.getColor?.());

    if (!col) return DEFAULT_COLOR;
    
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
    return DEFAULT_COLOR;
  }
};

/**
 * Checks if a layer is a vector layer (supports color changes)
 * 
 * @param {ol.layer.Layer} layer - Layer to check
 * @returns {boolean} True if vector layer
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
