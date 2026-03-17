/**
 * Button Atom Component
 * 
 * Reusable button component with consistent styling and variants.
 * Supports different sizes, variants, and states.
 * 
 * @component
 * @param {Object} props
 * @param {Function} [props.onClick] - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant='primary'] - Button style variant
 * @param {string} [props.size='medium'] - Button size
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.type='button'] - Button type attribute
 * @param {string} [props.title] - Tooltip title
 * 
 * @example
 * <Button variant="danger" onClick={handleDelete}>
 *   Delete
 * </Button>
 * 
 * @example
 * <Button variant="primary" size="large">
 *   Submit
 * </Button>
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  className = '',
  type = 'button',
  title,
  ...props 
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled && 'btn-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      className={classNames}
      disabled={disabled}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'warning', 'success', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  title: PropTypes.string,
};

export default Button;
