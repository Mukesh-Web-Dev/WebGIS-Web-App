/**
 * useColorPicker Hook
 * 
 * Custom hook for managing color picker state and layer color changes.
 * Encapsulates color picker modal visibility and color change logic.
 */

import { useState } from 'react';
import { changeLayerColor } from '../services/layerOperations';

/**
 * Hook for managing color picker functionality
 * 
 * @param {Function} syncLayerList - Function to sync layer list UI
 * @param {Function} addToast - Function to show toast notifications
 * @returns {Object} Color picker state and methods
 * 
 * @example
 * const { openColorPicker, handleColorChange } = useColorPicker(syncLayerList, addToast);
 */
const useColorPicker = (syncLayerList, addToast) => {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);

  /**
   * Opens the color picker for a specific layer
   * @param {import('ol/layer/Layer').default} layer - Layer to change color for
   */
  const openColorPicker = (layer) => {
    if (!layer) return;
    setSelectedLayer(layer);
    setColorPickerVisible(true);
  };

  /**
   * Closes the color picker modal
   */
  const closeColorPicker = () => {
    setColorPickerVisible(false);
    setSelectedLayer(null);
  };

  /**
   * Handles color change for a layer
   * @param {import('ol/layer/Layer').default} layer - Layer to update
   * @param {string} newColor - New color hex code
   */
  const handleColorChange = async (layer, newColor) => {
    const success = await changeLayerColor(layer, newColor, syncLayerList);
    
    if (success) {
      const title = layer.get('title') || 'layer';
      if (addToast) {
        addToast(`Changed color for: ${title}`);
      }
    }
    
    closeColorPicker();
  };

  return {
    colorPickerVisible,
    selectedLayer,
    openColorPicker,
    closeColorPicker,
    handleColorChange
  };
};

export default useColorPicker;
