/**
 * Modal System Integration Tests
 * 
 * Integration tests for the complete modal system including:
 * - useModal + ConfirmModal workflow
 * - useModal + PromptModal workflow  
 * - Sequential modal interactions
 * - Real-world usage scenarios
 */

import React from 'react';
import { render, screen, waitFor } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ConfirmModal, PromptModal } from '../../../components/molecules';
import useModal from '../../../shared/hooks/useModal';

// Test component that uses the modal system
function TestComponent() {
  const { confirmModal, promptModal, showConfirm, showPrompt } = useModal();
  const [result, setResult] = React.useState('');

  const handleConfirmTest = async () => {
    const confirmed = await showConfirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      variant: 'danger',
    });

    setResult(confirmed ? 'Confirmed' : 'Canceled');
  };

  const handlePromptTest = async () => {
    const value = await showPrompt({
      title: 'Rename Item',
      message: 'Enter new name:',
      defaultValue: 'Old Name',
    });

    setResult(value !== null ? `Renamed to: ${value}` : 'Canceled');
  };

  return (
    <div>
      <button onClick={handleConfirmTest}>Show Confirm</button>
      <button onClick={handlePromptTest}>Show Prompt</button>
      <div data-testid="result">{result}</div>

      <ConfirmModal {...confirmModal} />
      <PromptModal {...promptModal} />
    </div>
  );
}

describe('Modal System Integration', () => {
  describe('Confirm Modal Workflow', () => {
    it('should complete full confirm workflow when user confirms', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      // Trigger confirmation
      const showButton = screen.getByText('Show Confirm');
      await user.click(showButton);

      // Modal should appear
      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
      });

      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();

      // Confirm
      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      // Modal should close and result should update
      await waitFor(() => {
        expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('Confirmed');
    });

    it('should complete full confirm workflow when user cancels', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      // Trigger confirmation
      const showButton = screen.getByText('Show Confirm');
      await user.click(showButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
      });

      // Cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Modal should close and result should update
      await waitFor(() => {
        expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('Canceled');
    });

    it('should cancel via ESC key', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      const showButton = screen.getByText('Show Confirm');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
      });

      // Press ESC
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('Canceled');
    });
  });

  describe('Prompt Modal Workflow', () => {
    it('should complete full prompt workflow when user confirms', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      // Trigger prompt
      const showButton = screen.getByText('Show Prompt');
      await user.click(showButton);

      // Modal should appear
      await waitFor(() => {
        expect(screen.getByText('Rename Item')).toBeInTheDocument();
      });

      // Input should have default value
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Old Name');

      //Change value
      await user.clear(input);
      await user.type(input, 'New Name');

      // Confirm
      const okButton = screen.getByText('OK');
      await user.click(okButton);

      // Modal should close and result should update
      await waitFor(() => {
        expect(screen.queryByText('Rename Item')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('Renamed to: New Name');
    });

    it('should complete full prompt workflow when user cancels', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      // Trigger prompt
      const showButton = screen.getByText('Show Prompt');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('Rename Item')).toBeInTheDocument();
      });

      // Cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Rename Item')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('Canceled');
    });

    it('should submit via Enter key', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      const showButton = screen.getByText('Show Prompt');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('Rename Item')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Quick Name{Enter}');

      await waitFor(() => {
        expect(screen.queryByText('Rename Item')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('Renamed to: Quick Name');
    });
  });

  describe('Sequential Modals', () => {
    it('should handle confirm then prompt in sequence', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      // First: Confirm
      await user.click(screen.getByText('Show Confirm'));
      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Confirm'));
      await waitFor(() => {
        expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
      });

      // Second: Prompt
      await user.click(screen.getByText('Show Prompt'));
      await waitFor(() => {
        expect(screen.getByText('Rename Item')).toBeInTheDocument();
      });
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Final Name');
      await user.click(screen.getByText('OK'));

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('Renamed to: Final Name');
      });
    });
  });

  describe('Body Scroll Management', () => {
    it('should prevent body scroll while modal is open', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      expect(document.body.style.overflow).toBe('');

      await user.click(screen.getByText('Show Confirm'));

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      await user.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('');
      });
    });
  });
});
