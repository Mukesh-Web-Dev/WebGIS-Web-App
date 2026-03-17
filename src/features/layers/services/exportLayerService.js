/**
 * Layer Export Service
 * 
 * Handles exporting layers to various formats (GeoJSON, KML, PNG).
 * Supports exporting active layer with its drawing features.
 * Preserves styling information in exports where possible.
 */

import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import VectorLayer from 'ol/layer/Vector';

/**
 * Helper: Extract features from a specific layer by ID
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {string} layerId - Layer ID to export
 * @returns {Array} Array of features
 */
const getFeaturesFromLayer = (mapInstance, layerId) => {
    if (!mapInstance || !layerId) return [];

    const layers = mapInstance.getLayers().getArray();
    const targetLayer = layers.find(layer => layer.get('id') === layerId);

    if (!targetLayer || !(targetLayer instanceof VectorLayer)) {
        return [];
    }

    const source = targetLayer.getSource();
    if (!source || typeof source.getFeatures !== 'function') {
        return [];
    }

    return source.getFeatures();
};

/**
 * Helper: Get all drawing features from drawing layer
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @returns {Array} Array of drawing features
 */
const getDrawingFeatures = (mapInstance) => {
    if (!mapInstance) return [];

    const layers = mapInstance.getLayers().getArray();
    const drawingLayer = layers.find(layer => layer.get('isDrawingLayer'));

    if (!drawingLayer || !(drawingLayer instanceof VectorLayer)) {
        return [];
    }

    const source = drawingLayer.getSource();
    if (!source || typeof source.getFeatures !== 'function') {
        return [];
    }

    return source.getFeatures();
};

/**
 * Helper: Embed OpenLayers styles into feature properties
 * This allows styles to be preserved in GeoJSON export
 * 
 * @param {Array} features - Features to process
 * @returns {Array} Features with embedded styles
 */
const embedStylesInFeatures = (features) => {
    features.forEach((feature) => {
        try {
            const style = feature.getStyle();

            // Handle style functions or objects
            const actualStyle = typeof style === 'function' ? style(feature)?.[0] : style;

            if (actualStyle) {
                const fill = actualStyle.getFill();
                const stroke = actualStyle.getStroke();

                const styleData = {
                    fillColor: fill ? fill.getColor() : null,
                    strokeColor: stroke ? stroke.getColor() : null,
                    strokeWidth: stroke ? stroke.getWidth() : null,
                };

                feature.set('_style', styleData);
            }
        } catch (error) {
            console.warn('Failed to extract style from feature:', error);
        }
    });

    return features;
};

/**
 * Helper: Download file to user's system
 * 
 * @param {string|Blob} content - File content
 * @param {string} filename - Download filename
 * @param {string} contentType - MIME type
 */
const downloadFile = (content, filename, contentType) => {
    const element = document.createElement('a');
    const file = content instanceof Blob
        ? content
        : new Blob([content], { type: contentType });

    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(element.href), 100);
};

/**
 * Export active layer as GeoJSON with drawing features
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {string} activeLayerId - Active layer ID
 * @param {string} [filename='layer-export.geojson'] - Output filename
 * @returns {Promise<boolean>} Success status
 * 
 * @example
 * const success = await exportAsGeoJSON(map, 'layer-1', 'my-layer.geojson');
 */
export const exportAsGeoJSON = async (mapInstance, activeLayerId, filename = 'layer-export.geojson') => {
    try {
        if (!mapInstance) {
            throw new Error('Map instance is required');
        }

        const viewProjection = mapInstance.getView().getProjection();
        const format = new GeoJSON({
            featureProjection: viewProjection
        });

        // Get features from active layer
        let allFeatures = getFeaturesFromLayer(mapInstance, activeLayerId);

        // Add drawing features if they exist
        const drawingFeatures = getDrawingFeatures(mapInstance);
        if (drawingFeatures.length > 0) {
            allFeatures = [...allFeatures, ...drawingFeatures];
        }

        if (allFeatures.length === 0) {
            throw new Error('No features to export');
        }

        // Embed styles into feature properties
        embedStylesInFeatures(allFeatures);

        // Convert to GeoJSON
        const geoJSONString = format.writeFeatures(allFeatures, {
            dataProjection: 'EPSG:4326', // Standard Lat/Lon
            featureProjection: viewProjection
        });

        // Download file
        downloadFile(geoJSONString, filename, 'application/json');

        return true;
    } catch (error) {
        console.error('GeoJSON export failed:', error);
        throw error;
    }
};

