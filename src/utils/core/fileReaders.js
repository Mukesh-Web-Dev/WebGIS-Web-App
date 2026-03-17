/**
 * File Reader Utilities
 * 
 * Utilities for reading files in different formats.
 * Provides promise-based wrappers around FileReader API.
 */

/**
 * Reads a file as text
 * 
 * @param {FileReader} reader - FileReader instance
 * @param {File} file - File to read
 * @returns {Promise<string>} File content as text
 * 
 * @example
 * const reader = new FileReader();
 * const content = await readAsText(reader, file);
 */
export const readAsText = (reader, file) =>
  new Promise((resolve, reject) => {
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });

/**
 * Reads a file as ArrayBuffer
 * 
 * @param {FileReader} reader - FileReader instance
 * @param {File} file - File to read
 * @returns {Promise<ArrayBuffer>} File content as ArrayBuffer
 * 
 * @example
 * const reader = new FileReader();
 * const buffer = await readAsArrayBuffer(reader, file);
 */
export const readAsArrayBuffer = (reader, file) =>
  new Promise((resolve, reject) => {
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });

/**
 * Sets up progress tracking for a FileReader
 * 
 * @param {FileReader} reader - FileReader instance
 * @param {Function} onProgress - Callback function(progressPercentage)
 * 
 * @example
 * setupProgressTracking(reader, (pct) => console.log(`${pct}% complete`));
 */
export const setupProgressTracking = (reader, onProgress) => {
  reader.onprogress = (ev) => {
    if (ev.lengthComputable && onProgress) {
      const pct = Math.round((ev.loaded / ev.total) * 100);
      onProgress(pct);
    }
  };
};

/**
 * Sets up abort handling for a FileReader
 * 
 * @param {FileReader} reader - FileReader instance
 * @param {Function} onAbort - Callback function when read is aborted
 * 
 * @example
 * setupAbortHandling(reader, () => console.log('Read cancelled'));
 */
export const setupAbortHandling = (reader, onAbort) => {
  reader.onabort = () => {
    if (onAbort) {
      onAbort();
    }
  };
};
