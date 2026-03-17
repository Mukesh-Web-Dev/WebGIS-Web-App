/**
 * ConfirmModal Molecule
 * 
 * Confirmation dialog with Yes/No options.
 * Used for destructive actions like deleting layers.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {Function} props.onConfirm - Confirm button handler
 * @param {Function} props.onCancel - Cancel button handler
 * @param {string} [props.variant='danger'] - Variant (danger, warning, info)
 * @param {string} [props.confirmText='Confirm'] - Confirm button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../atoms/Modal';
import { Button, Icon } from '../../atoms';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getVariantClass = () => {
    return `confirm-modal--${variant}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <div className={`confirm-modal ${getVariantClass()}`}>
        <div className="confirm-modal__header">
          <Icon name={getIcon()} size={32} className="confirm-modal__icon" />
          <h3 className="confirm-modal__title">{title}</h3>
        </div>
        
        <div className="confirm-modal__body">
          <p className="confirm-modal__message">{message}</p>
        </div>
        
        <div className="confirm-modal__footer">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="confirm-modal__button"
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className="confirm-modal__button"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  variant: PropTypes.oneOf(['danger', 'warning', 'info']),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default ConfirmModal;
