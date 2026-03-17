/**
 * ToastNotification Molecule Component Tests
 * 
 * Tests for ToastNotification including:
 * - Rendering with message
 * - Type variants
 * - Upload progress display
 * - Close button functionality
 * - Auto-dismiss behavior
 */

import React from 'react';
import { render, screen, act } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ToastNotification from './ToastNotification';

describe('ToastNotification Component', () => {
  jest.useFakeTimers();

  const defaultProps = {
    id: 'toast-1',
    message: 'Test notification',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('Rendering', () => {
    it('should render message', () => {
      render(<ToastNotification {...defaultProps} />);

      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ToastNotification {...defaultProps} />);

      const closeButton = screen.getByLabelText(/close/i);
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Type Variants', () => {
    it('should apply info variant class', () => {
      const { container } = render(
        <ToastNotification {...defaultProps} type="info" />
      );

      const toast = container.querySelector('.toast-notification--info');
      expect(toast).toBeInTheDocument();
    });

    it('should apply success variant class', () => {
      const { container } = render(
        <ToastNotification {...defaultProps} type="success" />
      );

      const toast = container.querySelector('.toast-notification--success');
      expect(toast).toBeInTheDocument();
    });

    it('should apply error variant class', () => {
      const { container } = render(
        <ToastNotification {...defaultProps} type="error" />
      );

      const toast = container.querySelector('.toast-notification--error');
      expect(toast).toBeInTheDocument();
    });

    it('should apply upload variant class', () => {
      const { container } = render(
        <ToastNotification {...defaultProps} type="upload" />
      );

      const toast = container.querySelector('.toast-notification--upload');
      expect(toast).toBeInTheDocument();
    });
  });

  describe('Upload Progress', () => {
    it('should display file name for upload type', () => {
      render(
        <ToastNotification
          {...defaultProps}
          type="upload"
          fileName="test-file.geojson"
        />
      );

      expect(screen.getByText('test-file.geojson')).toBeInTheDocument();
    });

    it('should display progress bar for upload type', () => {
      const { container } = render(
        <ToastNotification
          {...defaultProps}
          type="upload"
          progress={50}
        />
      );

      const progressBar = container.querySelector('.toast-notification__progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should set progress bar width based on progress prop', () => {
      const { container } = render(
        <ToastNotification
          {...defaultProps}
          type="upload"
          progress={75}
        />
      );

      const progressFill = container.querySelector('.toast-notification__progress-fill');
      expect(progressFill).toHaveStyle({ width: '75%' });
    });

    it('should display upload status text', () => {
      render(
        <ToastNotification
          {...defaultProps}
          type="upload"
          uploadStatus="reading"
        />
      );

      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onClose = jest.fn();

      render(<ToastNotification {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledWith(defaultProps.id);
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after duration', () => {
      const onClose = jest.fn();

      render(
        <ToastNotification {...defaultProps} onClose={onClose} duration={3000} />
      );

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(onClose).toHaveBeenCalledWith(defaultProps.id);
    });

    it('should not auto-dismiss for active uploads', () => {
      const onClose = jest.fn();

      render(
        <ToastNotification
          {...defaultProps}
          type="upload"
          uploadStatus="reading"
          onClose={onClose}
          duration={5000}
        />
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should auto-dismiss completed uploads', () => {
      const onClose = jest.fn();

      render(
        <ToastNotification
          {...defaultProps}
          type="upload"
          uploadStatus="done"
          onClose={onClose}
          duration={5000}
        />
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(onClose).toHaveBeenCalledWith(defaultProps.id);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      render(<ToastNotification {...defaultProps} />);

      const closeButton = screen.getByLabelText(/close/i);
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });
});
