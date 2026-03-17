/**
 * Test Utilities - Test Helpers
 * 
 * Common helper functions and utilities for testing.
 */

/**
 * Waits for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits for an element to be removed from the DOM
 * @param {Function} queryFn - Function that queries for the element
 * @param {Object} options - Wait options
 * @returns {Promise} Promise that resolves when element is removed
 */
export const waitForElementToBeRemoved = async (queryFn, options = {}) => {
  const { timeout = 1000 } = options;
  const startTime = Date.now();

  while (queryFn()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for element to be removed');
    }
    await wait(50);
  }
};

/**
 * Creates a spy function that tracks calls
 * @returns {Function} Spy function
 */
export const createSpy = () => {
  const calls = [];
  const spy = (...args) => {
    calls.push(args);
  };
  spy.calls = calls;
  spy.callCount = () => calls.length;
  spy.calledWith = (...args) => calls.some((call) => 
    call.length === args.length && call.every((arg, i) => arg === args[i])
  );
  return spy;
};

/**
 * Flushes all pending promises
 * @returns {Promise} Promise that resolves after microtask queue is empty
 */
export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));
