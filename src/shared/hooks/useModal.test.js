/**
 * useModal Hook Tests
 * 
 * Tests for the useModal hook including:
 * - showConfirm Promise resolution
 * - showPrompt Promise resolution
 * - Modal state management
 * - Multiple modals handling
 * - Promise rejection/cancellation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import useModal from './useModal';

describe('useModal Hook', () => {
  describe('Initial State', () => {
    it('should initialize with closed modals', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.confirmModal.isOpen).toBe(false);
      expect(result.current.promptModal.isOpen).toBe(false);
    });

    it('should provide showConfirm function', () => {
      const { result } = renderHook(() => useModal());

      expect(typeof result.current.showConfirm).toBe('function');
    });

    it('should provide showPrompt function', () => {
      const { result } = renderHook(() => useModal());

      expect(typeof result.current.showPrompt).toBe('function');
    });
  });

  describe('showConfirm', () => {
    it('should open confirm modal with provided options', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.showConfirm({
          title: 'Delete Layer',
          message: 'Are you sure?',
          variant: 'danger',
        });
      });

      expect(result.current.confirmModal.isOpen).toBe(true);
      expect(result.current.confirmModal.title).toBe('Delete Layer');
      expect(result.current.confirmModal.message).toBe('Are you sure?');
      expect(result.current.confirmModal.variant).toBe('danger');
    });

    it('should return a Promise', () => {
      const { result } = renderHook(() => useModal());

      const promise = result.current.showConfirm({
        title: 'Test',
        message: 'Test message',
      });

      expect(promise).toBeInstanceOf(Promise);
    });

    it('should resolve to true when confirmed', async () => {
      const { result } = renderHook(() => useModal());

      let confirmPromise;
      act(() => {
        confirmPromise = result.current.showConfirm({
          title: 'Test',
          message: 'Test message',
        });
      });

      act(() => {
        result.current.confirmModal.onConfirm();
      });

      const confirmed = await confirmPromise;
      expect(confirmed).toBe(true);
    });

    it('should resolve to false when canceled', async () => {
      const { result }= renderHook(() => useModal());

      let confirmPromise;
      act(() => {
        confirmPromise = result.current.showConfirm({
          title: 'Test',
          message: 'Test message',
        });
      });

      act(() => {
        result.current.confirmModal.onCancel();
      });

      const confirmed = await confirmPromise;
      expect(confirmed).toBe(false);
    });

    it('should close modal after confirmation', async () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.showConfirm({
          title: 'Test',
          message: 'Test message',
        });
      });

      expect(result.current.confirmModal.isOpen).toBe(true);

      act(() => {
        result.current.confirmModal.onConfirm();
      });

      await waitFor(() => {
        expect(result.current.confirmModal.isOpen).toBe(false);
      });
    });

    it('should apply default values for missing options', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.showConfirm({ message: 'Test' });
      });

      expect(result.current.confirmModal.title).toBe('Confirm');
      expect(result.current.confirmModal.variant).toBe('danger');
      expect(result.current.confirmModal.confirmText).toBe('Confirm');
      expect(result.current.confirmModal.cancelText).toBe('Cancel');
    });
  });

  describe('showPrompt', () => {
    it('should open prompt modal with provided options', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.showPrompt({
          title: 'Rename Layer',
          message: 'Enter new name:',
          defaultValue: 'Layer 1',
        });
      });

      expect(result.current.promptModal.isOpen).toBe(true);
      expect(result.current.promptModal.title).toBe('Rename Layer');
      expect(result.current.promptModal.message).toBe('Enter new name:');
      expect(result.current.promptModal.defaultValue).toBe('Layer 1');
    });

    it('should return a Promise', () => {
      const { result } = renderHook(() => useModal());

      const promise = result.current.showPrompt({
        title: 'Test',
        message: 'Test message',
      });

      expect(promise).toBeInstanceOf(Promise);
    });

    it('should resolve to input value when confirmed', async () => {
      const { result } = renderHook(() => useModal());

      let promptPromise;
      act(() => {
        promptPromise = result.current.showPrompt({
          title: 'Test',
          message: 'Enter value:',
        });
      });

      act(() => {
        result.current.promptModal.onConfirm('New Value');
      });

      const value = await promptPromise;
      expect(value).toBe('New Value');
    });

    it('should resolve to null when canceled', async () => {
      const { result } = renderHook(() => useModal());

      let promptPromise;
      act(() => {
        promptPromise = result.current.showPrompt({
          title: 'Test',
          message: 'Enter value:',
        });
      });

      act(() => {
        result.current.promptModal.onCancel();
      });

      const value = await promptPromise;
      expect(value).toBe(null);
    });

    it('should close modal after confirmation', async () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.showPrompt({
          title: 'Test',
          message: 'Enter value:',
        });
      });

      expect(result.current.promptModal.isOpen).toBe(true);

      act(() => {
        result.current.promptModal.onConfirm('Value');
      });

      await waitFor(() => {
        expect(result.current.promptModal.isOpen).toBe(false);
      });
    });

    it('should apply default values for missing options', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.showPrompt({ message: 'Test' });
      });

      expect(result.current.promptModal.title).toBe('Input');
      expect(result.current.promptModal.defaultValue).toBe('');
      expect(result.current.promptModal.placeholder).toBe('');
      expect(result.current.promptModal.confirmText).toBe('OK');
      expect(result.current.promptModal.cancelText).toBe('Cancel');
    });
  });

  describe('Multiple Modals', () => {
    it('should handle sequential confirm modals', async () => {
      const { result } = renderHook(() => useModal());

      // First modal
      let firstPromise;
      act(() => {
        firstPromise = result.current.showConfirm({
          title: 'First',
          message: 'First message',
        });
      });

      act(() => {
        result.current.confirmModal.onConfirm();
      });

      const firstResult = await firstPromise;
      expect(firstResult).toBe(true);

      // Second modal
      let secondPromise;
      act(() => {
        secondPromise = result.current.showConfirm({
          title: 'Second',
          message: 'Second message',
        });
      });

      expect(result.current.confirmModal.title).toBe('Second');

      act(() => {
        result.current.confirmModal.onCancel();
      });

      const secondResult = await secondPromise;
      expect(secondResult).toBe(false);
    });

    it('should handle sequential prompt modals', async () => {
      const { result } = renderHook(() => useModal());

      // First modal
      let firstPromise;
      act(() => {
        firstPromise = result.current.showPrompt({
          title: 'First',
          message: 'First input:',
        });
      });

      act(() => {
        result.current.promptModal.onConfirm('Value 1');
      });

      const firstResult = await firstPromise;
      expect(firstResult).toBe('Value 1');

      // Second modal
      let secondPromise;
      act(() => {
        secondPromise = result.current.showPrompt({
          title: 'Second',
          message: 'Second input:',
        });
      });

      act(() => {
        result.current.promptModal.onConfirm('Value 2');
      });

      const secondResult = await secondPromise;
      expect(secondResult).toBe('Value 2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle confirm without callbacks', () => {
      const { result } = renderHook(() => useModal());

      expect(() => {
        result.current.showConfirm({
          title: 'Test',
          message: 'Test',
        });
      }).not.toThrow();
    });

    it('should handle prompt without callbacks', () => {
      const { result } = renderHook(() => useModal());

      expect(() => {
        result.current.showPrompt({
          title: 'Test',
          message: 'Test',
        });
      }).not.toThrow();
    });
  });
});
