/**
 * Test Utilities - Custom Render
 * 
 * Provides custom render function with common providers and utilities.
 * Simplifies testing of components that need context providers.
 */

import React from 'react';
import { render } from '@testing-library/react';
import PropTypes from 'prop-types';

/**
 * Custom render function with optional providers
 * @param {ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result with utilities
 */
export function renderWithProviders(ui, options = {}) {
  const {
    // Add custom provider options here as needed
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return <>{children}</>;
  }

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render with our custom version
export { renderWithProviders as render };
