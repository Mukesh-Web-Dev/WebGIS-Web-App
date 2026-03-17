/**
 * ExportLayerModal Molecule
 * 
 * Modal dialog for selecting export format (GeoJSON, KML, PNG).
 * Displays format options with descriptions and handles export actions.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './ExportLayerModal.css';

const ExportLayerModal = ({
    isOpen,
    onClose,
    onExportGeoJSON,
    onExportKML,
    onExportPNG,
    isProcessing,
    activeLayerName
}) => {
    if (!isOpen) return null;

    return (
        <div className="export-modal-overlay" onClick={onClose}>
            <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="export-modal-title">
                    Export Layer
                    {activeLayerName && <span className="export-layer-name">{activeLayerName}</span>}
                </h3>

                {isProcessing ? (
                    <div className="export-processing">
                        <div className="export-spinner"></div>
                        <p>Processing export...</p>
                    </div>
                ) : (
                    <div className="export-options">
                        <button
                            className="export-option-btn"
                            onClick={onExportGeoJSON}
                            title="Export as GeoJSON with styles preserved"
                        >
                            <span className="export-option-label">📄 GeoJSON</span>
                            <span className="export-option-desc">
                                Vector data with custom styles & properties
                            </span>
                        </button>

                        <button
                            className="export-option-btn"
                            onClick={onExportKML}
                            title="Export as KML for Google Earth"
                        >
                            <span className="export-option-label">🌍 KML</span>
                            <span className="export-option-desc">
                                Best for Google Earth with native styling
                            </span>
                        </button>

                        <button
                            className="export-option-btn"
                            onClick={onExportPNG}
                            title="Export as PNG image snapshot"
                        >
                            <span className="export-option-label">🖼️ PNG Image</span>
                            <span className="export-option-desc">
                                Raster snapshot of layer extent
                            </span>
                        </button>

                        <button
                            className="export-cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

ExportLayerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onExportGeoJSON: PropTypes.func.isRequired,
    onExportKML: PropTypes.func.isRequired,
    onExportPNG: PropTypes.func.isRequired,
    isProcessing: PropTypes.bool,
    activeLayerName: PropTypes.string
};

ExportLayerModal.defaultProps = {
    isProcessing: false,
    activeLayerName: ''
};

export default ExportLayerModal;
