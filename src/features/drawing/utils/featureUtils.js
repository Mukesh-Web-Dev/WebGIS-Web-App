/**
 * Drawing Feature Utilities
 * 
 * Utility functions for feature management, naming, styling, and conversions.
 */

import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { fromCircle } from 'ol/geom/Polygon';

/**
 * Generate feature name with sequential counter
 * 
 * @param {string} type - Geometry type (Point, LineString, Polygon, Circle)
 * @param {number} counter - Sequential counter
 * @returns {string} Formatted name (e.g., "point_01", "line_05")
 * 
 * @example
 * generateFeatureName('Point', 1); // "point_01"
 * generateFeatureName('LineString', 12); // "line_12"
 */
export const generateFeatureName = (type, counter) => {
    // Normalize type names
    let typePrefix = type.toLowerCase();
    if (type === 'LineString') typePrefix = 'line';
    if (type === 'MultiPoint') typePrefix = 'multipoint';
    if (type === 'MultiLineString') typePrefix = 'multiline';
    if (type === 'MultiPolygon') typePrefix = 'multipolygon';

    // Zero-pad counter to 2 digits
    const countStr = counter.toString().padStart(2, '0');

    return `${typePrefix}_${countStr}`;
};

/**
 * Convert Circle geometry to Polygon for GeoJSON compatibility
 * 
 * @param {import('ol/geom/Circle').default} circleGeometry - Circle geometry
 * @param {number} [sides=64] - Number of polygon sides (higher = smoother)
 * @returns {import('ol/geom/Polygon').default} Polygon geometry
 */
export const convertCircleToPolygon = (circleGeometry, sides = 64) => {
    return fromCircle(circleGeometry, sides);
};

/**
 * Create OpenLayers style for drawn feature
 * 
 * @param {string} color - Hex color code
 * @param {string} type - Geometry type
 * @param {Object} [options={}] - Style options
 * @returns {import('ol/style/Style').default} OpenLayers Style
 */
export const createDrawingStyle = (color = '#4AE661', type = 'Point', options = {}) => {
    const {
        strokeWidth = 2,
        fillOpacity = 0.2,
        pointRadius = 7
    } = options;

    // Convert hex to RGBA
    const fillColor = hexToRgba(color, fillOpacity);

    const styleConfig = {
        stroke: new Stroke({
            color: color,
            width: strokeWidth,
        }),
        fill: new Fill({
            color: fillColor,
        }),
    };

    // Add point-specific styling
    if (type === 'Point' || type === 'Circle') {
        styleConfig.image = new CircleStyle({
            radius: pointRadius,
            fill: new Fill({ color: color }),
            stroke: new Stroke({
                color: '#FFFFFF',
                width: 1.5,
            }),
        });
    }

    return new Style(styleConfig);
};

/**
 * Convert hex color to RGBA string
 * 
 * @param {string} hex - Hex color (#RRGGBB or RRGGBB)
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export const hexToRgba = (hex, alpha = 1) => {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get feature extent (bounding box)
 * 
 * @param {import('ol/Feature').default} feature - OpenLayers feature
 * @returns {Array<number>|null} Extent [minX, minY, maxX, maxY] or null
 */
export const getFeatureExtent = (feature) => {
    try {
        const geometry = feature.getGeometry();
        if (!geometry) return null;

        const extent = geometry.getExtent();
        return extent;
    } catch (error) {
        console.error('Error getting feature extent:', error);
        return null;
    }
};

/**
 * Calculate feature area (for polygons)
 * 
 * @param {import('ol/Feature').default} feature - OpenLayers feature
 * @returns {number|null} Area in square meters or null
 */
export const calculateFeatureArea = (feature) => {
    try {
        const geometry = feature.getGeometry();
        if (!geometry || geometry.getType() !== 'Polygon') return null;

        return geometry.getArea();
    } catch (error) {
        console.error('Error calculating feature area:', error);
        return null;
    }
};

/**
 * Calculate feature length (for lines)
 * 
 * @param {import('ol/Feature').default} feature - OpenLayers feature
 * @returns {number|null} Length in meters or null
 */
export const calculateFeatureLength = (feature) => {
    try {
        const geometry = feature.getGeometry();
        if (!geometry || geometry.getType() !== 'LineString') return null;

        return geometry.getLength();
    } catch (error) {
        console.error('Error calculating feature length:', error);
        return null;
    }
};

/**
 * Validate if feature can be added (checks for limits, etc.)
 * 
 * @param {Array<Feature>} existingFeatures - Current features
 * @param {number} [maxFeatures=500] - Maximum allowed features
 * @returns {Object} Validation result
 */
export const validateFeatureAdd = (existingFeatures, maxFeatures = 500) => {
    if (existingFeatures.length >= maxFeatures) {
        return {
            valid: false,
            error: `Maximum feature limit reached (${maxFeatures}). Please delete some features.`
        };
    }

    return { valid: true };
};

/**
 * Get geometry type display name
 * 
 * @param {string} type - Geometry type
 * @returns {string} Display name
 */
export const getGeometryDisplayName = (type) => {
    const displayNames = {
        'Point': 'Point',
        'LineString': 'Line',
        'Polygon': 'Polygon',
        'Circle': 'Circle',
        'MultiPoint': 'Multi-Point',
        'MultiLineString': 'Multi-Line',
        'MultiPolygon': 'Multi-Polygon'
    };

    return displayNames[type] || type;
};

/**
 * Clone a feature with new properties
 * 
 * @param {import('ol/Feature').default} feature - Feature to clone
 * @param {Object} newProperties - Properties to override
 * @returns {import('ol/Feature').default} Cloned feature
 */
export const cloneFeature = (feature, newProperties = {}) => {
    const Feature = require('ol/Feature').default;
    const geometry = feature.getGeometry().clone();
    const cloned = new Feature(geometry);

    // Copy existing properties
    const existingProps = feature.getProperties();
    const { geometry: _, ...cleanProps } = existingProps;

    cloned.setProperties({
        ...cleanProps,
        ...newProperties
    });

    return cloned;
};
