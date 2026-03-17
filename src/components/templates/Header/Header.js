/**
 * Header Template
 * 
 * Main application header with branding.
 * Extracted from NeonHeader for better organization.
 * 
 * @component
 * @example
 * <Header />
 */

import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-wrap">
          <div className="orb" />
          <div className="title-wrap">
            <h1 className="app-title">SetOrigin</h1>
            <div className="app-sub">WebGIS App</div>
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="satellite" aria-hidden="true">
          <div className="sat-body" />
          <div className="sat-panel" />
        </div>
      </div>
    </header>
  );
};

export default Header;
