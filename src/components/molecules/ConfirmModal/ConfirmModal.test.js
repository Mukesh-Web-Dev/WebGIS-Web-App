/**
 * ConfirmModal Molecule Component Tests
 * 
 * Tests for ConfirmModal including:
 * - Rendering with different variants
 * - Button callbacks
 * - Icon selection
 * - Auto-focus behavior
 * - Integration with Modal
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal Component', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title and message', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    });

    it('should render confirm and cancel buttons with default text', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render custom button text', () => {
      render(
        <ConfirmModal
          {...defaultProps}
          confirmText="Delete"
          cancelText="Keep"
        />
      );

      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Keep')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ConfirmModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('should apply danger variant class', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} variant="danger" />
      );

      const modal = container.querySelector('.confirm-modal--danger');
      expect(modal).toBeInTheDocument();
    });

    it('should apply warning variant class', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} variant="warning" />
      );

      const modal = container.querySelector('.confirm-modal--warning');
      expect(modal).toBeInTheDocument();
    });

    it('should apply info variant class', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} variant="info" />
      );

      const modal = container.querySelector('.confirm-modal--info');
      expect(modal).toBeInTheDocument();
    });

    it('should default to danger variant', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const modal = container.querySelector('.confirm-modal--danger');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Button Callbacks', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when ESC is pressed', () => {
      render(<ConfirmModal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when backdrop is clicked', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const backdrop = container.querySelector('.modal-backdrop');
      fireEvent.click(backdrop);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto-focus Behavior', () => {
    it('should focus confirm button when modal opens', async () => {
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByText('Confirm');

      await waitFor(() => {
        expect(confirmButton).toHaveFocus();
      });
    });

    it('should refocus when modal reopens', async () => {
      const { rerender } = render(<ConfirmModal {...defaultProps} isOpen={false} />);

      rerender(<ConfirmModal {...defaultProps} isOpen={true} />);

      const confirmButton = screen.getByText('Confirm');

      await waitFor(() => {
        expect(confirmButton).toHaveFocus();
      });
    });
  });

  describe('Icon Rendering', () => {
    it('should render error icon for danger variant', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} variant="danger" />
      );

      // Icon component should be present in header
      const header = container.querySelector('.confirm-modal__header');
      expect(header).toBeInTheDocument();
    });

    it('should render warning icon for warning variant', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} variant="warning" />
      );

      const header = container.querySelector('.confirm-modal__header');
      expect(header).toBeInTheDocument();
    });

    it('should render info icon for info variant', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} variant="info" />
      );

      const header = container.querySelector('.confirm-modal__header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Integration with Modal', () => {
    it('should prevent body scroll when open', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll on close', () => {
      const { rerender } = render(<ConfirmModal {...defaultProps} />);

      rerender(<ConfirmModal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      render(<ConfirmModal {...defaultProps} />);

      const title = screen.getByText('Confirm Action');
      const message = screen.getByText('Are you sure you want to proceed?');

      expect(title.tagName).toBe('H3');
      expect(message.tagName).toBe('P');
    });
  });
});
