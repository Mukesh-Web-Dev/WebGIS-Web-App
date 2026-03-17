import GeoJSON from 'ol/format/GeoJSON';

/**
 * Serialize a layer to a plain object for storage
 * @param {ol.layer.Vector} layer - OpenLayers vector layer
 * @returns {Object|null} Serialized layer data or null if it can't be serialized
 */
export const serializeLayer = (layer) => {
  try {
    // Skip base layers
    if (layer.get('isBaseLayer')) {
      return null;
    }

    const source = layer.getSource();
    if (!source || !source.getFeatures) {
      return null;
    }

    // Get all features as GeoJSON
    const format = new GeoJSON();
    const features = source.getFeatures();
    const geojson = format.writeFeaturesObject(features, {
      featureProjection: 'EPSG:3857', // Web Mercator
      dataProjection: 'EPSG:4326', // WGS84 for storage
    });

    // Extract style information
    const style = layer.getStyle();
    let styleData = null;
    
    if (style && typeof style !== 'function') {
      // Handle single style object
      const stroke = style.getStroke?.();
      const fill = style.getFill?.();
      const image = style.getImage?.();

      styleData = {
        strokeColor: stroke?.getColor?.() || '#4AE661',
        strokeWidth: stroke?.getWidth?.() || 2,
        fillColor: fill?.getColor?.() || '#4AE66140',
      };

      // Handle point styles
      if (image) {
        const imageFill = image.getFill?.();
        const imageStroke = image.getStroke?.();
        styleData.imageRadius = image.getRadius?.() || 6;
        styleData.imageFillColor = imageFill?.getColor?.() || '#4AE661';
        styleData.imageStrokeColor = imageStroke?.getColor?.() || '#FFFFFF';
        styleData.imageStrokeWidth = imageStroke?.getWidth?.() || 1;
      }
    }

    return {
      id: layer.get('id') || `layer-${Date.now()}`,
      title: layer.get('title') || 'Untitled Layer',
      visible: layer.getVisible(),
      opacity: layer.getOpacity(),
      style: styleData,
      geojson: geojson,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error serializing layer:', error);
    return null;
  }
};

/**
 * Deserialize layer data and create an OpenLayers layer
 * @param {Object} layerData - Serialized layer data
 * @param {ol.Map} mapInstance - OpenLayers map instance
 * @returns {ol.layer.Vector|null} OpenLayers vector layer or null
 */
export const deserializeLayer = async (layerData, mapInstance) => {
  try {
    if (!mapInstance || !layerData || !layerData.geojson) {
      return null;
    }

    // Dynamically import OpenLayers modules
    const [
      { default: VectorLayer },
      { default: VectorSource },
      { Style, Fill, Stroke, Circle: CircleStyle },
      { default: GeoJSONFormat }
    ] = await Promise.all([
      import('ol/layer/Vector'),
      import('ol/source/Vector'),
      import('ol/style'),
      import('ol/format/GeoJSON'),
    ]);

    // Parse features from GeoJSON
    const format = new GeoJSONFormat();
    const features = format.readFeatures(layerData.geojson, {
      featureProjection: mapInstance.getView().getProjection(),
      dataProjection: 'EPSG:4326',
    });

    // Create vector source
    const vectorSource = new VectorSource({
      features: features,
    });

    // Create style from saved data
    let layerStyle = null;
    if (layerData.style) {
      const { strokeColor, strokeWidth, fillColor, imageRadius, imageFillColor, imageStrokeColor, imageStrokeWidth } = layerData.style;
      
      layerStyle = new Style({
        fill: new Fill({
          color: fillColor || '#4AE66140',
        }),
        stroke: new Stroke({
          color: strokeColor || '#4AE661',
          width: strokeWidth || 2,
        }),
        image: new CircleStyle({
          radius: imageRadius || 6,
          fill: new Fill({
            color: imageFillColor || '#4AE661',
          }),
          stroke: new Stroke({
            color: imageStrokeColor || '#FFFFFF',
            width: imageStrokeWidth || 1,
          }),
        }),
      });
    }

    // Create vector layer
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: layerStyle,
    });

    // Set layer properties
    vectorLayer.set('id', layerData.id);
    vectorLayer.set('title', layerData.title);
    vectorLayer.setVisible(layerData.visible !== false);
    vectorLayer.setOpacity(layerData.opacity ?? 1);

    return vectorLayer;
  } catch (error) {
    console.error('Error deserializing layer:', error);
    return null;
  }
};

/**
 * Save layers to IndexedDB (unlimited storage)
 * @param {Array} layerList - Array of layer objects from useLayerManager
 * @returns {Promise<Object>} Result with success status and message
 */
export const saveLayers = async (layerList) => {
  try {
    // Import IndexedDB utilities dynamically
    const { saveLayersToIndexedDB } = await import('./indexedDBStorage');
    
    // Filter out base layers and serialize
    const serializedLayers = layerList
      .filter(item => !item.isBaseLayer)
      .map(item => serializeLayer(item.layer))
      .filter(layer => layer !== null);

    // Save to IndexedDB
    const result = await saveLayersToIndexedDB(serializedLayers);
    return result;
  } catch (error) {
    console.error('Error saving layers:', error);
    return { success: false, error: error.name, message: error.message };
  }
};

/**
 * Load layers from IndexedDB
 * @returns {Promise<Array>} Array of serialized layer data
 */
export const loadLayers = async () => {
  try {
    // Import IndexedDB utilities dynamically
    const { loadLayersFromIndexedDB, migrateFromLocalStorage } = await import('./indexedDBStorage');
    
    // Try to load from IndexedDB first
    let layers = await loadLayersFromIndexedDB();
    
    // If no data, check if we need to migrate from localStorage
    if (layers.length === 0) {
      const migrationResult = await migrateFromLocalStorage();
      
      if (migrationResult.migrated) {
        console.log(`✓ Migrated ${migrationResult.count} layers from localStorage`);
        // Load the migrated data
        layers = await loadLayersFromIndexedDB();
      }
    }
    
    return layers;
  } catch (error) {
    console.error('Error loading layers:', error);
    return [];
  }
};

/**
 * Clear all saved layers from IndexedDB
 */
export const clearSavedLayers = async () => {
  try {
    const { clearIndexedDB } = await import('./indexedDBStorage');
    await clearIndexedDB();
    console.log('Cleared saved layers from IndexedDB');
  } catch (error) {
    console.error('Error clearing saved layers:', error);
  }
};
