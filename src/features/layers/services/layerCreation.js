/**
 * Layer Creation Service
 * 
 * Provides functionality for creating new empty vector layers
 * with dynamic naming based on counter and timestamp.
 */

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { createVectorStyle } from '../utils/styleUtils';

/**
 * Creates a new empty vector layer with dynamic naming
 * 
 * Naming convention: Layer-{XX}-{MM:HH}
 * - XX: Zero-padded counter (01, 02, 03, ...)
 * - MM:HH: Current time in minutes:hours format
 * 
 * @param {number} layerCount - Current layer counter
 * @param {Object} [options={}] - Layer creation options
 * @param {string} [options.color='#4AE661'] - Layer color
 * @param {string} [options.namePrefix='Layer'] - Layer name prefix
 * @returns {Object} Created layer and updated counter
 * 
 * @example
 * const { layer, newCount } = createNewEmptyLayer(1);
 * // Returns: { layer: VectorLayer, newCount: 2 }
 * // Layer name: "Layer-01-48:12" (if created at 12:48)
 */
export const createNewEmptyLayer = (layerCount, options = {}) => {
    const {
        color = '#4AE661',
        namePrefix = 'Layer'
    } = options;

    // Get current time parts
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Format counter with zero-padding
    const countStr = String(layerCount).padStart(2, '0');

    // Generate layer name: Layer-{01}-{48:12}
    const layerName = `${namePrefix}-${countStr}-${minutes}:${hours}`;

    // Create empty vector layer
    const newLayer = new VectorLayer({
        source: new VectorSource(), // Empty source ready for features
        style: createVectorStyle(color),
    });

    // Set layer properties
    newLayer.set('id', `layer-${Date.now()}-${layerCount}`);
    newLayer.set('title', layerName);
    newLayer.set('isBaseLayer', false);

    return {
        layer: newLayer,
        newCount: layerCount + 1,
        layerName
    };
};

/**
 * Adds a new empty layer to the map and syncs the layer list
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {number} layerCount - Current layer counter
 * @param {Function} syncLayerList - Function to sync layer list UI
 * @param {Object} [options={}] - Layer creation options
 * @returns {Object} Created layer info
 * 
 * @example
 * const result = addNewEmptyLayerToMap(mapInstance, 5, syncLayerList);
 * // result: { layer: VectorLayer, layerName: 'Layer-05-30:14', newCount: 6 }
 */
export const addNewEmptyLayerToMap = (mapInstance, layerCount, syncLayerList, options = {}) => {
    if (!mapInstance) {
        console.error('Map instance is required');
        return null;
    }

    // Create new layer
    const { layer, newCount, layerName } = createNewEmptyLayer(layerCount, options);

    // Add to map
    mapInstance.addLayer(layer);

    // Sync layer list to update UI
    if (syncLayerList) {
        syncLayerList();
    }

    console.log(`Created new empty layer: ${layerName}`);

    return {
        layer,
        layerName,
        newCount
    };
};

/**
 * Gets the next layer counter value
 * 
 * Calculates the next counter by examining existing layers
 * and finding the highest counter value.
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @returns {number} Next counter value
 */
export const getNextLayerCounter = (mapInstance) => {
    if (!mapInstance) return 1;

    const layers = mapInstance.getLayers().getArray();
    let maxCounter = 0;

    layers.forEach((layer) => {
        const title = layer.get('title');
        if (title && title.startsWith('Layer-')) {
            // Extract counter from "Layer-XX-MM:HH" format
            const match = title.match(/Layer-(\d+)-/);
            if (match) {
                const counter = parseInt(match[1], 10);
                if (counter > maxCounter) {
                    maxCounter = counter;
                }
            }
        }
    });

    return maxCounter + 1;
};
