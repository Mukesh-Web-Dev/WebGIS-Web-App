/**
 * BaseLayerSwitcher Component
 * 
 * Allows users to switch between different base map layers.
 * Positioned in bottom right corner with expandable panel.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './BaseLayerSwitcher.css';

const BaseLayerSwitcher = ({ currentBaseLayer, onChangeBaseLayer }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const baseLayerTypes = [
        {
            id: 'osm-street',
            name: 'Street',
            icon: '🗺️',
            description: 'OpenStreetMap'
        },
        {
            id: 'satellite',
            name: 'Satellite',
            icon: '🛰️',
            description: 'Esri World Imagery'
        },
        {
            id: 'topo',
            name: 'Topographic',
            icon: '🏔️',
            description: 'OpenTopoMap'
        },
        {
            id: 'dark',
            name: 'Dark',
            icon: '🌙',
            description: 'Dark Map Theme'
        },
    ];

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSelectLayer = (layerId) => {
        onChangeBaseLayer(layerId);
        setIsExpanded(false);
    };

    const currentLayer = baseLayerTypes.find(layer => layer.id === currentBaseLayer) || baseLayerTypes[0];

    return (
        <div className="base-layer-switcher">
            {/* Toggle Button */}
            <button
                className="base-layer-toggle"
                onClick={handleToggle}
                title={`Base Map: ${currentLayer.name}`}
                aria-label="Change base map"
            >
                <span className="base-layer-icon">{currentLayer.icon}</span>
            </button>

            {/* Layer Selection Panel */}
            {isExpanded && (
                <div className="base-layer-panel">
                    <div className="base-layer-header">
                        <span className="base-layer-title">Base Map</span>
                        <button
                            className="base-layer-close"
                            onClick={() => setIsExpanded(false)}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="base-layer-options">
                        {baseLayerTypes.map((layer) => (
                            <button
                                key={layer.id}
                                className={`base-layer-option ${currentBaseLayer === layer.id ? 'active' : ''}`}
                                onClick={() => handleSelectLayer(layer.id)}
                            >
                                <span className="base-layer-option-icon">{layer.icon}</span>
                                <div className="base-layer-option-text">
                                    <span className="base-layer-option-name">{layer.name}</span>
                                    <span className="base-layer-option-desc">{layer.description}</span>
                                </div>
                                {currentBaseLayer === layer.id && (
                                    <span className="base-layer-checkmark">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

BaseLayerSwitcher.propTypes = {
    currentBaseLayer: PropTypes.string.isRequired,
    onChangeBaseLayer: PropTypes.func.isRequired,
};

export default BaseLayerSwitcher;
