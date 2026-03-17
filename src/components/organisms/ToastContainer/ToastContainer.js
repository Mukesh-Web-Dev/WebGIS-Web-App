/**
 * ToastContainer Organism
 * 
 * Container for managing and displaying multiple toast notifications.
 * Refactored to use ToastNotification molecules.
 * Supports both simple messages and upload progress notifications.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.toasts - Array of toast objects
 * @param {Function} props.removeToast - Remove toast handler
 * 
 * @example
 * <ToastContainer
 *   toasts={[
 *     { id: '1', message: 'Success!', type: 'success' },
 *     { id: '2', fileName: 'map.geojson', uploadStatus: 'reading', progress: 45 }
 *   ]}
 *   removeToast={handleRemoveToast}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ToastNotification } from '../../molecules';
import './ToastContainer.css';

const ToastContainer = ({ toasts = [], removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type || 'info'}
          onClose={removeToast}
          duration={toast.ttl !== null && toast.ttl !== undefined ? toast.ttl : 5000}
          progress={toast.progress}
          uploadStatus={toast.uploadStatus}
          fileName={toast.fileName}
        />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'upload']),
      ttl: PropTypes.number,
      progress: PropTypes.number,
      uploadStatus: PropTypes.oneOf(['queued', 'reading', 'done', 'error', 'canceled']),
      fileName: PropTypes.string,
    })
  ),
  removeToast: PropTypes.func.isRequired,
};

export default ToastContainer;
