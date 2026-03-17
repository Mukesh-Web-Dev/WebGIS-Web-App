/**
 * MainLayout Template
 * 
 * Main application layout combining header and content area.
 * Provides consistent structure across the application.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * 
 * @example
 * <MainLayout>
 *   <MapPage />
 * </MainLayout>
 */

import React from 'react';
import PropTypes from 'prop-types';
import Header from '../Header/Header';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <>
    <div className="space-scene">
      <Header />
    </div>
      <main className="app-main">
        {children}
      </main>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
