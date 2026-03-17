/**
 * AddLayerOptionsModal Component
 * 
 * Overlay panel that provides two options for adding layers:
 * 1. Upload Layer - Opens file upload dialog
 * 2. Create New Layer - Creates a new empty vector layer
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onUploadLayer - Handler for upload layer option
 * @param {Function} props.onCreateLayer - Handler for create new layer option
 */

import React from 'react';
import PropTypes from 'prop-types';
import './AddLayerOptionsModal.css';

const AddLayerOptionsModal = ({
    isOpen,
    onClose,
    onUploadLayer,
    onCreateLayer
}) => {
    const handleClose = () => {
        onClose();
    };

    const handleUploadClick = () => {
        onUploadLayer();
    };

    const handleCreateClick = () => {
        onCreateLayer();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="add-layer-options-overlay" onClick={handleClose}>
            <div className="add-layer-options-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="add-layer-options-header">
                    <h3 className="add-layer-options-title">Add New Layer</h3>
                    <button className="add-layer-options-close" onClick={handleClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="add-layer-options-content">
                    <p className="add-layer-options-subtitle">Choose how to add a layer:</p>

                    <div className="add-layer-options-grid">
                        {/* Option 1: Upload Layer */}
                        <button
                            className="add-layer-option-card"
                            onClick={handleUploadClick}
                            aria-label="Upload layer from file"
                        >
                            <div className="add-layer-option-icon upload-icon">
                                📁
                            </div>
                            <h4 className="add-layer-option-title">Upload Layer</h4>
                            <p className="add-layer-option-description">
                                Import from GeoJSON, KML, KMZ, or Shapefile
                            </p>
                            <div className="add-layer-option-formats">
                                .geojson • .kml • .kmz • .zip
                            </div>
                        </button>

                        {/* Option 2: Create New Layer */}
                        <button
                            className="add-layer-option-card"
                            onClick={handleCreateClick}
                            aria-label="Create new empty layer"
                        >
                            <div className="add-layer-option-icon create-icon">
                                ✨
                            </div>
                            <h4 className="add-layer-option-title">Create New Layer</h4>
                            <p className="add-layer-option-description">
                                Start with a new empty vector layer
                            </p>
                            <div className="add-layer-option-formats">
                                Ready for drawing features
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

AddLayerOptionsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUploadLayer: PropTypes.func.isRequired,
    onCreateLayer: PropTypes.func.isRequired,
};

export default AddLayerOptionsModal;
