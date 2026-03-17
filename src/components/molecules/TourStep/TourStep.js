/**
 * TourStep Component
 * 
 * Displays tour step content with navigation controls.
 * Positions itself relative to target element or centers on screen.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './TourStep.css';

const TourStep = ({
    step,
    stepNumber,
    totalSteps,
    onNext,
    onPrevious,
    onSkip,
    isFirstStep,
    isLastStep
}) => {
    const [position, setPosition] = useState({ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' });

    useEffect(() => {
        if (!step) return;

        // If no target or position is center, center the modal
        if (!step.target || step.position === 'center') {
            setPosition({
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        // Position relative to target element
        const targetElement = document.querySelector(step.target);

        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const tooltipWidth = 380; // Approximate tooltip width
            const tooltipHeight = 250; // Approximate tooltip height
            const offset = 20; // Distance from target

            let newPosition = {};

            switch (step.position) {
                case 'top:':
                    newPosition = {
                        top: `${rect.top - tooltipHeight - offset}px`,
                        left: `${rect.left + (rect.width / 2)}px`,
                        transform: 'translateX(-50%)'
                    };
                    break;

                case 'bottom:':
                    newPosition = {
                        top: `${rect.bottom + offset}px`,
                        left: `${rect.left + (rect.width / 2)}px`,
                        transform: 'translateX(-50%)'
                    };
                    break;

                case 'left:': // layer tour
                    newPosition = {
                        // top: `118px`,
                        // left: `440px`,
                        top: `${rect.top + (rect.height / 2)}px`,
                        left: `${rect.left - tooltipWidth - offset}px`,
                        transform: 'translateY(-50%)'
                    };
                    break;

                case 'right:':
                    newPosition = {
                        // top: `85px`,
                        // left: `960px`,
                        top: `${rect.top + (rect.height / 2)}px`,
                        left: `${rect.right + offset}px`,
                        transform: 'translateY(-50%)'
                    };
                    break;

                default:
                    newPosition = {
                        top: '40%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    };
            }

            setPosition(newPosition);
        } else {
            // Fallback to center if target not found
            setPosition({
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
        }
    }, [step]);

    if (!step) return null;

    const content = (
        <div
            className="tour-step"
            style={position}
        >
            <div className="tour-step__content">
                {/* Header */}
                <div className="tour-step__header">
                    <h3 className="tour-step__title">{step.title}</h3>
                    <div className="tour-step__counter">
                        Step {stepNumber} of {totalSteps}
                    </div>
                </div>

                {/* Body */}
                <div className="tour-step__body">
                    <p className="tour-step__description">{step.description}</p>
                </div>

                {/* Footer with navigation */}
                <div className="tour-step__footer">
                    <button
                        className="tour-step__btn tour-step__btn--skip"
                        onClick={onSkip}
                    >
                        Skip Tour
                    </button>

                    <div className="tour-step__nav">
                        {!isFirstStep && (
                            <button
                                className="tour-step__btn tour-step__btn--secondary"
                                onClick={onPrevious}
                            >
                                ← Previous
                            </button>
                        )}

                        <button
                            className="tour-step__btn tour-step__btn--primary"
                            onClick={onNext}
                        >
                            {isLastStep ? 'Finish ✓' : 'Next →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

TourStep.propTypes = {
    step: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        target: PropTypes.string,
        position: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'center'])
    }),
    stepNumber: PropTypes.number.isRequired,
    totalSteps: PropTypes.number.isRequired,
    onNext: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onSkip: PropTypes.func.isRequired,
    isFirstStep: PropTypes.bool,
    isLastStep: PropTypes.bool
};

export default TourStep;
