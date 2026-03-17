/**
 * Layer Utility Functions
 * 
 * Utilities for layer index management and layer creation in OpenLayers.
 * Handles conversion between UI indices (top = 0) and OpenLayers indices (bottom = 0).
 */

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { createVectorStyle } from './styleUtils';

/**
 * Convert UI index (0 = top) to OpenLayers index (0 = bottom)
 * 
 * The UI displays layers in reverse order from OpenLayers collection.
 * Top layer in UI (index 0) is at the end of OL collection (highest index).
 * 
 * @param {number} arrayLength - Total number of layers in OL collection
 * @param {number} uiIndex - Index in UI list (0 = top)
 * @returns {number} Corresponding OpenLayers collection index
 * 
 * @example
 * // With 5 layers, UI index 0 (top) = OL index 4 (last in array)
 * uiIndexToOlIndex(5, 0); // returns 4
 */
export function uiIndexToOlIndex(arrayLength, uiIndex) {
  return arrayLength - 1 - uiIndex;
}

/**
 * Validate whether a new OL index is allowed
 * 
 * Index 0 is reserved for the base layer and should not be used for user layers.
 * This ensures the base layer always stays at the bottom of the stack.
 * 
 * @param {number} newOlIndex - Proposed new OpenLayers index
 * @param {number} arrayLength - Total number of layers in collection
 * @returns {boolean} True if the index is valid for moving a user layer
 * 
 * @example
 * isValidOlIndexForMove(0, 5); // returns false (base layer position)
 * isValidOlIndexForMove(2, 5); // returns true (valid user layer position)
 */
export function isValidOlIndexForMove(newOlIndex, arrayLength) {
  return newOlIndex >= 1 && newOlIndex < arrayLength;
}

/**
 * Add a new vector layer to the map from provided features
 * 
 * Creates a new vector layer with a standard style and adds it to the map.
 * Automatically fits the map view to show the new layer's extent.
 * 
 * @param {Object} mapInstanceRef - React ref containing the OL Map instance (or the map itself)
 * @param {Array<import('ol/Feature').default>} features - Array of OpenLayers Feature objects
 * @param {string} name - Display title for the layer
 * @param {string} [uniqueSuffix=''] - Optional suffix to ensure unique layer ID
 * @param {Function} [syncLayerList] - Optional callback to refresh layer list UI
 * @returns {import('ol/layer/Vector').default|null} The created layer, or null if creation failed
 * 
 * @example
 * const layer = addNewLayer(mapRef, features, "My Layer", "-001", syncLayerList);
 */
export function addNewLayer(
  mapInstanceRef,
  features,
  name,
  uniqueSuffix = '',
  syncLayerList
) {
  if (!features || features.length === 0) {
    console.warn('No features provided to addNewLayer');
    return null;
  }

  // Create vector source and layer
  const source = new VectorSource({ features });
  const newLayer = new VectorLayer({
    source,
    title: name,
    style: createVectorStyle('#FF5733'), // Default upload color
  });

  // Set layer metadata
  newLayer.set('id', `layer-${Date.now()}${uniqueSuffix}`);
  newLayer.set('title', name);

  // Get map instance from ref or direct object
  const map = mapInstanceRef?.current ?? mapInstanceRef;

  if (map && typeof map.addLayer === 'function') {
    map.addLayer(newLayer);

    // Fit view to new layer extent
    const extent = source.getExtent();
    if (extent && extent.every(Number.isFinite)) {
      try {
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
      } catch (e) {
        console.warn('Failed to fit view to layer extent:', e);
      }
    }

    // Trigger UI update
    if (typeof syncLayerList === 'function') {
      syncLayerList();
    }

    return newLayer;
  }

  console.error('Invalid map instance provided to addNewLayer');
  return null;
}