/**
 * Export active layer as KML with drawing features
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {string} activeLayerId - Active layer ID
 * @param {string} [filename='layer-export.kml'] - Output filename
 * @returns {Promise<boolean>} Success status
 * 
 * @example
 * const success = await exportAsKML(map, 'layer-1', 'my-layer.kml');
 */
export const exportAsKML = async (mapInstance, activeLayerId, filename = 'layer-export.kml') => {
    try {
        if (!mapInstance) {
            throw new Error('Map instance is required');
        }

        const viewProjection = mapInstance.getView().getProjection();
        const format = new KML({
            featureProjection: viewProjection,
            extractStyles: true // Extract OpenLayers styles
        });

        // Get features from active layer
        let allFeatures = getFeaturesFromLayer(mapInstance, activeLayerId);

        // Add drawing features if they exist
        const drawingFeatures = getDrawingFeatures(mapInstance);
        if (drawingFeatures.length > 0) {
            allFeatures = [...allFeatures, ...drawingFeatures];
        }

        if (allFeatures.length === 0) {
            throw new Error('No features to export');
        }

        // Convert to KML
        const kmlString = format.writeFeatures(allFeatures, {
            dataProjection: 'EPSG:4326',
            featureProjection: viewProjection
        });

        // Download file
        downloadFile(kmlString, filename, 'application/vnd.google-earth.kml+xml');

        return true;
    } catch (error) {
        console.error('KML export failed:', error);
        throw error;
    }
};

/**
 * Export active layer as PNG image (raster)
 * Renders the layer extent to canvas and exports as image
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {string} activeLayerId - Active layer ID
 * @param {string} [filename='layer-export.png'] - Output filename
 * @returns {Promise<boolean>} Success status
 * 
 * @example
 * const success = await exportAsPNG(map, 'layer-1', 'my-layer.png');
 */
export const exportAsPNG = async (mapInstance, activeLayerId, filename = 'layer-export.png') => {
    return new Promise((resolve, reject) => {
        try {
            if (!mapInstance) {
                throw new Error('Map instance is required');
            }

            // Get the active layer to zoom to its extent
            const layers = mapInstance.getLayers().getArray();
            const targetLayer = layers.find(layer => layer.get('id') === activeLayerId);

            if (!targetLayer) {
                throw new Error('Active layer not found');
            }

            // Get layer extent
            const source = targetLayer.getSource();
            const extent = source?.getExtent();

            if (!extent || extent.some(v => !isFinite(v))) {
                throw new Error('Cannot determine layer extent');
            }

            // Fit map to layer extent
            mapInstance.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                duration: 0 // Instant fit
            });

            // Create canvas for export
            const mapCanvas = document.createElement('canvas');
            const size = mapInstance.getSize();
            mapCanvas.width = size[0];
            mapCanvas.height = size[1];

            const originalTarget = mapInstance.getTarget();

            // Render map to canvas
            mapInstance.once('rendercomplete', () => {
                try {
                    const dataURL = mapCanvas.toDataURL('image/png');

                    // Download image
                    const link = document.createElement('a');
                    link.href = dataURL;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Restore original target
                    mapInstance.setTarget(originalTarget);

                    resolve(true);
                } catch (error) {
                    // Restore map target even on error
                    mapInstance.setTarget(originalTarget);

                    if (error.name === 'SecurityError') {
                        reject(new Error('CORS Error: Tile sources must have crossOrigin: "anonymous"'));
                    } else {
                        reject(error);
                    }
                }
            });

            // Set canvas as target and render
            mapInstance.setTarget(mapCanvas);
            mapInstance.renderSync();

        } catch (error) {
            console.error('PNG export failed:', error);
            reject(error);
        }
    });
};

/**
 * Get layer name by ID
 * 
 * @param {import('ol/Map').default} mapInstance - OpenLayers map instance
 * @param {string} layerId - Layer ID
 * @returns {string} Layer name or empty string
 */
export const getLayerNameById = (mapInstance, layerId) => {
    if (!mapInstance || !layerId) return '';

    const layers = mapInstance.getLayers().getArray();
    const layer = layers.find(l => l.get('id') === layerId);

    return layer ? (layer.get('title') || 'Unnamed Layer') : '';
};
