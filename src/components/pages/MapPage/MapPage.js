/**
 * MapPage - Main Map View Page
 * 
 * Complete page component for the WebGIS map interface.
 * Orchestrates map display, layer management, file uploads, and UI interactions.
 * 
 * Extracted from App.js to separate page logic from application shell.
 */

import React, { useRef, useState, useEffect } from 'react';
import OpenLayersMap from '../../map/OpenLayersMap';
import BaseLayerSwitcher from '../../map/BaseLayerSwitcher';
import { LayerList, ColorPicker, ToastContainer, DrawingToolbar, TourOverlay } from '../../organisms';
import { ConfirmModal, PromptModal, AddLayerDialog, AddLayerOptionsModal, ExportLayerModal, WelcomePrompt, TourStep } from '../../molecules';
import { TourButton } from '../../atoms';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

// Hooks
import { useToast, useModal, useTour } from '../../../shared/hooks';
import { useFileUpload } from '../../../features/uploads/hooks';
import { useLayerManager, useLayerPersistence, useColorPicker } from '../../../features/layers/hooks';

// Services
import {
  zoomToLayer as zoomToLayerService,
  getLayerColor,
  addNewEmptyLayerToMap,
  getNextLayerCounter,
  exportAsGeoJSON,
  exportAsKML,
  exportAsPNG,
  getLayerNameById
} from '../../../features/layers/services';

// Styles
import './MapPage.css';

