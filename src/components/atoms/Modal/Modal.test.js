/**
 * Modal Atom Component Tests
 * 
 * Tests for the base Modal component including:
 * - Rendering with children
 * - ESC key handling
 * - Backdrop click handling
 * - Body scroll prevention
 * - Cleanup behavior
 */

import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils';
import '@testing-library/jest-dom';
import Modal from './Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should render with backdrop', () => {
      const { container } = render(
        <Modal isOpen={true}>
          <div>Content</div>
        </Modal>
      );

      const backdrop = container.querySelector('.modal-backdrop');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render with modal container', () => {
      const { container } = render(
        <Modal isOpen={true}>
          <div>Content</div>
        </Modal>
      );

      const modalContainer = container.querySelector('.modal-container');
      expect(modalContainer).toBeInTheDocument();
    });
  });

  describe('ESC Key Handling', () => {
    it('should call onClose when ESC is pressed', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when ESC is pressed if closeOnEsc is false', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnEsc={false}>
          <div>Content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onClose for other keys', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'a' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Backdrop Click Handling', () => {
    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );

      const backdrop = container.querySelector('.modal-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when backdrop is clicked if closeOnBackdrop is false', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnBackdrop={false}>
          <div>Content</div>
        </Modal>
      );

      const backdrop = container.querySelector('.modal-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when modal content is clicked', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );

      const modalContainer = container.querySelector('.modal-container');
      fireEvent.click(modalContainer);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Prevention', () => {
    it('should prevent body scroll when modal is open', () => {
      render(
        <Modal isOpen={true}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(
        <Modal isOpen={true}>
          <div>Content</div>
        </Modal>
      );

      unmount();

      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body scroll when modal closes', () => {
      const { rerender } = render(
        <Modal isOpen={true}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Props Validation', () => {
    it('should handle missing onClose gracefully', () => {
      const { container } = render(
        <Modal isOpen={true}>
          <div>Content</div>
        </Modal>
      );

      const backdrop = container.querySelector('.modal-backdrop');
      
      // Should not throw error
      expect(() => fireEvent.click(backdrop)).not.toThrow();
      expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
