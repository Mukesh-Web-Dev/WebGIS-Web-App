/**
 * AddLayerDialog Component
 * 
 * Dialog for uploading layer files (GeoJSON, KML, KMZ, Shapefile).
 */

import React from 'react';
import PropTypes from 'prop-types';
import './AddLayerDialog.css';

const AddLayerDialog = ({
  isOpen,
  onClose,
  onUploadFile
}) => {
  const fileInputRef = React.useRef(null);

  const handleClose = () => {
    onClose();
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    onUploadFile(event);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-layer-overlay" onClick={handleClose}>
      <div className="add-layer-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="add-layer-header">
          <h3 className="add-layer-title">Upload Layer File</h3>
          <button className="add-layer-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="add-layer-upload">
          <div className="add-layer-upload-icon">📁</div>
          <p className="add-layer-upload-text">
            Select a file to upload
          </p>
          <p className="add-layer-upload-formats">
            Supported: GeoJSON, KML, KMZ, Shapefile (.zip)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.geojson,.kml,.kmz,.zip"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            multiple
          />
          <div className="add-layer-upload-actions">
            <button className="add-layer-btn add-layer-btn-primary" onClick={handleUploadClick}>
              Choose File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AddLayerDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUploadFile: PropTypes.func.isRequired,
};

export default AddLayerDialog;
