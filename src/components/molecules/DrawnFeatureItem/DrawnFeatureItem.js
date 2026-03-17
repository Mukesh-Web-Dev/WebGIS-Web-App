/**
 * DrawnFeatureItem Molecule
 * 
 * Individual feature item in the drawing feature list.
 * Provides delete, visibility toggle, color change, opacity control, and zoom to functionality.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../atoms';
import './DrawnFeatureItem.css';

const DrawnFeatureItem = ({
    feature,
    name,
    isVisible,
    color,
    opacity = 1,
    onDelete,
    onToggleVisibility,
    onColorChange,
    onOpacityChange,
    onZoomTo,
    isActive
}) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [localColor, setLocalColor] = useState(color);
    const [localOpacity, setLocalOpacity] = useState(opacity * 100);

    // Color palette
    const colorPalette = [
        '#4AE661', '#FF5733', '#33FF57', '#3357FF', '#F333FF',
        '#FF33F3', '#33FFF3', '#F3FF33', '#FF8C33', '#8C33FF'
    ];

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(feature);
    };

    const handleToggleVisibility = (e) => {
        e.stopPropagation();
        if (onToggleVisibility) onToggleVisibility(feature);
    };

    const handleColorButtonClick = (e) => {
        e.stopPropagation();
        setShowColorPicker(!showColorPicker);
    };

    const handleColorSelect = (newColor) => {
        setLocalColor(newColor);
        if (onColorChange) onColorChange(feature, newColor);
        setShowColorPicker(false);
    };

    const handleOpacityChange = (e) => {
        e.stopPropagation();
        const newOpacity = parseFloat(e.target.value);
        setLocalOpacity(newOpacity);
        if (onOpacityChange) onOpacityChange(feature, newOpacity / 100);
    };

    const handleZoomTo = () => {
        if (onZoomTo) onZoomTo(feature);
    };

    const handleColorPickerClose = (e) => {
        if (e) e.stopPropagation();
        setShowColorPicker(false);
    };

    const geometryType = feature.getGeometry().getType();

    return (
        <>
            <div
                className={`drawn-feature-item ${isActive ? 'drawn-feature-item--active' : ''}`}
                onClick={handleZoomTo}
                title="Click to zoom to this feature"
            >
                {/* Color Indicator */}
                <div
                    className="drawn-feature-item__color"
                    style={{ backgroundColor: localColor, opacity: localOpacity / 100 }}
                />

                {/* Feature Info */}
                <div className="drawn-feature-item__info">
                    <span className="drawn-feature-item__name">{name}</span>
                    <span className="drawn-feature-item__type">{geometryType}</span>
                </div>

                {/* Controls */}
                <div className="drawn-feature-item__controls">
                    {/* Visibility Toggle */}
                    <button
                        className="drawn-feature-item__control-btn"
                        onClick={handleToggleVisibility}
                        title={isVisible ? "Hide feature" : "Show feature"}
                        aria-label={isVisible ? "Hide feature" : "Show feature"}
                    >
                        <Icon name={isVisible ? 'eye' : 'eye-off'} size={14} />
                    </button>

                    {/* Color Picker */}
                    <button
                        className="drawn-feature-item__control-btn"
                        onClick={handleColorButtonClick}
                        title="Change color"
                        aria-label="Change color"
                    >
                        🎨
                    </button>

                    {/* Delete Button */}
                    <button
                        className="drawn-feature-item__control-btn drawn-feature-item__control-btn--delete"
                        onClick={handleDelete}
                        title="Delete feature"
                        aria-label="Delete feature"
                    >
                        <Icon name="trash" size={14} />
                    </button>
                </div>
            </div>

            {/* Opacity Slider */}
            {isVisible && (
                <div className="drawn-feature-item__opacity">
                    <label className="drawn-feature-item__opacity-label">
                        Opacity: {Math.round(localOpacity)}%
                    </label>
                    <input
                        type="range"
                        className="drawn-feature-item__opacity-slider"
                        min="0"
                        max="100"
                        value={localOpacity}
                        onChange={handleOpacityChange}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Color Picker Modal */}
            {showColorPicker && (
                <div
                    className="drawn-feature-color-picker-overlay"
                    onClick={handleColorPickerClose}
                >
                    <div
                        className="drawn-feature-color-picker-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="drawn-feature-color-picker-header">
                            <span>Choose Color</span>
                            <button
                                className="drawn-feature-color-picker-close"
                                onClick={handleColorPickerClose}
                                aria-label="Close color picker"
                            >
                                ×
                            </button>
                        </div>
                        <div className="drawn-feature-color-picker-palette">
                            {colorPalette.map((paletteColor) => (
                                <button
                                    key={paletteColor}
                                    className={`drawn-feature-color-swatch ${localColor === paletteColor ? 'selected' : ''}`}
                                    style={{ backgroundColor: paletteColor }}
                                    onClick={() => handleColorSelect(paletteColor)}
                                    title={paletteColor}
                                    aria-label={`Select color ${paletteColor}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

DrawnFeatureItem.propTypes = {
    feature: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    isVisible: PropTypes.bool.isRequired,
    color: PropTypes.string.isRequired,
    opacity: PropTypes.number,
    onDelete: PropTypes.func,
    onToggleVisibility: PropTypes.func,
    onColorChange: PropTypes.func,
    onOpacityChange: PropTypes.func,
    onZoomTo: PropTypes.func,
    isActive: PropTypes.bool,
};

export default DrawnFeatureItem;
