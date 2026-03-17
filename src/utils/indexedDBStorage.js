/**
 * IndexedDB Storage for WebGIS Layers
 * Provides unlimited storage capacity (up to 60% of disk space)
 * Much larger than localStorage's 10MB limit
 */

const DB_NAME = 'webgis_db';
const DB_VERSION = 1;
const STORE_NAME = 'layers';
const LEGACY_STORAGE_KEY = 'webgis_layers'; // localStorage key for migration

/**
 * Initialize IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB failed to open:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: false 
        });

        // Create indexes for efficient querying
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        
        console.log('✓ IndexedDB object store created');
      }
    };
  });
};

/**
 * Save all layers to IndexedDB
 * @param {Array} layers - Array of layer data objects
 * @returns {Promise<Object>} Result with success status
 */
export const saveLayersToIndexedDB = async (layers) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing data
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all layers
    const promises = layers.map(layer => {
      return new Promise((resolve, reject) => {
        const request = store.add(layer);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);

    // Calculate total size
    const size = new Blob([JSON.stringify(layers)]).size;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);

    console.log(`✓ Saved ${layers.length} layers to IndexedDB (${sizeInMB} MB)`);
    
    db.close();
    return { success: true, count: layers.length, size: sizeInMB };
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    
    // Check if it's a quota error
    if (error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'quota',
        message: 'Storage limit exceeded. Please delete some layers.'
      };
    }
    
    return { success: false, error: error.name, message: error.message };
  }
};

/**
 * Load all layers from IndexedDB
 * @returns {Promise<Array>} Array of layer data objects
 */
export const loadLayersFromIndexedDB = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const layers = request.result || [];
        console.log(`✓ Loaded ${layers.length} layers from IndexedDB`);
        db.close();
        resolve(layers);
      };
      
      request.onerror = () => {
        console.error('Error loading from IndexedDB:', request.error);
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return [];
  }
};

/**
 * Clear all layers from IndexedDB
 * @returns {Promise<boolean>}
 */
export const clearIndexedDB = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('✓ Cleared all layers from IndexedDB');
        db.close();
        resolve(true);
      };
      
      request.onerror = () => {
        console.error('Error clearing IndexedDB:', request.error);
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    return false;
  }
};

/**
 * Migrate data from localStorage to IndexedDB
 * @returns {Promise<Object>} Migration result
 */
export const migrateFromLocalStorage = async () => {
  try {
    // Check if localStorage has data
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) {
      return { migrated: false, reason: 'no_data' };
    }

    // Check if IndexedDB already has data
    const existingLayers = await loadLayersFromIndexedDB();
    if (existingLayers.length > 0) {
      return { migrated: false, reason: 'already_migrated' };
    }

    // Parse localStorage data
    const data = JSON.parse(stored);
    const layers = data.layers || [];

    if (layers.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return { migrated: false, reason: 'empty' };
    }

    // Save to IndexedDB
    const result = await saveLayersToIndexedDB(layers);
    
    if (result.success) {
      // Clear localStorage after successful migration
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      console.log(`✓ Migrated ${layers.length} layers from localStorage to IndexedDB`);
      return { 
        migrated: true, 
        count: layers.length,
        size: result.size 
      };
    } else {
      return { 
        migrated: false, 
        reason: 'save_failed',
        error: result.error 
      };
    }
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
    return { 
      migrated: false, 
      reason: 'error',
      error: error.message 
    };
  }
};

/**
 * Check if IndexedDB is supported
 * @returns {boolean}
 */
export const isIndexedDBSupported = () => {
  return typeof indexedDB !== 'undefined';
};

/**
 * Get storage quota information
 * @returns {Promise<Object>} Storage info
 */
export const getStorageInfo = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
    const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
    const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(1);

    return {
      used: usedMB,
      quota: quotaMB,
      percentUsed: percentUsed,
      available: (quotaMB - usedMB).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};
