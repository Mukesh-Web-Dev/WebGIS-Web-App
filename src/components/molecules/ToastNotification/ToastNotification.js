/**
 * ToastNotification Molecule
 * 
 * Individual toast notification component.
 * Displays temporary messages with auto-dismiss functionality.
 * Enhanced to support upload progress tracking with progress bars.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.message - Message to display
 * @param {string} [props.type='info'] - Toast type (info, success, warning, error, upload)
 * @param {Function} [props.onClose] - Close handler
 * @param {number} [props.duration=5000] - Display duration in ms
 * @param {number} [props.progress] - Upload progress (0-100)
 * @param {string} [props.uploadStatus] - Upload status (queued, reading, done, error, canceled)
 * @param {string} [props.fileName] - File name for upload notifications
 * 
 * @example
 * // Simple message toast
 * <ToastNotification
 *   id="toast-1"
 *   message="File uploaded successfully"
 *   type="success"
 *   onClose={() => removeToast('toast-1')}
 * />
 * 
 * @example
 * // Upload progress toast
 * <ToastNotification
 *   id="upload-1"
 *   message="Uploading file..."
 *   type="upload"
 *   fileName="map-data.geojson"
 *   progress={45}
 *   uploadStatus="reading"
 * />
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../atoms';
import './ToastNotification.css';

const ToastNotification = ({
  id,
  message,
  type = 'info',
  onClose,
  duration = 5000,
  progress,
  uploadStatus,
  fileName
}) => {
  const timerRef = useRef(null);
  const isUpload = type === 'upload' || uploadStatus;

  useEffect(() => {
    // Don't auto-dismiss active uploads
    if (isUpload && uploadStatus === 'reading') {
      return;
    }

    // Don't auto-dismiss if duration is null or undefined (persistent notifications)
    if (duration !== null && duration !== undefined && onClose) {
      timerRef.current = setTimeout(() => {
        onClose(id);
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration, onClose, isUpload, uploadStatus]);

  const getIcon = () => {
    if (isUpload) {
      if (uploadStatus === 'done') return 'success';
      if (uploadStatus === 'error') return 'error';
      if (uploadStatus === 'canceled') return 'warning';
      return 'upload';
    }

    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusText = () => {
    if (!uploadStatus) return '';
    switch (uploadStatus) {
      case 'queued':
        return 'Queued';
      case 'reading':
        return 'Processing';
      case 'done':
        return 'Complete';
      case 'error':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      default:
        return uploadStatus;
    }
  };

  const toastType = isUpload && uploadStatus === 'error' ? 'error'
    : isUpload && uploadStatus === 'done' ? 'success'
      : isUpload ? 'upload'
        : type;

  return (
    <div className={`toast-notification toast-notification--${toastType}`} role="status">
      <Icon name={getIcon()} size={16} className="toast-notification__icon" />

      <div className="toast-notification__content">
        {fileName && (
          <div className="toast-notification__filename">{fileName}</div>
        )}
        <span className="toast-notification__message">{message}</span>

        {isUpload && uploadStatus && (
          <div className="toast-notification__status">
            {getStatusText()}
            {typeof progress === 'number' && uploadStatus === 'reading' && (
              <> ({Math.round(progress)}%)</>
            )}
          </div>
        )}

        {typeof progress === 'number' && uploadStatus === 'reading' && (
          <div className="toast-notification__progress-bar">
            <div
              className="toast-notification__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {onClose && (
        <button
          className="toast-notification__close"
          onClick={() => onClose(id)}
          aria-label="Close notification"
          title="Close"
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  );
};

ToastNotification.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'upload']),
  onClose: PropTypes.func,
  duration: PropTypes.number,
  progress: PropTypes.number,
  uploadStatus: PropTypes.oneOf(['queued', 'reading', 'done', 'error', 'canceled']),
  fileName: PropTypes.string,
};

export default ToastNotification;
