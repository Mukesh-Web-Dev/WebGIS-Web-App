import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal dialogs
 * 
 * Provides Promise-based API for confirm and prompt dialogs.
 * Replaces native browser dialogs with custom glassmorphic modals.
 * 
 * @returns {Object} Modal manager object
 * @returns {Object} confirmModal - Confirm modal state
 * @returns {Object} promptModal - Prompt modal state
 * @returns {Function} showConfirm - Show confirmation dialog
 * @returns {Function} showPrompt - Show prompt dialog
 * 
 * @example
 * const { confirmModal, promptModal, showConfirm, showPrompt } = useModal();
 * 
 * // Confirmation
 * const confirmed = await showConfirm({
 *   title: 'Delete Layer',
 *   message: 'Are you sure?',
 *   variant: 'danger'
 * });
 * 
 * // Prompt
 * const value = await showPrompt({
 *   title: 'Rename Layer',
 *   message: 'Enter new name:',
 *   defaultValue: 'Layer 1'
 * });
 */
const useModal = () => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    resolve: null,
  });

  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    defaultValue: '',
    placeholder: '',
    validate: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    resolve: null,
  });

  /**
   * Show confirmation dialog
   * @param {Object} options - Dialog options
   * @returns {Promise<boolean>} Promise that resolves with true/false
   */
  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title: options.title || 'Confirm',
        message: options.message || '',
        variant: options.variant || 'danger',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        resolve,
      });
    });
  }, []);

  /**
   * Show prompt dialog
   * @param {Object} options - Dialog options
   * @returns {Promise<string|null>} Promise that resolves with value or null
   */
  const showPrompt = useCallback((options) => {
    return new Promise((resolve) => {
      setPromptModal({
        isOpen: true,
        title: options.title || 'Input',
        message: options.message || '',
        defaultValue: options.defaultValue || '',
        placeholder: options.placeholder || '',
        validate: options.validate || null,
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        resolve,
      });
    });
  }, []);

  /**
   * Handle confirm modal result
   */
  const handleConfirmResult = useCallback((confirmed) => {
    setConfirmModal((prev) => {
      if (prev.resolve) {
        prev.resolve(confirmed);
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  /**
   * Handle prompt modal result
   */
  const handlePromptResult = useCallback((value) => {
    setPromptModal((prev) => {
      if (prev.resolve) {
        prev.resolve(value);
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  return {
    confirmModal: {
      ...confirmModal,
      onConfirm: () => handleConfirmResult(true),
      onCancel: () => handleConfirmResult(false),
    },
    promptModal: {
      ...promptModal,
      onConfirm: handlePromptResult,
      onCancel: () => handlePromptResult(null),
    },
    showConfirm,
    showPrompt,
  };
};

export default useModal;
