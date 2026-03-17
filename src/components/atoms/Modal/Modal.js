/**
 * Custom Modal Atom
 * 
 * Base modal component with glassmorphic backdrop and container.
 * Handles backdrop clicks, ESC key, and animations.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close handler
 * @param {ReactNode} props.children - Modal content
 * @param {boolean} [props.closeOnBackdrop=true] - Close on backdrop click
 * @param {boolean} [props.closeOnEsc=true] - Close on ESC key
 */

import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true
}) => {
  // Handle ESC key
  const handleEsc = useCallback((e) => {
    if (closeOnEsc && e.key === 'Escape' && onClose) {
      onClose();
    }
  }, [closeOnEsc, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  children: PropTypes.node.isRequired,
  closeOnBackdrop: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
};

export default Modal;
