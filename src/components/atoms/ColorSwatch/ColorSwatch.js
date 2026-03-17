/**
 * ColorSwatch Atom Component
 * 
 * Individual color swatch for color selection.
 * Display a single color block that can be selected.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.color - Color value (hex code)
 * @param {boolean} [props.selected=false] - Whether this color is selected
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.className=''] - Additional CSS classes
 * 
 * @example
 * <ColorSwatch 
 *   color="#4AE661" 
 *   selected={true}
 *   onClick={() => handleColorSelect('#4AE661')}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import './ColorSwatch.css';

const ColorSwatch = ({ color, selected = false, onClick, className = '' }) => {
  return (
    <button
      className={`color-swatch ${selected ? 'color-swatch--selected' : ''} ${className}`}
      style={{ backgroundColor: color }}
      onClick={() => onClick(color)}
      title={color}
      aria-label={`Select color ${color}`}
      aria-pressed={selected}
    />
  );
};

ColorSwatch.propTypes = {
  color: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ColorSwatch;
