/**
 * Icon Atom Component
 * 
 * Reusable icon component using Unicode symbols and emojis.
 * Provides commonly used icons for the application.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.name - Icon name
 * @param {number} [props.size=16] - Icon size in pixels
 * @param {string} [props.color] - Icon color (CSS color value)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.title] - Tooltip title
 * @param {Function} [props.onClick] - Click handler
 * 
 * @example
 * <Icon name="eye" size={20} />
 * <Icon name="trash" color="#FF4757" />
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Icon.css';

const ICONS = {
  // Visibility
  'eye': <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="24px" fill="#aaa"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>,
  'eye-off': <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M450-81q-78-6-145.5-39T187-206.5q-50-53.5-78.5-124T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v19q-17-11-39.5-21.5T799-500q-8-126-99.5-213T480-800q-56 0-105.5 18T284-732l245 245q-19 8-36.5 18.5T458-446L228-676q-32 41-50 90.5T160-480q0 99 53.5 177.5T352-187q18 28 45 57t53 49Zm230-79q59 0 109.5-27t80.5-73q-30-46-80.5-73T680-360q-59 0-109.5 27T490-260q30 46 80.5 73T680-160Zm0 80q-96 0-171.5-50.5T400-260q33-79 108.5-129.5T680-440q96 0 171.5 50.5T960-260q-33 79-108.5 129.5T680-80Zm0-120q-25 0-42.5-17.5T620-260q0-25 17.5-42.5T680-320q25 0 42.5 17.5T740-260q0 25-17.5 42.5T680-200Z"/></svg>,
  
  // Actions
  'trash': '🗑️',
  'edit': '✏️',
  'check': '✓',
  'close': '✕',
  'add': '+',
  'remove': '−',
  
  // Map controls
  'zoom-in': '🔍+',
  'zoom-out': '🔍−',
  'palette': '🎨',
  'layers': '📊',
  'upload': '📤',
  'download': '📥',
  
  // Navigation
  'arrow-up': '↑',
  'arrow-down': '↓',
  'arrow-left': '←',
  'arrow-right': '→',
  
  // Status
  'info': 'ℹ️',
  'warning': '⚠️',
  'error': '❌',
  'success': '✓',
  'loading': '⏳',
  
  // Files
  'file': '📄',
  'folder': '📁',
};

const Icon = ({
  name,
  size = 16,
  color,
  className = '',
  title,
  onClick,
  ...props
}) => {
  const icon = ICONS[name] || '?';
  
  const style = {
    fontSize: `${size}px`,
    color: color
  };

  return (
    <span
      className={`icon ${className}`}
      style={style}
      title={title || name}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      {...props}
    >
      {icon}
    </span>
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default Icon;
