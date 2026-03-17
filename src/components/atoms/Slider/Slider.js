/**
 * Slider Atom Component
 * 
 * Reusable range slider component for numeric input.
 * Commonly used for opacity, volume, and other continuous values.
 * 
 * @component
 * @param {Object} props
 * @param {number} props.value - Current slider value
 * @param {Function} props.onChange - Change handler (receives new value)
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step increment
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.title] - Tooltip title
 * @param {boolean} [props.disabled=false] - Disabled state
 * 
 * @example
 * <Slider 
 *   value={opacity * 100} 
 *   onChange={(val) => setOpacity(val / 100)}
 *   min={0}
 *   max={100}
 *   title="Opacity"
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Slider.css';

const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  title,
  disabled = false,
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(parseFloat(e.target.value));
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`slider-container ${className}`}>
      <input
        type="range"
        className="slider"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        title={title}
        disabled={disabled}
        style={{
          background: `linear-gradient(to right, #4AE661 0%, #4AE661 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
        }}
        {...props}
      />
    </div>
  );
};

Slider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  className: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Slider;
