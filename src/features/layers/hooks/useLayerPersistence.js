/**
 * useLayerPersistence Hook
 * 
 * Custom hook for automatically saving and loading layers from IndexedDB.
 * Handles layer persistence across sessions with debounced saves.
 */

import { useEffect, useState } from 'react';
import { saveLayers, loadLayers, deserializeLayer } from '../services/layerPersistence';

/**
 * Hook for managing layer persistence (auto-save/load)
 * 
 * Automatically loads layers on mount and saves changes when layer list updates.
 * Uses debouncing to avoid excessive save operations.
 * 
 * @param {React.MutableRefObject} mapInstanceRef - Ref to OpenLayers map instance
 * @param {Array} layerList - Current list of layers
 * @param {Function} syncLayerList - Function to sync layer list UI
 * @param {Function} addToast - Function to show toast notifications
 * 
 * @example
 * useLayerPersistence(mapInstance, layerList, syncLayerList, addToast);
 */
const useLayerPersistence = (mapInstanceRef, layerList, syncLayerList, addToast) => {
  const [layersLoaded, setLayersLoaded] = useState(false);

  // Load layers from IndexedDB on mount
  useEffect(() => {
    const loadSavedLayers = async () => {
      if (!mapInstanceRef.current || layersLoaded) {
        return;
      }

      try {
        const savedLayers = await loadLayers();
        if (savedLayers.length === 0) {
          setLayersLoaded(true);
          return;
        }

        console.log(`Loading ${savedLayers.length} layers from IndexedDB...`);
        let loadedCount = 0;

        for (const layerData of savedLayers) {
          try {
            const layer = await deserializeLayer(layerData, mapInstanceRef.current);
            if (layer) {
              mapInstanceRef.current.addLayer(layer);
              loadedCount++;
            }
          } catch (error) {
            console.error('Error restoring layer:', layerData.title, error);
          }
        }

        // Trigger layer list sync after all layers are added
        syncLayerList();
        setLayersLoaded(true);

        if (loadedCount > 0 && addToast) {
          addToast(`Restored ${loadedCount} layer${loadedCount > 1 ? 's' : ''} from previous session`);
        }
      } catch (error) {
        console.error('Error loading saved layers:', error);
        setLayersLoaded(true);
      }
    };

    // Wait a bit for map to be fully initialized
    const timer = setTimeout(loadSavedLayers, 500);
    return () => clearTimeout(timer);
  }, [layersLoaded, mapInstanceRef, syncLayerList, addToast]);

  // Save layers to IndexedDB when layerList changes (debounced)
  useEffect(() => {
    if (!layersLoaded) {
      // Don't save until we've loaded initial layers
      return;
    }

    const saveTimer = setTimeout(async () => {
      const result = await saveLayers(layerList);

      // Show error toast if save failed due to quota
      if (result && !result.success && result.error === 'quota') {
        if (addToast) {
          addToast(result.message, 8000);
        }
      } else if (result && result.success && result.size) {
        // Log successful save with size info
        console.log(`Saved ${result.count} layers (${result.size} MB) to IndexedDB`);
      }
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(saveTimer);
  }, [layerList, layersLoaded, addToast]);

  return { layersLoaded };
};

export default useLayerPersistence;
