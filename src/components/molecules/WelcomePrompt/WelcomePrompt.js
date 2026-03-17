/**
 * WelcomePrompt Component
 * 
 * First-time user welcome dialog that offers to start the tour.
 * Shows once per browser using localStorage.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../atoms';
import './WelcomePrompt.css';

const WelcomePrompt = ({ onStartTour, onSkip }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <Modal isOpen={true} onClose={onSkip}>
            <div className="welcome-prompt">
                <div className="welcome-prompt__icon">🗺️</div>
                <h2 className="welcome-prompt__title">Welcome to SetOrigin WebGIS!</h2>
                <p className="welcome-prompt__description">
                    A powerful web-based GIS application for managing, analyzing, and visualizing geospatial data.
                </p>
                <div className="welcome-prompt__features">
                    <div className="welcome-prompt__feature">
                        <span className="feature-icon">📚</span>
                        <span>Manage multiple map layers</span>
                    </div>
                    <div className="welcome-prompt__feature">
                        <span className="feature-icon">✏️</span>
                        <span>Draw and edit features</span>
                    </div>
                    <div className="welcome-prompt__feature">
                        <span className="feature-icon">📤</span>
                        <span>Upload GeoJSON, KML, Shapefiles</span>
                    </div>
                    <div className="welcome-prompt__feature">
                        <span className="feature-icon">🌍</span>
                        <span>Multiple base map options</span>
                    </div>
                </div>
                <p className="welcome-prompt__question">
                    Would you like a quick tour to see all the features?
                </p>
                <div className="welcome-prompt__actions">
                    <button
                        className="welcome-prompt__btn welcome-prompt__btn--primary"
                        onClick={onStartTour}
                    >
                        🎓 Start Tour
                    </button>
                    <button
                        className="welcome-prompt__btn welcome-prompt__btn--secondary"
                        onClick={onSkip}
                    >
                        Skip for Now
                    </button>
                </div>
            </div>
        </Modal>
    );
};

WelcomePrompt.propTypes = {
    onStartTour: PropTypes.func.isRequired,
    onSkip: PropTypes.func.isRequired
};

export default WelcomePrompt;
