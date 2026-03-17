/**
 * useToast Hook Tests
 * 
 * Tests for the enhanced useToast hook including:
 * - addToast functionality  
 * - addUploadToast functionality
 * - updateUploadToast with progress
 * - removeToast
 * - Auto-dismiss behavior
 */

import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useToast from './useToast';

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it('should provide addToast function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.addToast).toBe('function');
    });

    it('should provide addUploadToast function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.addUploadToast).toBe('function');
    });

    it('should provide updateUploadToast function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.updateUploadToast).toBe('function');
    });

    it('should provide removeToast function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.removeToast).toBe('function');
    });
  });

  describe('addToast', () => {
    it('should add a simple toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test message');
      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].ttl).toBe(5000);
    });

    it('should add toast with custom TTL', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message', 3000);
      });

      expect(result.current.toasts[0].ttl).toBe(3000);
    });

    it('should add toast with custom type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message', 5000, 'success');
      });

      expect(result.current.toasts[0].type).toBe('success');
    });

    it('should generate unique IDs for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Message 1');
        result.current.addToast('Message 2');
      });

      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
    });

    it('should return toast ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId;
      act(() => {
        toastId = result.current.addToast('Test');
      });

      expect(typeof toastId).toBe('string');
      expect(result.current.toasts[0].id).toBe(toastId);
    });
  });

  describe('addUploadToast', () => {
    it('should add an upload toast with default values', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addUploadToast('file.geojson');
      });

      const toast = result.current.toasts[0];
      expect(toast.fileName).toBe('file.geojson');
      expect(toast.type).toBe('upload');
      expect(toast.uploadStatus).toBe('queued');
      expect(toast.progress).toBe(0);
      expect(toast.ttl).toBe(null);
    });

    it('should accept custom upload ID', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addUploadToast('file.geojson', 'custom-id');
      });

      expect(result.current.toasts[0].id).toBe('custom-id');
    });

    it('should return upload toast ID', () => {
      const { result } = renderHook(() => useToast());

      let uploadId;
      act(() => {
        uploadId = result.current.addUploadToast('file.geojson');
      });

      expect(typeof uploadId).toBe('string');
      expect(result.current.toasts[0].id).toBe(uploadId);
    });
  });

  describe('updateUploadToast', () => {
    it('should update upload progress', () => {
      const { result } = renderHook(() => useToast());

      let uploadId;
      act(() => {
        uploadId = result.current.addUploadToast('file.geojson');
      });

      act(() => {
        result.current.updateUploadToast(uploadId, { progress: 50 });
      });

      expect(result.current.toasts[0].progress).toBe(50);
    });

    it('should update upload status', () => {
      const { result } = renderHook(() => useToast());

      let uploadId;
      act(() => {
        uploadId = result.current.addUploadToast('file.geojson');
      });

      act(() => {
        result.current.updateUploadToast(uploadId, { uploadStatus: 'reading' });
      });

      expect(result.current.toasts[0].uploadStatus).toBe('reading');
    });

    it('should set TTL when upload is done', () => {
      const { result } = renderHook(() => useToast());

      let uploadId;
      act(() => {
        uploadId = result.current.addUploadToast('file.geojson');
      });

      act(() => {
        result.current.updateUploadToast(uploadId, { uploadStatus: 'done' });
      });

      expect(result.current.toasts[0].ttl).toBe(5000);
    });

    it('should set TTL when upload has error', () => {
      const { result } = renderHook(() => useToast());

      let uploadId;
      act(() => {
        uploadId = result.current.addUploadToast('file.geojson');
      });

      act(() => {
        result.current.updateUploadToast(uploadId, { uploadStatus: 'error' });
      });

      expect(result.current.toasts[0].ttl).toBe(5000);
    });

    it('should set TTL when upload is canceled', () => {
      const { result } = renderHook(() => useToast());

      let uploadId;
      act(() => {
        uploadId = result.current.addUploadToast('file.geojson');
      });

      act(() => {
        result.current.updateUploadToast(uploadId, { uploadStatus: 'canceled' });
      });

      expect(result.current.toasts[0].ttl).toBe(5000);
    });
  });

  describe('removeToast', () => {
    it('should remove toast by ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId;
      act(() => {
        toastId = result.current.addToast('Test');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should only remove specified toast', () => {
      const { result } = renderHook(() => useToast());

      let toastId1, toastId2;
      act(() => {
        toastId1 = result.current.addToast('Toast 1');
        toastId2 = result.current.addToast('Toast 2');
      });

      act(() => {
        result.current.removeToast(toastId1);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].id).toBe(toastId2);
    });

    it('should handle removing non-existent toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test');
      });

      expect(() => {
        act(() => {
          result.current.removeToast('non-existent-id');
        });
      }).not.toThrow();

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('Multiple Toasts', () => {
    it('should handle multiple toasts simultaneously', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Message 1');
        result.current.addToast('Message 2');
        result.current.addUploadToast('file.geojson');
      });

      expect(result.current.toasts).toHaveLength(3);
    });

    it('should maintain upload and regular toasts separately', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Regular toast');
        result.current.addUploadToast('upload.geojson');
      });

      const regularToast = result.current.toasts.find(t => t.type === 'info');
      const uploadToast = result.current.toasts.find(t => t.type === 'upload');

      expect(regularToast).toBeDefined();
      expect(uploadToast).toBeDefined();
      expect(uploadToast.fileName).toBe('upload.geojson');
    });
  });
});
