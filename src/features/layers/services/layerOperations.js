/**
 * Layer Operations Service
 * 
 * Centralized service for all layer-related operations including
 * color changes, zoom functionality, layer property extraction, and layer creation.
 * Consolidates logic previously scattered across App.js, LayerList.js, and layerService.js.
 */

import { createVectorStyle, getLayerColor as extractLayerColor, isVectorLayer } from '../utils/styleUtils';
import { isValidExtent } from '../../../shared/utils/validators/validators';

/**
 * Changes the color of a vector layer
 * 
 * Creates new OpenLayers styles with the specified color for fill, stroke,
 * and point features. Automatically adds transparency to fill colors.
 * 
 * @param {import('ol/layer/Vector').default} layerObj - OpenLayers vector layer
 * @param {string} newColor - Hex color code (e.g., "#4AE661")
 * @param {Function} [syncLayerList] - Optional callback to trigger layer list refresh
 * @returns {Promise<boolean>} Success status
 * 
 * @example
 * const success = await changeLayerColor(layer, "#FF0000", syncLayerList);
 */
export const changeLayerColor = async (layerObj, newColor, syncLayerList) => {
  if (!layerObj) return false;

  try {
    const newStyle = createVectorStyle(newColor);
    layerObj.setStyle(newStyle);

    if (syncLayerList) {
      syncLayerList();
    }

    return true;
  } catch (error) {
    console.error('Error changing layer color:', error);
    return false;
  }
};

/**
 * Zooms the map to fit a layer's extent
 * 
 * Calculates the bounding box of all features in the layer and
 * animates the map view to fit that extent with padding.
 * 
 * @param {import('ol/layer/Vector').default} layerObj - Layer to zoom to
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {Object} [options={}] - Zoom options
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

    if (!isValidExtent(extent)) {
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
 * Renames a layer and optionally triggers UI sync
 * 
 * @param {import('ol/layer/Layer').default} layer - Layer to rename
 * @param {string} newName - New name for the layer
 * @param {Function} [syncLayerList] - Optional callback to trigger layer list refresh
 * @returns {boolean} Success status
 * 
 * @example
 * renameLayer(layer, "New Name", syncLayerList);
 */
export const renameLayer = (layer, newName, syncLayerList) => {
  if (!layer || !newName) return false;

  try {
    layer.set('title', newName);

    if (syncLayerList) {
      syncLayerList();
    }

    return true;
  } catch (error) {
    console.error('Error renaming layer:', error);
    return false;
  }
};

/**
 * Toggles layer visibility
 * 
 * @param {import('ol/layer/Layer').default} layer - Layer to toggle
 * @param {Function} [syncLayerList] - Optional callback to trigger layer list refresh
 * @returns {boolean} New visibility state
 * 
 * @example
 * const isVisible = toggleLayerVisibility(layer, syncLayerList);
 */
export const toggleLayerVisibility = (layer, syncLayerList) => {
  if (!layer) return false;

  try {
    const current = typeof layer.getVisible === 'function' ? layer.getVisible() : true;
    const newState = !current;

    if (typeof layer.setVisible === 'function') {
      layer.setVisible(newState);
    }

    if (syncLayerList) {
      syncLayerList();
    }

    return newState;
  } catch (error) {
    console.error('Error toggling layer visibility:', error);
    return false;
  }
};

/**
 * Sets layer opacity
 * 
 * @param {import('ol/layer/Layer').default} layer - Layer to modify
 * @param {number} opacity - Opacity value (0-1)
 * @param {Function} [syncLayerList] - Optional callback to trigger layer list refresh
 * @returns {boolean} Success status
 * 
 * @example
 * setLayerOpacity(layer, 0.5, syncLayerList);
 */
export const setLayerOpacity = (layer, opacity, syncLayerList) => {
  if (!layer || typeof opacity !== 'number') return false;

  try {
    if (typeof layer.setOpacity === 'function') {
      layer.setOpacity(opacity);
    }

    if (syncLayerList) {
      syncLayerList();
    }

    return true;
  } catch (error) {
    console.error('Error setting layer opacity:', error);
    return false;
  }
};

/**
 * Removes a layer from the map
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {import('ol/layer/Layer').default} layer - Layer to remove
 * @param {Function} [syncLayerList] - Optional callback to trigger layer list refresh
 * @returns {boolean} Success status
 * 
 * @example
 * const success = removeLayer(map, layer, syncLayerList);
 */
export const removeLayer = (mapInstance, layer, syncLayerList) => {
  if (!mapInstance || !layer) return false;

  // Prevent removal of base layer
  if (layer.get('isBaseLayer')) {
    console.warn('Cannot remove base layer');
    return false;
  }

  try {
    mapInstance.removeLayer(layer);

    if (syncLayerList) {
      syncLayerList();
    }

    return true;
  } catch (error) {
    console.error('Error removing layer:', error);
    return false;
  }
};

// Re-export utilities for convenience
export { extractLayerColor as getLayerColor, isVectorLayer };
