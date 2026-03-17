import React from "react";
import PropTypes from "prop-types";

const UploadButtonCard = ({ inputId = "file-upload", onFileChange }) => {
  return (
    <div className="upload-card">
      <label
        htmlFor={inputId}
        className="upload-btn"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const el = document.getElementById(inputId);
            if (el) el.click();
          }
        }}
      >
        + Layer
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        accept=".json, .geojson, .kml, .kmz, .zip"
        onChange={onFileChange}
        className="hidden-input"
      />
    </div>
  );
};

UploadButtonCard.propTypes = {
  inputId: PropTypes.string,
  onFileChange: PropTypes.func.isRequired,
};

export default UploadButtonCard;
