/**
 * LayerItem Molecule
 * 
 * Displays a single layer with controls for visibility, opacity, color,
 * ordering, renaming, zooming, and deletion.
 * 
 * This molecule combines multiple atoms (Button, Slider, Icon) to create
 * a functional layer item component.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.item - Layer item object with metadata
 * @param {number} props.index - Index in the layer list
 * @param {number} props.totalLayers - Total number of layers
 * @param {Function} props.onMoveLayer - Move layer handler (index, direction)
 * @param {Function} props.onToggleVisibility - Toggle visibility handler
 * @param {Function} props.onSetOpacity - Set opacity handler
 * @param {Function} props.onRenameLayer - Rename layer handler
 * @param {Function} props.onZoomToLayer - Zoom to layer handler
 * @param {Function} props.onRemoveLayer - Remove layer handler
 * @param {Function} props.onColorClick - Color picker trigger
 * 
 * @example
 * <LayerItem
 *   item={layerData}
 *   index={0}
 *   totalLayers={5}
 *   onMoveLayer={handleMove}
 *   onToggleVisibility={handleToggle}
 *   onSetOpacity={handleOpacity}
 *   onRenameLayer={handleRename}
 *   onZoomToLayer={handleZoom}
 *   onRemoveLayer={handleRemove}
 *   onColorClick={handleColorClick}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Slider, Icon } from '../../atoms';
import { isVectorLayer, getLayerColor } from '../../../features/layers/utils/styleUtils';
import './LayerItem.css';

const LayerItem = ({
  item,
  index,
  totalLayers,
  onMoveLayer,
  onToggleVisibility,
  onSetOpacity,
  onRenameLayer,
  onZoomToLayer,
  onRemoveLayer,
  onColorClick,
  addToast,
  isActive = false,
  onSelect,
}) => {
  /**
   * Handle rename - delegates to parent
   */
  const handleRename = () => {
    onRenameLayer(item.layer);
  };

  /**
   * Handle color click for vector layers
   */
  const handleColorSpanClick = (event) => {
    if (!isVectorLayer(item.layer) || !onColorClick) return;
    event.stopPropagation();
    onColorClick(item.layer);
  };

  const canChangeColor = isVectorLayer(item.layer) && onColorClick;
  const layerColor = getLayerColor(item.layer);

  return (
    <li
      className={`layer-item ${isActive ? 'active-layer' : ''}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      {/* Layer Title and Actions */}
      <div className="layer-item__header">
        <div
          className="layer-item__title"
          onClick={() => onZoomToLayer && onZoomToLayer(item.layer)}
          style={{ cursor: onZoomToLayer ? 'pointer' : 'default' }}
          title={`Click to zoom to ${item.title}`}
        >
          {item.title}
        </div>

        <div className="layer-item__header-actions">
          {/* Rename Button */}
          <button
            type="button"
            className="layer-item__btn"
            aria-label={`Rename ${item.title}`}
            onClick={handleRename}
            title="Rename layer"
          >
            <Icon name="edit" size={14} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            className="layer-item__btn layer-item__btn--danger"
            aria-label={`Remove ${item.title}`}
            onClick={() => onRemoveLayer(item.layer)}
            disabled={item.isBaseLayer}
            title="Remove Layer"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="layer-item__controls">
        {/* Color Indicator */}
        <span
          className="layer-item__color-swatch"
          onClick={handleColorSpanClick}
          style={{
            background: layerColor,
            cursor: canChangeColor ? 'pointer' : 'default',
            border: canChangeColor ? '1px solid rgba(134, 224, 207, 0.5)' : 'none',
          }}
          title={canChangeColor ? "Click to change color" : "Layer color"}
        />

        {/* Move Up Button */}
        <button
          type="button"
          className="layer-item__btn"
          aria-label={`Move ${item.title} up`}
          onClick={() => onMoveLayer(index, 1)}
          disabled={index === 0}
          title="Move Up"
        >
          <Icon name="arrow-up" size={14} />
        </button>

        {/* Move Down Button */}
        <button
          type="button"
          className="layer-item__btn"
          aria-label={`Move ${item.title} down`}
          onClick={() => onMoveLayer(index, -1)}
          disabled={index === totalLayers - 1}
          title="Move Down"
        >
          <Icon name="arrow-down" size={14} />
        </button>

        {/* Visibility Toggle */}
        <button
          type="button"
          className="layer-item__btn"
          aria-label={item.visible ? `Hide ${item.title}` : `Show ${item.title}`}
          onClick={() => onToggleVisibility(item.layer)}
          title={item.visible ? "Hide layer" : "Show layer"}
        >
          <Icon name={item.visible ? "eye" : "eye-off"} size={14} />
        </button>

        {/* Opacity Slider */}
        <Slider
          value={item.opacity}
          onChange={(value) => onSetOpacity(item.layer, value)}
          min={0}
          max={1}
          step={0.05}
          className="layer-item__opacity"
          title={`Opacity: ${Math.round(item.opacity * 100)}%`}
          aria-label={`Opacity for ${item.title}`}
        />
      </div>
    </li>
  );
};

LayerItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    opacity: PropTypes.number.isRequired,
    isBaseLayer: PropTypes.bool,
    layer: PropTypes.object.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  totalLayers: PropTypes.number.isRequired,
  onMoveLayer: PropTypes.func.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
  onSetOpacity: PropTypes.func.isRequired,
  onRenameLayer: PropTypes.func.isRequired,
  onZoomToLayer: PropTypes.func.isRequired,
  onRemoveLayer: PropTypes.func.isRequired,
  onColorClick: PropTypes.func.isRequired,
  addToast: PropTypes.func,
  isActive: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default LayerItem;
