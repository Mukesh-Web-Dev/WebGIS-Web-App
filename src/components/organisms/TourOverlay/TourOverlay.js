/**
 * TourOverlay Component
 * 
 * Creates a dark backdrop with spotlight effect to highlight tour targets.
 * Uses portal to render at body level for proper z-index stacking.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './TourOverlay.css';

const TourOverlay = ({ currentStep }) => {
    const [spotlight, setSpotlight] = useState(null);

    useEffect(() => {
        if (!currentStep || !currentStep.target) {
            setSpotlight(null);
            return;
        }

        // Find the target element
        const targetElement = document.querySelector(currentStep.target);

        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const padding = currentStep.highlightPadding || 10;

            setSpotlight({
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + (padding * 2),
                height: rect.height + (padding * 2),
                borderRadius: window.getComputedStyle(targetElement).borderRadius || '8px'
            });
        } else {
            setSpotlight(null);
        }
    }, [currentStep]);

    // Render nothing if no current step
    if (!currentStep) return null;

    const overlayContent = (
        <div className="tour-overlay">
            {/* Main backdrop */}
            <div className="tour-overlay__backdrop" />

            {/* Spotlight cutout */}
            {spotlight && (
                <div
                    className="tour-overlay__spotlight"
                    style={{
                        top: `${spotlight.top}px`,
                        left: `${spotlight.left}px`,
                        width: `${spotlight.width}px`,
                        height: `${spotlight.height}px`,
                        borderRadius: spotlight.borderRadius
                    }}
                />
            )}
        </div>
    );

    // Render at body level using portal
    return createPortal(overlayContent, document.body);
};

TourOverlay.propTypes = {
    currentStep: PropTypes.shape({
        target: PropTypes.string,
        highlightPadding: PropTypes.number
    })
};

export default TourOverlay;
