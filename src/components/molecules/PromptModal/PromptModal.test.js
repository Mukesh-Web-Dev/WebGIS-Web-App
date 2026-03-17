/**
 * PromptModal Molecule Component Tests
 * 
 * Tests for PromptModal including:
 * - Input rendering and interaction
 * - Validation
 * - Enter key submission
 * - Auto-focus and text selection
 * - Error display
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PromptModal from './PromptModal';

describe('PromptModal Component', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Rename Layer',
    message: 'Enter new layer name:',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title and message', () => {
      render(<PromptModal {...defaultProps} />);

      expect(screen.getByText('Rename Layer')).toBeInTheDocument();
      expect(screen.getByText('Enter new layer name:')).toBeInTheDocument();
    });

    it('should render input field', () => {
      render(<PromptModal {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render OK and Cancel buttons with default text', () => {
      render(<PromptModal {...defaultProps} />);

      expect(screen.getByText('OK')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render custom button text', () => {
      render(
        <PromptModal
          {...defaultProps}
          confirmText="Save"
          cancelText="Discard"
        />
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Discard')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<PromptModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Rename Layer')).not.toBeInTheDocument();
    });
  });

  describe('Default Value', () => {
    it('should populate input with default value', () => {
      render(<PromptModal {...defaultProps} defaultValue="Layer 1" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Layer 1');
    });

    it('should handle empty default value', () => {
      render(<PromptModal {...defaultProps} defaultValue="" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should update value when defaultValue changes', () => {
      const { rerender } = render(
        <PromptModal {...defaultProps} defaultValue="Layer 1" isOpen={false} />
      );

      rerender(
        <PromptModal {...defaultProps} defaultValue="Layer 2" isOpen={true} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Layer 2');
    });
  });

  describe('Input Interaction', () => {
    it('should update value when user types', async () => {
      const user = userEvent.setup();
      render(<PromptModal {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'New Layer Name');

      expect(input).toHaveValue('New Layer Name');
    });

    it('should display placeholder', () => {
      render(<PromptModal {...defaultProps} placeholder="Enter name..." />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter name...');
    });

    it('should clear error when user types', async () => {
      const user = userEvent.setup();
      const validate = jest.fn(() => 'Error message');

      render(<PromptModal {...defaultProps} validate={validate} />);

      const input = screen.getByRole('textbox');
      const okButton = screen.getByText('OK');

      // Trigger validation error
      await user.click(okButton);
      expect(screen.getByText('Error message')).toBeInTheDocument();

      // Type to clear error
      await user.type(input, 'a');
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  describe('Submission', () => {
    it('should call onConfirm with trimmed value when OK is clicked', async () => {
      const user = userEvent.setup();
      render(<PromptModal {...defaultProps} defaultValue="  Test Value  " />);

      const okButton = screen.getByText('OK');
      await user.click(okButton);

      expect(defaultProps.onConfirm).toHaveBeenCalledWith('Test Value');
    });

    it('should call onConfirm when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<PromptModal {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test{Enter}');

      expect(default Props.onConfirm).toHaveBeenCalledWith('Test');
    });

    it('should call onCancel when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<PromptModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when ESC is pressed', () => {
      render(<PromptModal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Validation', () => {
    it('should not call onConfirm if validation fails', async () => {
      const user = userEvent.setup();
      const validate = jest.fn(() => 'Validation error');

      render(<PromptModal {...defaultProps} validate={validate} />);

      const okButton = screen.getByText('OK');
      await user.click(okButton);

      expect(validate).toHaveBeenCalled();
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });

    it('should display validation error message', async () => {
      const user = userEvent.setup();
      const validate = jest.fn(() => 'Name is required');

      render(<PromptModal {...defaultProps} validate={validate} />);

      const okButton = screen.getByText('OK');
      await user.click(okButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('should call onConfirm if validation passes', async () => {
      const user = userEvent.setup();
      const validate = jest.fn(() => null);

      render(<PromptModal {...defaultProps} defaultValue="Valid" validate={validate} />);

      const okButton = screen.getByText('OK');
      await user.click(okButton);

      expect(validate).toHaveBeenCalledWith('Valid');
      expect(defaultProps.onConfirm).toHaveBeenCalledWith('Valid');
    });

    it('should validate trimmed value', async () => {
      const user = userEvent.setup();
      const validate = jest.fn(() => null);

      render(<PromptModal {...defaultProps} defaultValue="  spaces  " validate={validate} />);

      const okButton = screen.getByText('OK');
      await user.click(okButton);

      expect(validate).toHaveBeenCalledWith('spaces');
    });
  });

  describe('Auto-focus and Selection', () => {
    it('should focus input when modal opens', async () => {
      render(<PromptModal {...defaultProps} />);

      const input = screen.getByRole('textbox');

      await waitFor(() => {
        expect(input).toHaveFocus();
      }, { timeout: 200 });
    });

    it('should select text when modal opens with default value', async () => {
      render(<PromptModal {...defaultProps} defaultValue="Select Me" />);

      const input = screen.getByRole('textbox');

      await waitFor(() => {
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe(9);
      }, { timeout: 200 });
    });
  });

  describe('Integration with Modal', () => {
    it('should prevent body scroll when open', () => {
      render(<PromptModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll on close', () => {
      const { rerender } = render(<PromptModal {...defaultProps} />);

      rerender(<PromptModal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('');
    });
  });
});