const MapPage = () => {
  // Refs for map
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Drawing layer refs
  const drawingVectorSource = useRef(new VectorSource());
  const drawingVectorLayer = useRef(null);

  // Panel collapse state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Base layer type state
  const [baseLayerType, setBaseLayerType] = useState('osm-street');

  // Add layer options modal state (new two-option flow)
  const [isAddLayerOptionsOpen, setIsAddLayerOptionsOpen] = useState(false);

  // Add layer dialog state (for file upload)
  const [isAddLayerDialogOpen, setIsAddLayerDialogOpen] = useState(false);

  // Layer counter for creating new layers (simple initial value)
  const [layerCounter, setLayerCounter] = useState(1);

  // Active layer state (for visual highlighting)
  const [activeLayerId, setActiveLayerId] = useState(null);

  // Drawing toolbar visibility state (manual control)
  const [isDrawingToolbarVisible, setIsDrawingToolbarVisible] = useState(false);

  // Export layer modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportProcessing, setIsExportProcessing] = useState(false);

  // Tour state
  const {
    isTourActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    hasSeenTour,
    isFirstStep,
    isLastStep,
    startTour,
    endTour,
    nextStep,
    previousStep
  } = useTour();
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false);

  // Tour demo state tracking
  const tourStateRef = useRef({
    originalDrawingToolbarVisible: false,
    originalActiveLayerId: null,
    dummyLayerId: null,
    dummyToastId: null
  });

  // Toast notifications (unified for messages and uploads)
  const { toasts, addToast, addUploadToast, updateUploadToast, removeToast } = useToast();

  // Custom modals
  const { confirmModal, promptModal, showConfirm, showPrompt } = useModal();

  // Layer management
  const layerManager = useLayerManager(mapInstance);
  const {
    layerList,
    syncLayerList,
    removeLayer: removeLayerInternal,
    toggleVisibility,
    setOpacity,
    renameLayer: renameLayerInternal,
    moveLayer,
  } = layerManager;

  // Layer persistence (auto-save/load)
  useLayerPersistence(mapInstance, layerList, syncLayerList, addToast);

  // Drawing layer management - create when active layer changes
  useEffect(() => {
    const map = mapInstance.current; // Copy ref value to local variable

    if (!activeLayerId || !map) {
      // Remove drawing layer if no active layer
      if (drawingVectorLayer.current && map) {
        map.removeLayer(drawingVectorLayer.current);
        drawingVectorLayer.current = null;
      }
      return;
    }

    // Create drawing layer for active layer
    if (!drawingVectorLayer.current) {
      drawingVectorLayer.current = new VectorLayer({
        source: drawingVectorSource.current,
        zIndex: 1000, // Above other layers
      });

      // Mark as internal layer so it doesn't appear in layer list
      drawingVectorLayer.current.set('isDrawingLayer', true);
      drawingVectorLayer.current.set('isBaseLayer', true); // This prevents it from showing in UI

      map.addLayer(drawingVectorLayer.current);
    }

    return () => {
      // Cleanup on unmount - use local variable instead of ref
      if (drawingVectorLayer.current && map) {
        map.removeLayer(drawingVectorLayer.current);
        drawingVectorLayer.current = null;
      }
    };
  }, [activeLayerId]);

  // First-time user detection - show welcome prompt
  useEffect(() => {
    if (!hasSeenTour) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowWelcomePrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  // Tour demo state setup and cleanup
  useEffect(() => {
    if (!mapInstance.current) return;

    if (isTourActive) {
      // Save original state
      tourStateRef.current.originalDrawingToolbarVisible = isDrawingToolbarVisible;
      tourStateRef.current.originalActiveLayerId = activeLayerId;

      // Step 1: Create dummy layer if none exists
      const existingLayers = layerList.filter(l => !l.isBaseLayer);
      if (existingLayers.length === 0) {
        const result = addNewEmptyLayerToMap(
          mapInstance.current,
          layerCounter,
          syncLayerList,
          { color: '#4AE661' }
        );

        if (result) {
          tourStateRef.current.dummyLayerId = result.layer.get('id');
          setLayerCounter(result.newCount);

          // Set as active layer
          setActiveLayerId(result.layer.get('id'));
        }
      } else {
        // Use first existing layer as active
        if (!activeLayerId) {
          setActiveLayerId(existingLayers[0].id);
        }
      }

      // Step 2: Show drawing toolbar
      setIsDrawingToolbarVisible(true);

      // Step 3: Add dummy notification
      const toastId = addToast(
        '🎓 Tour in progress - This is an example notification',
        null, // No auto-dismiss during tour
        'info'
      );
      tourStateRef.current.dummyToastId = toastId;

    } else {
      // Tour ended - cleanup demo state
      const {
        originalDrawingToolbarVisible,
        originalActiveLayerId,
        dummyLayerId,
        dummyToastId
      } = tourStateRef.current;

      // Remove dummy notification
      if (dummyToastId) {
        removeToast(dummyToastId);
        tourStateRef.current.dummyToastId = null;
      }

      // Remove dummy layer
      if (dummyLayerId) {
        const dummyLayer = mapInstance.current.getLayers().getArray()
          .find(l => l.get('id') === dummyLayerId);

        if (dummyLayer) {
          mapInstance.current.removeLayer(dummyLayer);
          syncLayerList();
        }
        tourStateRef.current.dummyLayerId = null;
      }

      // Restore original drawing toolbar visibility
      setIsDrawingToolbarVisible(originalDrawingToolbarVisible);

      // Restore original active layer
      setActiveLayerId(originalActiveLayerId);

      // Reset tour state ref
      tourStateRef.current = {
        originalDrawingToolbarVisible: false,
        originalActiveLayerId: null,
        dummyLayerId: null,
        dummyToastId: null
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTourActive]);

  // Monitor and maintain dummy notification during tour
  useEffect(() => {
    if (!isTourActive) return;

    // Check if dummy notification still exists
    const dummyToastExists = toasts.some(toast => toast.id === tourStateRef.current.dummyToastId);

    // If notification was removed (user closed it), create a new one
    if (!dummyToastExists) {
      const toastId = addToast(
        '🎓 Tour in progress - This is an example notification',
        null, // No auto-dismiss during tour
        'info'
      );
      tourStateRef.current.dummyToastId = toastId;
    }
  }, [isTourActive, toasts, addToast]);

  // File upload handling (integrated with toast notifications)
  const { handleFileUpload } = useFileUpload(mapInstance, syncLayerList, addUploadToast, updateUploadToast);

  // Color picker state and logic
  const {
    colorPickerVisible,
    selectedLayer,
    openColorPicker,
    closeColorPicker,
    handleColorChange
  } = useColorPicker(syncLayerList, addToast);

  /**
   * Remove layer with confirmation dialog and toast notification
   */
  const removeLayer = async (layerObj) => {
    if (!layerObj) return;

    if (layerObj.get('isBaseLayer')) {
      addToast('Cannot delete the Base Map.');
      return;
    }

    const title = layerObj.get('title') || 'layer';
    const confirmed = await showConfirm({
      title: 'Remove Layer',
      message: `Are you sure you want to remove "${title}"?`,
      variant: 'danger',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    removeLayerInternal(layerObj);
    addToast(`Removed layer: ${title}`);
  };

  /**
   * Rename layer with custom prompt dialog and toast notification
   */
  const renameLayer = async (layer, newName) => {
    // If newName is provided (from PromptModal), use it directly
    if (newName === undefined) {
      // Show prompt modal
      const result = await showPrompt({
        title: 'Rename Layer',
        message: 'Enter new layer name:',
        defaultValue: layer.get('title') || 'Layer',
        placeholder: 'Layer name',
        validate: (value) => {
          if (!value.trim()) {
            return 'Layer name cannot be empty';
          }
          return null;
        }
      });

      if (result === null) return; // User canceled
      newName = result;
    }

    renameLayerInternal(layer, newName);
    addToast(`Renamed layer to: ${newName}`);
  };

  /**
   * Zoom to layer with toast notifications
   */
  const zoomToLayer = (layerObj) => {
    if (!layerObj || !mapInstance.current) return;

    const success = zoomToLayerService(layerObj, mapInstance.current);

    if (success) {
      const title = layerObj.get('title') || 'layer';
      addToast(`Zoomed to: ${title}`);
    } else {
      addToast('Cannot zoom: layer has no valid features');
    }
  };

  /**
   * Handle base layer type change
   */
  const handleBaseLayerChange = (newType) => {
    setBaseLayerType(newType);
    const layerNames = {
      'osm-street': 'Street Map',
      'satellite': 'Satellite View',
      'topo': 'Topographic Map',
      'dark': 'Dark Theme'
    };
    addToast(`Switched to ${layerNames[newType] || newType}`, 2000, 'info');
  };

  /**
   * Handle layer selection (set as active)
   */
  const handleLayerSelect = (layerId) => {
    setActiveLayerId(layerId);
  };

  /**
   * Handle opening the Add Layer Options modal
   */
  const handleAddLayerClick = () => {
    setIsAddLayerOptionsOpen(true);
  };

  /**
   * Handle Upload Layer option from the options modal
   */
  const handleUploadLayerOption = () => {
    setIsAddLayerOptionsOpen(false);
    setIsAddLayerDialogOpen(true);
  };

  /**
   * Handle Create New Layer option from the options modal
   */
  const handleCreateNewLayer = () => {
    if (!mapInstance.current) return;

    // Calculate proper counter (lazy initialization)
    const currentCounter = layerCounter === 1 && layerList.length > 0
      ? getNextLayerCounter(mapInstance.current)
      : layerCounter;

    // Create and add new empty layer
    const result = addNewEmptyLayerToMap(
      mapInstance.current,
      currentCounter,
      syncLayerList,
      { color: '#4AE661' } // Default green color
    );

    if (result) {
      // Update counter
      setLayerCounter(result.newCount);

      // Set as active layer
      const layerId = result.layer.get('id');
      setActiveLayerId(layerId);

      // Show success toast
      addToast(`Created new layer: ${result.layerName}`, 3000, 'success');
    }

    // Close modal
    setIsAddLayerOptionsOpen(false);
  };

  /**
   * Handle export button click
   */
  const handleExportClick = () => {
    if (!activeLayerId) {
      addToast('Please select a layer to export', 3000, 'warning');
      return;
    }
    setIsExportModalOpen(true);
  };

  /**
   * Handle GeoJSON export
   */
  const handleExportGeoJSON = async () => {
    if (!mapInstance.current || !activeLayerId) return;

    setIsExportProcessing(true);
    try {
      const layerName = getLayerNameById(mapInstance.current, activeLayerId);
      const filename = `${layerName.replace(/\s+/g, '-').toLowerCase()}.geojson`;

      await exportAsGeoJSON(mapInstance.current, activeLayerId, filename);

      addToast(`Exported ${layerName} as GeoJSON`, 3000, 'success');
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      addToast(error.message || 'Failed to export layer', 5000, 'error');
    } finally {
      setIsExportProcessing(false);
    }
  };

  /**
   * Handle KML export
   */
  const handleExportKML = async () => {
    if (!mapInstance.current || !activeLayerId) return;

    setIsExportProcessing(true);
    try {
      const layerName = getLayerNameById(mapInstance.current, activeLayerId);
      const filename = `${layerName.replace(/\s+/g, '-').toLowerCase()}.kml`;

      await exportAsKML(mapInstance.current, activeLayerId, filename);

      addToast(`Exported ${layerName} as KML`, 3000, 'success');
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      addToast(error.message || 'Failed to export layer', 5000, 'error');
    } finally {
      setIsExportProcessing(false);
    }
  };

  /**
   * Handle PNG export
   */
  const handleExportPNG = async () => {
    if (!mapInstance.current || !activeLayerId) return;

    setIsExportProcessing(true);
    try {
      const layerName = getLayerNameById(mapInstance.current, activeLayerId);
      const filename = `${layerName.replace(/\s+/g, '-').toLowerCase()}.png`;

      await exportAsPNG(mapInstance.current, activeLayerId, filename);

      addToast(`Exported ${layerName} as PNG`, 3000, 'success');
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      addToast(error.message || 'Failed to export layer', 5000, 'error');
    } finally {
      setIsExportProcessing(false);
    }
  };

  return (
    <div className="map-page">
      <div className="app-container">
        {/* Map and overlayed components */}
        <div className="map-wrapper">
          <OpenLayersMap
            mapRef={mapRef}
            mapInstanceRef={mapInstance}
            syncLayerList={syncLayerList}
            addToast={addToast}
            baseLayerType={baseLayerType}
          />

          {/* Color Picker Modal */}
          {colorPickerVisible && selectedLayer && (
            <ColorPicker
              currentColor={getLayerColor(selectedLayer)}
              onColorChange={(newColor) => handleColorChange(selectedLayer, newColor)}
              onClose={closeColorPicker}
            />
          )}

          {/* Base Layer Switcher */}
          <BaseLayerSwitcher
            currentBaseLayer={baseLayerType}
            onChangeBaseLayer={handleBaseLayerChange}
          />

          {/* Confirmation Modal */}
          <ConfirmModal {...confirmModal} />

          {/* Prompt Modal */}
          <PromptModal {...promptModal} />

          {/* Control panel wrapper for other UI */}
          <div className="control-panel neon-panel" />

          {/* Unified Toast notifications (messages and uploads) */}
          <ToastContainer toasts={toasts} removeToast={removeToast} />

          {/* Tour System */}
          {/* Welcome prompt for first-time users */}
          {showWelcomePrompt && (
            <WelcomePrompt
              onStartTour={() => {
                setShowWelcomePrompt(false);
                startTour();
              }}
              onSkip={() => {
                setShowWelcomePrompt(false);
                endTour(); // Mark as seen
              }}
            />
          )}

          {/* Tour overlay and step display */}
          {isTourActive && (
            <>
              <TourOverlay currentStep={currentStep} />
              <TourStep
                step={currentStep}
                stepNumber={currentStepIndex + 1}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrevious={previousStep}
                onSkip={endTour}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
              />
            </>
          )}

          {/* Tour trigger button */}
          <TourButton onClick={startTour} isActive={isTourActive} />

          {/* Layer list and uploads panel */}
          <div className="map-cards" aria-hidden={false}>
            <div className="map-cards-right">

              {/* Layer List Card */}
              <div className={`map-cards ${isPanelCollapsed ? 'collapsed' : ''}`}>
                <div className="panel-section card">
                  <div className="map-card map-card-name">
                    <h5>
                      Layers ({layerList.filter(item => !item.isBaseLayer).length})
                    </h5>
                    <div style={{ display: 'flex', gap: '8px', margin: '5px 0' }}>
                      {/* Drawing Tools Toggle */}
                      <button
                        className="upload-btn"
                        onClick={() => {
                          if (activeLayerId) {
                            setIsDrawingToolbarVisible(!isDrawingToolbarVisible);
                          }
                        }}
                        title={!activeLayerId ? "Select a layer to use drawing tools" : (isDrawingToolbarVisible ? "Hide Drawing Tools" : "Show Drawing Tools")}
                        style={{ opacity: activeLayerId ? 1 : 0.5 }}
                        disabled={!activeLayerId}
                      >{isDrawingToolbarVisible ? <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="24px" fill="#aaa"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M450-81q-78-6-145.5-39T187-206.5q-50-53.5-78.5-124T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v19q-17-11-39.5-21.5T799-500q-8-126-99.5-213T480-800q-56 0-105.5 18T284-732l245 245q-19 8-36.5 18.5T458-446L228-676q-32 41-50 90.5T160-480q0 99 53.5 177.5T352-187q18 28 45 57t53 49Zm230-79q59 0 109.5-27t80.5-73q-30-46-80.5-73T680-360q-59 0-109.5 27T490-260q30 46 80.5 73T680-160Zm0 80q-96 0-171.5-50.5T400-260q33-79 108.5-129.5T680-440q96 0 171.5 50.5T960-260q-33 79-108.5 129.5T680-80Zm0-120q-25 0-42.5-17.5T620-260q0-25 17.5-42.5T680-320q25 0 42.5 17.5T740-260q0 25-17.5 42.5T680-200Z" /></svg>}Tools</button>

                      {/* Add Layer Button */}
                      <button
                        className="upload-btn"
                        onClick={handleAddLayerClick}
                        title="Add new layer"
                      >
                        ➕ Layer
                      </button>

                      {/* Export Layer Button */}
                      <button
                        className="upload-btn"
                        onClick={handleExportClick}
                        title={!activeLayerId ? "Select a layer to export" : "Export active layer"}
                        style={{ opacity: activeLayerId ? 1 : 0.5 }}
                        disabled={!activeLayerId}
                      >
                        📤 Export
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {!isPanelCollapsed && (
                    <LayerList
                      layerList={layerList}
                      moveLayer={moveLayer}
                      removeLayer={removeLayer}
                      toggleVisibility={toggleVisibility}
                      setOpacity={setOpacity}
                      renameLayer={renameLayer}
                      zoomToLayer={zoomToLayer}
                      openColorPicker={openColorPicker}
                      addToast={addToast}
                      showHeader={false}
                      activeLayerId={activeLayerId}
                      onLayerSelect={handleLayerSelect}
                    />
                  )}
                </div>
              </div>
              <button
                className="panel-toggle-arrow"
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                title={isPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
                aria-label={isPanelCollapsed ? "Expand Layers Panel" : "Collapse Layers Panel"}
              >
                {isPanelCollapsed ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" /></svg>}
              </button>
            </div>

          </div>

          {/* Add Layer Options Modal (Two-option flow) */}
          <AddLayerOptionsModal
            isOpen={isAddLayerOptionsOpen}
            onClose={() => setIsAddLayerOptionsOpen(false)}
            onUploadLayer={handleUploadLayerOption}
            onCreateLayer={handleCreateNewLayer}
          />

          {/* Add Layer Dialog (File upload) */}
          <AddLayerDialog
            isOpen={isAddLayerDialogOpen}
            onClose={() => setIsAddLayerDialogOpen(false)}
            onUploadFile={handleFileUpload}
          />

          {/* Export Layer Modal */}
          <ExportLayerModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExportGeoJSON={handleExportGeoJSON}
            onExportKML={handleExportKML}
            onExportPNG={handleExportPNG}
            isProcessing={isExportProcessing}
            activeLayerName={activeLayerId ? getLayerNameById(mapInstance.current, activeLayerId) : ''}
          />

          {/* Drawing Toolbar */}
          {isDrawingToolbarVisible && activeLayerId && (
            <DrawingToolbar
              mapInstance={mapInstance.current}
              vectorSource={drawingVectorSource.current}
              activeLayerId={activeLayerId}
              addToast={addToast}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
