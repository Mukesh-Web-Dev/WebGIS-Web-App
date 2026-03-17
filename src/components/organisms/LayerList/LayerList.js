/**
 * LayerList Organism
 * 
 * Displays a list of map layers with controls.
 * Refactored to use LayerItem molecules for cleaner, more maintainable code.
 * 
 * This organism was reduced from 176 lines to ~80 lines by delegating
 * individual layer rendering to the LayerItem molecule.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.layerList - Array of layer objects
 * @param {Function} props.moveLayer - Move layer handler (index, direction)
 * @param {Function} props.removeLayer - Remove layer handler
 * @param {Function} props.toggleVisibility - Toggle visibility handler
 * @param {Function} props.setOpacity - Set opacity handler
 * @param {Function} props.renameLayer - Rename layer handler
 * @param {Function} props.zoomToLayer - Zoom to layer handler
 * @param {Function} props.openColorPicker - Open color picker handler
 * @param {boolean} [props.showHeader=true] - Whether to show the header
 * 
 * @example
 * <LayerList
 *   layerList={layers}
 *   moveLayer={handleMoveLayer}
 *   removeLayer={handleRemoveLayer}
 *   toggleVisibility={handleToggleVisibility}
 *   setOpacity={handleSetOpacity}
 *   renameLayer={handleRenameLayer}
 *   zoomToLayer={handleZoomToLayer}
 *   openColorPicker={handleOpenColorPicker}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LayerItem } from '../../molecules';
import './LayerList.css';

const LayerList = ({
  layerList,
  moveLayer,
  removeLayer,
  toggleVisibility,
  setOpacity,
  renameLayer,
  zoomToLayer,
  openColorPicker,
  addToast,
  showHeader = true,
  activeLayerId,
  onLayerSelect,
}) => {
  // Filter out base layers from display
  const visibleLayers = layerList.filter(item => !item.isBaseLayer);

  const listMarkup = (
    <ul className="layer-list">
      {visibleLayers.map((item, index) => (
        <LayerItem
          key={item.id}
          item={item}
          index={index}
          totalLayers={visibleLayers.length}
          onMoveLayer={moveLayer}
          onToggleVisibility={toggleVisibility}
          onSetOpacity={setOpacity}
          onRenameLayer={renameLayer}
          onZoomToLayer={zoomToLayer}
          onRemoveLayer={removeLayer}
          onColorClick={openColorPicker}
          addToast={addToast}
          isActive={activeLayerId === item.id}
          onSelect={() => onLayerSelect && onLayerSelect(item.id)}
        />
      ))}
    </ul>
  );

  if (showHeader) {
    return (
      <div className="layer-list-container panel-section card">
        <h4 className="layer-list__header">
          Layers ({visibleLayers.length})
        </h4>
        {listMarkup}
      </div>
    );
  }

  return listMarkup;
};

LayerList.propTypes = {
  layerList: PropTypes.array.isRequired,
  moveLayer: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  toggleVisibility: PropTypes.func.isRequired,
  setOpacity: PropTypes.func.isRequired,
  renameLayer: PropTypes.func.isRequired,
  zoomToLayer: PropTypes.func.isRequired,
  openColorPicker: PropTypes.func.isRequired,
  addToast: PropTypes.func,
  showHeader: PropTypes.bool,
  activeLayerId: PropTypes.string,
  onLayerSelect: PropTypes.func,
};

export default LayerList;
