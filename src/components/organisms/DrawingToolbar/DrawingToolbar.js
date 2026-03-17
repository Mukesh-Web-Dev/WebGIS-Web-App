/**
 * DrawingToolbar Organism
 * 
 * Main drawing toolbar component positioned at bottom-center.
 * Provides drawing tools, feature management, and collapsible UI.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DrawnFeatureItem } from '../../molecules';
import { useDrawingTools } from '../../../features/drawing/hooks';
import './DrawingToolbar.css';

const DrawingToolbar = ({
    mapInstance,
    vectorSource,
    activeLayerId,
    addToast
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFeatureListVisible, setIsFeatureListVisible] = useState(true);

    // Drawing tools hook
    const {
        activeTool,
        setActiveTool,
        drawnFeatures,
        selectedFeature,
        handleUndo,
        handleRedo,
        handleDeleteFeature,
        handleToggleVisibility,
        handleChangeColor,
        handleChangeOpacity,
        handleZoomToFeature,
        canUndo,
        canRedo,
    } = useDrawingTools(mapInstance, activeLayerId, vectorSource, addToast);

    // Don't show toolbar if no active layer
    if (!activeLayerId) {
        return null;
    }

    const handleToolSelect = (tool) => {
        setActiveTool(activeTool === tool ? null : tool);
    };

    const handleSave = () => {
        if (addToast) {
            addToast(`Saved ${drawnFeatures.length} drawing(s)`, 3000, 'success');
        }
    };

    return (
        <div className={`drawing-toolbar ${isMinimized ? 'drawing-toolbar--minimized' : ''}`}>
            {/* Header */}
            <div className="drawing-toolbar__header">
                <span className="drawing-toolbar__title">
                    ✏️ Drawing Tools
                </span>
                <div className="drawing-toolbar__header-actions">
                    {/* Toggle Features List Button */}
                    <button
                        className={`drawing-toolbar__btn drawing-toolbar__btn--icon ${!isFeatureListVisible ? 'active' : ''}`}
                        onClick={() => setIsFeatureListVisible(!isFeatureListVisible)}
                        title={isFeatureListVisible ? "Hide Features List" : "Show Features List"}
                        aria-label={isFeatureListVisible ? "Hide Features List" : "Show Features List"}
                    >
                        📋 {isFeatureListVisible ? '' : `(${drawnFeatures.length})`}
                    </button>

                    {/* Minimize Button */}
                    <button
                        className="drawing-toolbar__btn drawing-toolbar__btn--minimize"
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? "Maximize" : "Minimize"}
                        aria-label={isMinimized ? "Maximize toolbar" : "Minimize toolbar"}
                    >
                    {isMinimized ? '▲' : '▼'}
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Tool Selection */}
                    <div className="drawing-toolbar__tools">
                        <button
                            className={`drawing-toolbar__tool-btn ${activeTool === 'Edit' ? 'active' : ''}`}
                            onClick={() => handleToolSelect('Edit')}
                            title="Edit Mode - Select and modify features"
                            aria-label="Edit mode"
                        >
                            🖱️ Edit
                        </button>
                        <button
                            className={`drawing-toolbar__tool-btn ${activeTool === 'Point' ? 'active' : ''}`}
                            onClick={() => handleToolSelect('Point')}
                            title="Draw Point"
                            aria-label="Draw point"
                        >
                            📍 Point
                        </button>
                        <button
                            className={`drawing-toolbar__tool-btn ${activeTool === 'LineString' ? 'active' : ''}`}
                            onClick={() => handleToolSelect('LineString')}
                            title="Draw Line"
                            aria-label="Draw line"
                        >
                            📏 Line
                        </button>
                        <button
                            className={`drawing-toolbar__tool-btn ${activeTool === 'Polygon' ? 'active' : ''}`}
                            onClick={() => handleToolSelect('Polygon')}
                            title="Draw Polygon"
                            aria-label="Draw polygon"
                        >
                            ⬡ Polygon
                        </button>
                        <button
                            className={`drawing-toolbar__tool-btn ${activeTool === 'Circle' ? 'active' : ''}`}
                            onClick={() => handleToolSelect('Circle')}
                            title="Draw Circle"
                            aria-label="Draw circle"
                        >
                            ⭕ Circle
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="drawing-toolbar__actions">
                        <button
                            className="drawing-toolbar__action-btn"
                            onClick={handleUndo}
                            disabled={!canUndo}
                            title="Undo last drawing"
                            aria-label="Undo"
                        >
                            ↶ Undo
                        </button>
                        <button
                            className="drawing-toolbar__action-btn"
                            onClick={handleRedo}
                            disabled={!canRedo}
                            title="Redo last undone drawing"
                            aria-label="Redo"
                        >
                            ↷ Redo
                        </button>
                        <button
                            className="drawing-toolbar__action-btn drawing-toolbar__action-btn--save"
                            onClick={handleSave}
                            title="Save all drawings"
                            aria-label="Save"
                        >
                            💾 Save
                        </button>
                    </div>

                    {/* Delete Selected (Edit Mode) */}
                    {activeTool === 'Edit' && selectedFeature && (
                        <div className="drawing-toolbar__delete-section">
                            <button
                                className="drawing-toolbar__delete-btn"
                                onClick={() => handleDeleteFeature(selectedFeature)}
                                title="Delete selected feature"
                                aria-label="Delete selected feature"
                            >
                                🗑️ Delete Selected
                            </button>
                        </div>
                    )}

                    {/* Feature List */}
                    {/* Feature List Section (Toggleable) */}
                    {isFeatureListVisible && (
                        <div className="drawing-toolbar__section">
                            <div className="drawing-toolbar__section-title">
                                Drawn Features ({drawnFeatures.length})
                            </div>
                            <div className="drawing-toolbar__feature-list">
                                {drawnFeatures.length === 0 ? (
                                    <div className="drawing-toolbar__empty-state">
                                        No features drawn yet. Select a tool to start drawing.
                                    </div>
                                ) : (
                                    drawnFeatures.map((item) => (
                                        <DrawnFeatureItem
                                            key={item.feature.ol_uid}
                                            feature={item.feature}
                                            name={item.name}
                                            isVisible={item.visible}
                                            color={item.color}
                                            opacity={item.opacity || 1}
                                            onDelete={handleDeleteFeature}
                                            onToggleVisibility={handleToggleVisibility}
                                            onColorChange={handleChangeColor}
                                            onOpacityChange={handleChangeOpacity}
                                            onZoomTo={handleZoomToFeature}
                                            isActive={selectedFeature === item.feature}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

DrawingToolbar.propTypes = {
    mapInstance: PropTypes.object,
    vectorSource: PropTypes.object.isRequired,
    activeLayerId: PropTypes.string,
    addToast: PropTypes.func,
};

export default DrawingToolbar;
