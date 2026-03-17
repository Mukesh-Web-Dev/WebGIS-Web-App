/**
 * ColorPicker Organism
 * 
 * Color selection modal for changing layer colors.
 * Provides a predefined color palette, custom color input, and preview.
 * Refactored to use ColorSwatch atoms and Button components.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.currentColor - Current color of the layer
 * @param {Function} props.onColorChange - Callback when color is applied
 * @param {Function} props.onClose - Callback to close the picker
 * 
 * @example
 * <ColorPicker
 *   currentColor="#4AE661"
 *   onColorChange={(color) => updateLayerColor(layer, color)}
 *   onClose={() => setPickerOpen(false)}
 * />
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, ColorSwatch } from '../../atoms';
import './ColorPicker.css';

const ColorPicker = ({ currentColor, onColorChange, onClose }) => {
  const [color, setColor] = useState(currentColor || '#4AE661');
  const pickerRef = useRef(null);

  // Predefined color palette
  const colorPalette = [
    '#E64F40', '#E67349', '#E69749', '#E6BB49',
    '#D4E649', '#A8E649', '#7CE649', '#4AE661',
    '#49E694', '#49E6C9', '#49C9E6', '#499CE6',
    '#4970E6', '#6149E6', '#8D49E6', '#B949E6',
    '#E649D4', '#E649A8', '#FFFFFF', '#CCCCCC',
    '#999999', '#666666', '#333333', '#000000',
  ];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Close on Escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleApply = () => {
    onColorChange(color);
    onClose();
  };

  return (
    <div className="color-picker-backdrop" onClick={onClose}>
      <div
        ref={pickerRef}
        className="color-picker-popup"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Color picker"
      >
        {/* Header */}
        <div className="color-picker-header">
          <h6>Choose Layer Color</h6>
        </div>

        {/* Color Palette */}
        <div className="color-palette">
          {colorPalette.map((c) => (
            <ColorSwatch
              key={c}
              color={c}
              selected={color === c}
              onClick={setColor}
            />
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="color-input-section">
          <label htmlFor="color-code">Color Code:</label>
          <div className="color-input-group">
            <input
              id="color-code"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#FFFFFF"
              maxLength={7}
              className="color-picker__text-input"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="Pick custom color"
              className="color-picker__color-input"
            />
          </div>
        </div>

        {/* Color Preview */}
        <div className="color-preview">
          <span>Preview:</span>
          <div
            className="preview-box"
            style={{ backgroundColor: color }}
            aria-label={`Preview of color ${color}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="color-picker-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

ColorPicker.propTypes = {
  currentColor: PropTypes.string,
  onColorChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ColorPicker;
