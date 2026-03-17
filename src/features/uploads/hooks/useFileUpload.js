/**
 * Refactored useFileUpload Hook
 * 
 * Custom hook for handling file uploads with support for multiple GIS formats.
 * Significantly reduced from 340 lines by extracting worker and parsing logic.
 * 
 * Supports: GeoJSON, KML, KMZ, Shapefiles (.zip)
 */

import { useState, useRef } from 'react';
import { validateFileSize } from '../../../utils/core/validators';
import { generateUploadId } from '../../../utils/core/formatUtils';
import { parseGeoJSONFeatures } from '../../../utils/fileUtils';
import { readAsText, readAsArrayBuffer, setupProgressTracking, setupAbortHandling } from '../../../utils/core/fileReaders';
import { addNewLayer } from '../../../utils/layerUtils';

/**
 * Hook for managing file uploads
 * 
 * @param {React.MutableRefObject} mapInstanceRef - Ref to OpenLayers map instance
 * @param {Function} syncLayerList - Function to sync layer list UI
 * @param {Function} addToast - Function to show toast notifications
 * @returns {Object} Upload state and handlers
 * 
 * @example
 * const { uploads, handleFileUpload } = useFileUpload(mapInstance, syncLayerList, addToast);
 */
const useFileUpload = (mapInstanceRef, syncLayerList, addToast) => {
  const [uploads, setUploads] = useState([]);
  const fileReadersRef = useRef({});

  /**
   * Main file upload handler
   */
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !mapInstanceRef.current) return;

    const mapProjection = mapInstanceRef.current.getView().getProjection();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      const fileNameLower = fileName.toLowerCase();
      const uploadId = generateUploadId(fileName, i);

      // Validate file size
      const { valid, error } = validateFileSize(file);
      if (!valid) {
        setUploads((u) => [...u, {
          id: uploadId,
          name: fileName,
          status: 'error',
          error
        }]);
        if (addToast) addToast(error);
        continue;
      }

      // Queue upload
      setUploads((u) => [...u, {
        id: uploadId,
        name: fileName,
        status: 'queued',
        error: null,
        progress: 0
      }]);

      try {
        const reader = new FileReader();
        fileReadersRef.current[uploadId] = reader;

        // Setup progress and abort tracking
        setupProgressTracking(reader, (pct) => {
          setUploads((u) => u.map((x) =>
            x.id === uploadId ? { ...x, progress: pct } : x
          ));
        });

        setupAbortHandling(reader, () => {
          setUploads((u) => u.map((x) =>
            x.id === uploadId ? { ...x, status: 'canceled' } : x
          ));
        });

        setUploads((u) => u.map((x) =>
          x.id === uploadId ? { ...x, status: 'reading', progress: 0 } : x
        ));

        // Process based on file type
        if (fileNameLower.endsWith('.json') || fileNameLower.endsWith('.geojson')) {
          await processGeoJSON(reader, file, fileName, i, mapProjection);
        } else if (fileNameLower.endsWith('.kml')) {
          await processKML(reader, file, fileName, i, mapProjection);
        } else if (fileNameLower.endsWith('.kmz')) {
          await processKMZ(reader, file, fileName, i, mapProjection);
        } else if (fileNameLower.endsWith('.zip')) {
          await processShapefile(reader, file, fileName, i, mapProjection);
        } else {
          throw new Error('Unsupported file format');
        }

        setUploads((u) => u.map((x) =>
          x.id === uploadId ? { ...x, status: 'done', progress: 100 } : x
        ));
      } catch (error) {
        console.error('File Upload Error:', error);
        setUploads((u) => u.map((x) =>
          x.id === uploadId ? { ...x, status: 'error', error: String(error) } : x
        ));
        if (addToast) addToast(`Error loading ${fileName}`);
      } finally {
        delete fileReadersRef.current[uploadId];
      }
    }

    event.target.value = '';
  };

  /**
   * Process GeoJSON file
   */
  const processGeoJSON = async (reader, file, fileName, index, mapProjection) => {
    const text = await readAsText(reader, file);
    const features = parseGeoJSONFeatures(text, mapProjection);
    addNewLayer(mapInstanceRef, features, fileName, `-${index}`, syncLayerList);
  };

  /**
   * Process KML file
   */
  const processKML = async (reader, file, fileName, index, mapProjection) => {
    const text = await readAsText(reader, file);
    const KML = (await import('ol/format/KML')).default;
    const features = new KML().readFeatures(text, {
      featureProjection: mapProjection
    });
    addNewLayer(mapInstanceRef, features, fileName, `-${index}`, syncLayerList);
  };

  /**
   * Process KMZ file
   */
  const processKMZ = async (reader, file, fileName, index, mapProjection) => {
    const arrayBuffer = await readAsArrayBuffer(reader, file);
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(arrayBuffer);

    const kmlFileName = Object.keys(zip.files).find((n) =>
      n.toLowerCase().endsWith('.kml')
    );

    if (kmlFileName) {
      const kmlString = await zip.file(kmlFileName).async('string');
      const KML = (await import('ol/format/KML')).default;
      const features = new KML().readFeatures(kmlString, {
        featureProjection: mapProjection
      });
      addNewLayer(mapInstanceRef, features, fileName, `-${index}`, syncLayerList);
    }
  };

  /**
   * Process Shapefile (zip)
   * Uses web worker for large files
   */
  const processShapefile = async (reader, file, fileName, index, mapProjection) => {
    const arrayBuffer = await readAsArrayBuffer(reader, file);
    const shp = (await import('shpjs')).default;
    const geojson = await shp(arrayBuffer);

    let features = [];
    if (Array.isArray(geojson)) {
      for (const g of geojson) {
        features = features.concat(parseGeoJSONFeatures(g, mapProjection));
      }
    } else {
      features = parseGeoJSONFeatures(geojson, mapProjection);
    }

    addNewLayer(mapInstanceRef, features, fileName, `-${index}`, syncLayerList);
  };

  /**
   * Cancel a specific upload
   */
  const handleCancelUpload = (uploadId) => {
    const r = fileReadersRef.current[uploadId];
    if (r && typeof r.abort === 'function') r.abort();

    setUploads((uploads) => uploads.map((x) =>
      x.id === uploadId ? { ...x, status: 'canceled' } : x
    ));

    const upload = uploads.find((p) => p.id === uploadId);
    if (upload?.name && addToast) {
      addToast(`Canceled ${upload.name}`);
    }
  };

  /**
   * Cancel all active uploads
   */
  const handleCancelAll = () => {
    Object.values(fileReadersRef.current).forEach((r) => {
      try {
        if (r && typeof r.abort === 'function') r.abort();
      } catch (e) {
        console.warn('Error aborting reader:', e);
      }
    });

    setUploads((uploads) => uploads.map((x) =>
      x.status === 'reading' ? { ...x, status: 'canceled' } : x
    ));

    if (addToast) addToast('Canceled all uploads');
  };

  /**
   * Clear completed uploads from state
   */
  const clearCompletedUploads = () => {
    setUploads((prev) => {
      const remaining = prev.filter((p) => p.status === 'reading');

      // Free fileReadersRef entries for completed uploads
      prev.forEach((p) => {
        if (p.status !== 'reading' && fileReadersRef.current[p.id]) {
          try {
            delete fileReadersRef.current[p.id];
          } catch (e) {
            console.warn('Error clearing reader ref:', e);
          }
        }
      });

      return remaining;
    });
  };

  return {
    uploads,
    handleFileUpload,
    handleCancelUpload,
    handleCancelAll,
    clearCompletedUploads
  };
};

export default useFileUpload;
