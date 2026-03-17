/**
 * Drawing Persistence Service
 * 
 * Handles IndexedDB storage for drawn features per layer.
 * Provides save, load, and delete operations with GeoJSON serialization.
 */

import GeoJSON from 'ol/format/GeoJSON';
import { fromCircle } from 'ol/geom/Polygon';
import Feature from 'ol/Feature';

const DB_NAME = 'webgis-drawings';
const DB_VERSION = 1;
const STORE_NAME = 'drawings';

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'layerId' });
      }
    };
  });
};

/**
 * Save drawings to IndexedDB for a specific layer
 * 
 * @param {string} layerId - Layer ID to associate drawings with
 * @param {Array<Feature>} features - Array of OpenLayers features
 * @returns {Promise<boolean>} Success status
 */
export const saveDrawingsToIndexedDB = async (layerId, features) => {
  try {
    if (!layerId) {
      console.warn('No layerId provided to saveDrawingsToIndexedDB');
      return false;
    }

    const db = await initDB();
    const format = new GeoJSON();
    
    // Transform features to serializable format
    const serializedFeatures = features.map(feature => {
      let geometry = feature.getGeometry();
      
      // Convert Circle to Polygon for GeoJSON compatibility
      if (geometry.getType() === 'Circle') {
        geometry = fromCircle(geometry);
      }
      
      // Create a clean feature for export
      const exportFeature = new Feature(geometry);
      const properties = feature.getProperties();
      
      // Exclude geometry from properties (it's already set)
      const { geometry: _, ...cleanProps } = properties;
      exportFeature.setProperties(cleanProps);
      
      return exportFeature;
    });

    // Convert to GeoJSON
    const geoJsonData = format.writeFeatures(serializedFeatures, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326'
    });

    // Store in IndexedDB
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data = {
      layerId,
      geoJson: geoJsonData,
      timestamp: Date.now(),
      featureCount: features.length
    };

    await new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    console.log(`Saved ${features.length} drawings for layer ${layerId}`);
    return true;

  } catch (error) {
    console.error('Error saving drawings to IndexedDB:', error);
    return false;
  }
};

/**
 * Load drawings from IndexedDB for a specific layer
 * 
 * @param {string} layerId - Layer ID to load drawings for
 * @returns {Promise<Array<Feature>>} Array of OpenLayers features
 */
export const loadDrawingsFromIndexedDB = async (layerId) => {
  try {
    if (!layerId) {
      console.warn('No layerId provided to loadDrawingsFromIndexedDB');
      return [];
    }

    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const data = await new Promise((resolve, reject) => {
      const request = store.get(layerId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!data || !data.geoJson) {
      console.log(`No drawings found for layer ${layerId}`);
      return [];
    }

    // Parse GeoJSON back to features
    const format = new GeoJSON();
    const features = format.readFeatures(data.geoJson, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326'
    });

    console.log(`Loaded ${features.length} drawings for layer ${layerId}`);
    return features;

  } catch (error) {
    console.error('Error loading drawings from IndexedDB:', error);
    return [];
  }
};

/**
 * Delete all drawings for a specific layer
 * 
 * @param {string} layerId - Layer ID to delete drawings for
 * @returns {Promise<boolean>} Success status
 */
export const deleteDrawingsByLayerId = async (layerId) => {
  try {
    if (!layerId) {
      console.warn('No layerId provided to deleteDrawingsByLayerId');
      return false;
    }

    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.delete(layerId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    console.log(`Deleted drawings for layer ${layerId}`);
    return true;

  } catch (error) {
    console.error('Error deleting drawings from IndexedDB:', error);
    return false;
  }
};

/**
 * Get all stored layer IDs
 * 
 * @returns {Promise<Array<string>>} Array of layer IDs
 */
export const getAllDrawingLayerIds = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const layerIds = await new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return layerIds;

  } catch (error) {
    console.error('Error getting layer IDs from IndexedDB:', error);
    return [];
  }
};

/**
 * Clear all drawings from IndexedDB
 * 
 * @returns {Promise<boolean>} Success status
 */
export const clearAllDrawings = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    console.log('Cleared all drawings from IndexedDB');
    return true;

  } catch (error) {
    console.error('Error clearing drawings from IndexedDB:', error);
    return false;
  }
};
