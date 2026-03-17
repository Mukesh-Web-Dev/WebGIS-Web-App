import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 * 
 * Provides interface for toast messages and upload progress notifications.
 * Each toast has a unique ID and configurable time-to-live.
 * Upload toasts persist until completion/error and show progress.
 * 
 * @returns {Object} Toast manager object
 * @returns {Array} toasts - Array of active toast objects
 * @returns {Function} addToast - Function to add a simple toast
 * @returns {Function} addUploadToast - Function to add an upload toast
 * @returns {Function} updateUploadToast - Function to update upload progress
 * @returns {Function} removeToast - Function to remove a toast by ID
 * 
 * @example
 * const { toasts, addToast, addUploadToast, updateUploadToast } = useToast();
 * addToast('File uploaded successfully!', 5000);
 * 
 * const uploadId = addUploadToast('myfile.geojson');
 * updateUploadToast(uploadId, { progress: 50, uploadStatus: 'reading' });
 */
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a new simple toast notification
   * @param {string|Object} message - Toast message or toast object
   * @param {number} [ttl=5000] - Time to live in milliseconds
   * @param {string} [type='info'] - Toast type
   * @returns {string} Toast ID
   */
  const addToast = useCallback((message, ttl, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Use explicit ttl if provided (including null), otherwise default to 5000
    const finalTtl = ttl !== undefined ? ttl : 5000;

    const toast = typeof message === 'object'
      ? { id, ttl: finalTtl, type, ...message }
      : { id, message, ttl: finalTtl, type };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  /**
   * Adds an upload notification toast
   * @param {string} fileName - Name of the file being uploaded
   * @param {string} [uploadId] - Optional custom ID for the upload
   * @returns {string} Upload toast ID
   */
  const addUploadToast = useCallback((fileName, uploadId) => {
    const id = uploadId || `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((prev) => [...prev, {
      id,
      fileName,
      message: 'Uploading...',
      type: 'upload',
      uploadStatus: 'queued',
      progress: 0,
      ttl: null, // Don't auto-dismiss uploads
    }]);

    return id;
  }, []);

  /**
   * Updates an existing upload toast
   * @param {string} id - Toast ID to update
   * @param {Object} updates - Fields to update (progress, uploadStatus, message, etc.)
   */
  const updateUploadToast = useCallback((id, updates) => {
    setToasts((prev) => prev.map((toast) => {
      if (toast.id !== id) return toast;

      const updated = { ...toast, ...updates };

      // Auto-dismiss completed/failed uploads after delay
      if (updates.uploadStatus === 'done' || updates.uploadStatus === 'error' || updates.uploadStatus === 'canceled') {
        updated.ttl = 5000;
      }

      return updated;
    }));
  }, []);

  /**
   * Removes a toast notification by ID
   * @param {string} id - Toast ID to remove
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    addUploadToast,
    updateUploadToast,
    removeToast,
  };
};

export default useToast;
