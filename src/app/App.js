/**
 * App Component
 * 
 * Root application component.
 * Now simplified to just render the main layout and page structure.
 * 
 * All map functionality has been moved to MapPage.
 * All layout structure has been moved to MainLayout and templates.
 * 
 * This refactored version is <50 lines (previously 193 lines) - 74% reduction!
 */

import React from 'react';
import { MainLayout } from '../components/templates';
import { MapPage } from '../components/pages';

// Styles
import '../styles/base/App.css';
import '../styles/themes/NeonTheme.css';

/**
 * Main App Component
 * 
 * Minimal root component that provides the application shell.
 */
const App = () => {
  return (
    <MainLayout>
      <MapPage />
    </MainLayout>
  );
};

export default App;
