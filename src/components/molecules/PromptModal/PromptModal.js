/**
 * PromptModal Molecule
 * 
 * Input dialog for text entry.
 * Used for renaming layers, entering values, etc.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Prompt message
 * @param {string} [props.defaultValue=''] - Default input value
 * @param {string} [props.placeholder=''] - Input placeholder
 * @param {Function} props.onConfirm - Confirm handler (receives input value)
 * @param {Function} props.onCancel - Cancel handler
 * @param {Function} [props.validate] - Optional validation function
 * @param {string} [props.confirmText='OK'] - Confirm button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../atoms/Modal';
import { Button } from '../../atoms';
import './PromptModal.css';

const PromptModal = ({
  isOpen,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  onConfirm,
  onCancel,
  validate,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
      // Focus and select text after modal animates in
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    
    // Validate
    if (validate) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    if (onConfirm) onConfirm(trimmed);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <div className="prompt-modal">
        <div className="prompt-modal__header">
          <h3 className="prompt-modal__title">{title}</h3>
        </div>
        
        <div className="prompt-modal__body">
          <p className="prompt-modal__message">{message}</p>
          <input
            ref={inputRef}
            type="text"
            className="prompt-modal__input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
          />
          {error && (
            <p className="prompt-modal__error">{error}</p>
          )}
        </div>
        
        <div className="prompt-modal__footer">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="prompt-modal__button"
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="prompt-modal__button"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

PromptModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  validate: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default PromptModal;
