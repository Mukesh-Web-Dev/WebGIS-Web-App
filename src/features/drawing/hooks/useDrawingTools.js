/**
 * useDrawingTools Hook
 * 
 * Manages drawing interactions, feature history, and lifecycle.
 * Integrates with OpenLayers Draw, Modify, and Select interactions.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Draw, Modify, Select, Snap } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import {
    generateFeatureName,
    createDrawingStyle,
    getFeatureExtent,
    validateFeatureAdd
} from '../utils/featureUtils';
import {
    saveDrawingsToIndexedDB,
    loadDrawingsFromIndexedDB
} from '../services/drawingPersistence';

/**
 * Custom hook for drawing tools management
 * 
 * @param {Object} mapInstance - OpenLayers Map instance (ref.current)
 * @param {string} activeLayerId - Currently active layer ID
 * @param {import('ol/source/Vector').default} vectorSource - Vector source for drawings
 * @param {Function} addToast - Toast notification function
 * @returns {Object} Drawing tools API
 */
const useDrawingTools = (mapInstance, activeLayerId, vectorSource, addToast) => {
    // State
    const [activeTool, setActiveTool] = useState(null);
    const [drawnFeatures, setDrawnFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);

    // Refs for interactions
    const drawInteraction = useRef(null);
    const modifyInteraction = useRef(null);
    const selectInteraction = useRef(null);
    const snapInteraction = useRef(null);

    // History stacks
    const undoStack = useRef([]);
    const redoStack = useRef([]);

    // Feature naming counters
    const featureCounts = useRef({
        Point: 0,
        LineString: 0,
        Polygon: 0,
        Circle: 0
    });

    /**
     * Load saved drawings for active layer
     */
    useEffect(() => {
        if (!activeLayerId || !vectorSource) return;

        const loadDrawings = async () => {
            try {
                const features = await loadDrawingsFromIndexedDB(activeLayerId);

                if (features.length > 0) {
                    // Clear existing features
                    vectorSource.clear();

                    // Add loaded features
                    features.forEach(feature => {
                        // Restore feature properties
                        const name = feature.get('name') || '';
                        const color = feature.get('color') || '#4AE661';
                        const visible = feature.get('visible') !== false;
                        const opacity = feature.get('opacity') || 1;
                        const type = feature.getGeometry().getType();

                        // Apply style
                        if (visible) {
                            const style = createDrawingStyle(color, type, { fillOpacity: opacity * 0.2 });
                            feature.setStyle(style);
                        } else {
                            // Create invisible style for hidden features
                            const invisibleStyle = new Style({
                                stroke: new Stroke({
                                    color: 'rgba(0, 0, 0, 0)',
                                    width: 0
                                }),
                                fill: new Fill({
                                    color: 'rgba(0, 0, 0, 0)'
                                }),
                                image: new CircleStyle({
                                    radius: 0,
                                    fill: new Fill({ color: 'rgba(0, 0, 0, 0)' })
                                })
                            });
                            feature.setStyle(invisibleStyle);
                        }

                        vectorSource.addFeature(feature);

                        // Update counter
                        const normalizedType = type === 'LineString' ? 'LineString' : type;
                        if (featureCounts.current[normalizedType] !== undefined) {
                            // Extract counter from name
                            const match = name.match(/_(\d+)$/);
                            if (match) {
                                const count = parseInt(match[1], 10);
                                if (count > featureCounts.current[normalizedType]) {
                                    featureCounts.current[normalizedType] = count;
                                }
                            }
                        }
                    });

                    // Update feature list
                    setDrawnFeatures(features.map(f => ({
                        feature: f,
                        name: f.get('name'),
                        color: f.get('color') || '#4AE661',
                        visible: f.get('visible') !== false,
                        opacity: f.get('opacity') || 1
                    })));

                    if (addToast) {
                        addToast(`Loaded ${features.length} drawing(s)`, 3000, 'info');
                    }
                }
            } catch (error) {
                console.error('Error loading drawings:', error);
                if (addToast) {
                    addToast('Failed to load saved drawings', 5000, 'error');
                }
            }
        };

        loadDrawings();
    }, [activeLayerId, vectorSource, addToast]);

    /**
     * Save drawings to IndexedDB (debounced)
     */
    const saveTimer = useRef(null);
    const saveDrawings = useCallback(() => {
        if (!activeLayerId || !vectorSource) return;

        // Debounce saves
        if (saveTimer.current) clearTimeout(saveTimer.current);

        saveTimer.current = setTimeout(async () => {
            try {
                const features = vectorSource.getFeatures();
                await saveDrawingsToIndexedDB(activeLayerId, features);
            } catch (error) {
                console.error('Error saving drawings:', error);
            }
        }, 500);
    }, [activeLayerId, vectorSource]);

    /**
     * Manage OpenLayers interactions based on active tool
     */
    useEffect(() => {
        if (!mapInstance) return;

        // Cleanup function
        const removeInteractions = () => {
            if (drawInteraction.current) {
                mapInstance.removeInteraction(drawInteraction.current);
                drawInteraction.current = null;
            }
            if (modifyInteraction.current) {
                mapInstance.removeInteraction(modifyInteraction.current);
                modifyInteraction.current = null;
            }
            if (selectInteraction.current) {
                mapInstance.removeInteraction(selectInteraction.current);
                selectInteraction.current = null;
            }
        };

        removeInteractions();

        if (activeTool && activeTool !== 'Edit') {
            // DRAW MODE
            setSelectedFeature(null);

            drawInteraction.current = new Draw({
                source: vectorSource,
                type: activeTool,
            });

            drawInteraction.current.on('drawend', (event) => {
                const feature = event.feature;
                const type = activeTool;

                // Validate feature limit
                const validation = validateFeatureAdd(vectorSource.getFeatures());
                if (!validation.valid) {
                    if (addToast) addToast(validation.error, 5000, 'warning');
                    vectorSource.removeFeature(feature);
                    return;
                }

                // Generate name
                featureCounts.current[type]++;
                const name = generateFeatureName(type, featureCounts.current[type]);

                // Set properties
                const color = '#4AE661'; // Default color
                const opacity = 1; // Default opacity
                feature.set('name', name);
                feature.set('type', type);
                feature.set('color', color);
                feature.set('visible', true);
                feature.set('opacity', opacity);

                // Apply style
                const style = createDrawingStyle(color, type, { fillOpacity: opacity * 0.2 });
                feature.setStyle(style);

                // Add to history
                const featureData = {
                    feature,
                    name,
                    color,
                    visible: true,
                    opacity
                };

                redoStack.current = [];
                undoStack.current.push(featureData);
                setDrawnFeatures(prev => [...prev, featureData]);

                // Save
                saveDrawings();
            });

            mapInstance.addInteraction(drawInteraction.current);

        } else if (activeTool === 'Edit') {
            // EDIT/SELECT MODE

            selectInteraction.current = new Select({
                condition: click,
                style: new Style({
                    fill: new Fill({ color: 'rgba(255, 255, 255, 0.5)' }),
                    stroke: new Stroke({ color: '#007bff', width: 3 }),
                    image: new CircleStyle({
                        radius: 8,
                        fill: new Fill({ color: '#007bff' }),
                    }),
                })
            });

            selectInteraction.current.on('select', (e) => {
                const selected = e.selected.length > 0 ? e.selected[0] : null;
                setSelectedFeature(selected);
            });

            mapInstance.addInteraction(selectInteraction.current);

            // Modify interaction
            modifyInteraction.current = new Modify({
                features: selectInteraction.current.getFeatures(),
            });

            modifyInteraction.current.on('modifyend', () => {
                saveDrawings();
            });

            mapInstance.addInteraction(modifyInteraction.current);
        }

        // Add snap interaction for precision
        if (!snapInteraction.current && vectorSource) {
            snapInteraction.current = new Snap({ source: vectorSource });
            mapInstance.addInteraction(snapInteraction.current);
        }

        return () => {
            removeInteractions();
            if (snapInteraction.current) {
                mapInstance.removeInteraction(snapInteraction.current);
                snapInteraction.current = null;
            }
        };
    }, [activeTool, mapInstance, vectorSource, addToast, saveDrawings]);

    /**
     * Undo last drawing
     */
    const handleUndo = useCallback(() => {
        if (undoStack.current.length === 0) return;

        const lastItem = undoStack.current.pop();

        if (vectorSource.getFeatureByUid(lastItem.feature.ol_uid)) {
            vectorSource.removeFeature(lastItem.feature);
            redoStack.current.push(lastItem);
            setDrawnFeatures(prev => prev.filter(item => item.feature !== lastItem.feature));
            saveDrawings();
        }
    }, [vectorSource, saveDrawings]);

    /**
     * Redo last undone drawing  
     */
    const handleRedo = useCallback(() => {
        if (redoStack.current.length === 0) return;

        const restoreItem = redoStack.current.pop();
        vectorSource.addFeature(restoreItem.feature);
        undoStack.current.push(restoreItem);
        setDrawnFeatures(prev => [...prev, restoreItem]);
        saveDrawings();
    }, [vectorSource, saveDrawings]);

    /**
     * Delete a feature
     */
    const handleDeleteFeature = useCallback((feature) => {
        vectorSource.removeFeature(feature);

        // Update stacks
        undoStack.current = undoStack.current.filter(item => item.feature !== feature);
        redoStack.current = redoStack.current.filter(item => item.feature !== feature);

        // Update list
        setDrawnFeatures(prev => prev.filter(item => item.feature !== feature));

        // Clear selection if this was selected
        if (selectedFeature === feature) {
            setSelectedFeature(null);
        }

        saveDrawings();
    }, [vectorSource, selectedFeature, saveDrawings]);

    /**
     * Toggle feature visibility
     */
    const handleToggleVisibility = useCallback((feature) => {
        const currentVisible = feature.get('visible') !== false;
        const newVisible = !currentVisible;

        feature.set('visible', newVisible);

        if (newVisible) {
            const color = feature.get('color') || '#4AE661';
            const opacity = feature.get('opacity') || 1;
            const type = feature.getGeometry().getType();
            const style = createDrawingStyle(color, type, { fillOpacity: opacity * 0.2 });
            feature.setStyle(style);
        } else {
            // Create completely invisible style (transparent stroke and fill)
            const invisibleStyle = new Style({
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0)',
                    width: 0
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 0, 0)'
                }),
                image: new CircleStyle({
                    radius: 0,
                    fill: new Fill({ color: 'rgba(0, 0, 0, 0)' })
                })
            });
            feature.setStyle(invisibleStyle);
        }

        setDrawnFeatures(prev => prev.map(item =>
            item.feature === feature ? { ...item, visible: newVisible } : item
        ));

        saveDrawings();
    }, [saveDrawings]);

    /**
     * Change feature color
     */
    const handleChangeColor = useCallback((feature, newColor) => {
        feature.set('color', newColor);

        const visible = feature.get('visible') !== false;
        if (visible) {
            const type = feature.getGeometry().getType();
            const style = createDrawingStyle(newColor, type);
            feature.setStyle(style);
        }

        setDrawnFeatures(prev => prev.map(item =>
            item.feature === feature ? { ...item, color: newColor } : item
        ));

        saveDrawings();
    }, [saveDrawings]);

    /**
     * Zoom to feature
     */
    const handleZoomToFeature = useCallback((feature) => {
        if (!mapInstance) return;

        const extent = getFeatureExtent(feature);
        if (extent) {
            mapInstance.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                duration: 1000,
                maxZoom: 16
            });
        }
    }, [mapInstance]);

    /**
     * Change feature opacity
     */
    const handleChangeOpacity = useCallback((feature, newOpacity) => {
        feature.set('opacity', newOpacity);

        const visible = feature.get('visible') !== false;
        if (visible) {
            const color = feature.get('color') || '#4AE661';
            const type = feature.getGeometry().getType();
            const style = createDrawingStyle(color, type, { fillOpacity: newOpacity * 0.2 });
            feature.setStyle(style);
        }

        setDrawnFeatures(prev => prev.map(item =>
            item.feature === feature ? { ...item, opacity: newOpacity } : item
        ));

        saveDrawings();
    }, [saveDrawings]);

    return {
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
        canUndo: undoStack.current.length > 0,
        canRedo: redoStack.current.length > 0,
    };
};

export default useDrawingTools;
