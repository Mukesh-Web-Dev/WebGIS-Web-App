/**
 * Tour Steps Configuration
 * 
 * Defines the step-by-step guided tour for first-time users.
 * Each step highlights a specific feature or UI element.
 */

export const tourSteps = [
    {
        id: 'welcome',
        title: 'Welcome to SetOrigin WebGIS! 🗺️',
        description: 'A powerful web-based GIS application for managing, analyzing, and visualizing geospatial data. Upload layers, draw features, and explore your maps with professional-grade tools.',
        target: null, // No specific target, centered modal
        position: 'center',
        highlightPadding: 0
    },
    {
        id: 'layer-panel',
        title: 'Layer Panel 📚',
        description: 'This is your layer management center. All uploaded and created layers appear here. You can control visibility, opacity, order, and styling for each layer.',
        target: '.panel-section.card',
        position: 'left',
        highlightPadding: 10
    },
    {
        id: 'add-layer',
        title: 'Add New Layers ➕',
        description: 'Click here to add new layers. You can upload GeoJSON, KML, KMZ, or Shapefiles, or create an empty layer for drawing features.',
        target: 'button[title="Add new layer"]',
        position: 'bottom',
        highlightPadding: 8
    },
    {
        id: 'export-layer',
        title: 'Export Layers 📤',
        description: 'Export your active layer with all drawing features to various formats: GeoJSON (with preserved styles), KML (for Google Earth), or PNG (raster image). Perfect for sharing your work or using it in other GIS applications!',
        target: 'button[title*="Export"]',
        position: 'bottom',
        highlightPadding: 8
    },
    {
        id: 'layer-controls',
        title: 'Layer Controls 🎛️',
        description: 'Each layer has controls to toggle visibility (eye icon), adjust opacity (slider), change color (color swatch), zoom to extent, rename, reorder, and delete.',
        target: '.layer-item',
        position: 'left',
        highlightPadding: 8
    },
    {
        id: 'drawing-tools-button',
        title: 'Drawing Tools Toggle 🖊️',
        description: 'When you select a layer, this button appears. Click it to show/hide the drawing toolbar where you can create points, lines, polygons, and circles.',
        target: 'button[title*="Drawing Tools"]',
        position: 'bottom',
        highlightPadding: 8
    },
    {
        id: 'drawing-toolbar',
        title: 'Drawing Toolbar ✏️',
        description: 'Use these tools to draw features on your selected layer. You can draw points, lines, polygons, and circles. Edit mode lets you modify existing features. Undo/redo functionality is included!',
        target: '.drawing-toolbar',
        position: 'top',
        highlightPadding: 10
    },
    {
        id: 'base-layer',
        title: 'Base Map Switcher 🌍',
        description: 'Switch between different base map styles: Street Map, Satellite Imagery, Topographic, and Dark Theme. Choose the one that best suits your data visualization needs.',
        target: '.base-layer-switcher',
        position: 'right',
        highlightPadding: 10
    },
    {
        id: 'notifications',
        title: 'Notification Center 🔔',
        description: 'All system notifications appear here. You\'ll see upload progress, success messages, errors, and other feedback. Notifications auto-dismiss after a few seconds.',
        target: '.toast-container',
        position: 'bottom',
        highlightPadding: 10
    },
    {
        id: 'complete',
        title: 'You\'re All Set! 🎉',
        description: 'You now know the basics! Upload data, create layers, draw features, export your work, and create amazing visualizations. You can restart this tour anytime by clicking the tour button on the left side of the screen.',
        target: null,
        position: 'center',
        highlightPadding: 0
    }
];

/**
 * Get total number of tour steps
 */
export const getTourStepCount = () => tourSteps.length;

/**
 * Get a specific tour step by index
 */
export const getTourStep = (index) => {
    if (index >= 0 && index < tourSteps.length) {
        return tourSteps[index];
    }
    return null;
};
