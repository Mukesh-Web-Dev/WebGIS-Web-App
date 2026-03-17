/**
 * TourButton Component
 * 
 * Floating button that triggers the tour.
 * Positioned at left-center of the screen.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './TourButton.css';

const TourButton = ({ onClick, isActive }) => {
    // Don't show button when tour is active
    if (isActive) return null;

    return (
        <button
            className="tour-button"
            onClick={onClick}
            title="Start Tour - Learn how to use this application"
            aria-label="Start application tour"
        >
            <span className="tour-button__text">Tour</span>
        </button>
    );
};

TourButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool
};

TourButton.defaultProps = {
    isActive: false
};

export default TourButton;
