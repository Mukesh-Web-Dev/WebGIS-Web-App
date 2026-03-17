import React, { useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import GeoJSON from "ol/format/GeoJSON";
import KML from "ol/format/KML";
import DragAndDrop from "ol/interaction/DragAndDrop";
import { defaults as defaultInteractions } from "ol/interaction/defaults";
import { unByKey } from "ol/Observable";
import "ol/ol.css";
import { getItem as storageGetItem } from "../../utils/storage";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import CircleStyle from "ol/style/Circle";
import PropTypes from "prop-types";

/**
 * Initializes and manages the OpenLayers map instance.
 * @param {Object} props
 * @param {React.MutableRefObject} mapInstanceRef - Ref to store the OL map instance.
 * @param {React.MutableRefObject} mapRef - Ref to attach the map DOM element.
 * @param {function} syncLayerList - Function to update the React state with current OL layers.
 * @param {string} baseLayerType - Type of base layer to use (osm-street, satellite, topo, dark)
 * @param {function} onBaseLayerReady - Callback when base layers are initialized
 */
const OpenLayersMap = ({ mapInstanceRef, mapRef, syncLayerList, addToast, baseLayerType = 'osm-street', onBaseLayerReady }) => {
  // Store initial base layer type to prevent re-initialization
  const initialBaseLayerType = React.useRef(baseLayerType);
  
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // 1. Base Layers - Multiple types
    // Use initial base layer type for first render only
    const baseLayerOSM = new TileLayer({
      source: new OSM(),
      title: "Street Map (OSM)",
      visible: initialBaseLayerType.current === 'osm-street',
    });
    baseLayerOSM.set("id", "base-osm-street");
    baseLayerOSM.set("type", "osm-street");
    baseLayerOSM.set("isBaseLayer", true);

    const baseLayerSatellite = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      }),
      title: "Satellite (Esri)",
      visible: initialBaseLayerType.current === 'satellite',
    });
    baseLayerSatellite.set("id", "base-satellite");
    baseLayerSatellite.set("type", "satellite");
    baseLayerSatellite.set("isBaseLayer", true);

    const baseLayerTopo = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap',
        maxZoom: 17,
      }),
      title: "Topographic",
      visible: initialBaseLayerType.current === 'topo',
    });
    baseLayerTopo.set("id", "base-topo");
    baseLayerTopo.set("type", "topo");
    baseLayerTopo.set("isBaseLayer", true);

    const baseLayerDark = new TileLayer({
      source: new XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attributions: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
      }),
      title: "Dark Theme",
      visible: initialBaseLayerType.current === 'dark',
    });
    baseLayerDark.set("id", "base-dark");
    baseLayerDark.set("type", "dark");
    baseLayerDark.set("isBaseLayer", true);

    const baseLayers = [baseLayerOSM, baseLayerSatellite, baseLayerTopo, baseLayerDark];

    // 2. Drag and Drop Interaction
    const dragAndDropInteraction = new DragAndDrop({
      formatConstructors: [GeoJSON, KML],
    });

    // Handle Drag & Drop: Create a NEW layer for the dropped file
    const onAddFeatures = (event) => {
      const vectorSource = new VectorSource({
        features: event.features,
      });
      const newLayer = new VectorLayer({
        source: vectorSource,
        title: (event.file && event.file.name) || "Dropped data", // Use filename as layer title
        style: new Style({
          stroke: new Stroke({ color: "#319FD3", width: 2 }),
          fill: new Fill({ color: "rgba(255, 255, 255, 0.4)" }),
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: "#319FD3" }),
          }),
        }),
      });

      // assign stable ID for UI usage
      newLayer.set("id", `layer-${Date.now()}`);
      newLayer.set("title", (event.file && event.file.name) || "Dropped data");

      mapInstanceRef.current.addLayer(newLayer);
      const extent = vectorSource.getExtent();
      if (extent && extent.every(Number.isFinite)) {
        mapInstanceRef.current
          .getView()
          .fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
      }
      syncLayerList();
    };

    const ddKey = dragAndDropInteraction.on("addfeatures", onAddFeatures);

    // 3. Initialize Map
    const map = new Map({
      target: mapRef.current,
      interactions: defaultInteractions().extend([dragAndDropInteraction]),
      layers: [...baseLayers], // Add all base layers
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    mapInstanceRef.current = map;

    // Notify parent that base layers are ready
    if (onBaseLayerReady) {
      onBaseLayerReady(baseLayers);
    }

    // Initial Sync
    // Restore any saved layer order/properties from localStorage (best-effort)
    let _raw = null;
    try {
      _raw = storageGetItem("layerState");
      const rawTrim = typeof _raw === "string" ? _raw.trim() : _raw;
      if (!rawTrim) {
        // nothing stored, first visit or explicitly cleared; skip restore silently
      } else {
        // Attempt to parse; if parsing fails we'll warn since there was data
        let state = null;
        try {
          state = JSON.parse(_raw);
        } catch (parseErr) {
          console.warn("Failed to parse stored layerState", parseErr);
          if (addToast) addToast("Failed to restore layer state");
        }

        // Only proceed if parsed state is an array (expected format)
        if (Array.isArray(state) && state.length > 0) {
          try {
            const layersCollection = map.getLayers();
            const currentLayers = layersCollection.getArray().slice();
            const idMap = new Map();
            currentLayers.forEach((l) => idMap.set(l.get("id") || l.ol_uid, l));

            const ordered = [];
            const baseLayer = currentLayers.find((l) => l.get("isBaseLayer"));
            if (baseLayer) {
              ordered.push(baseLayer);
              idMap.delete(baseLayer.get("id"));
            }

            const keysToDelete = [];
            state.forEach((s) => {
              // try id lookup first
              let lay = idMap.get(s.id);
              // fallback: try matching by title (useful for base layer or ids that changed)
              if (!lay && s.title) {
                for (const [key, value] of idMap.entries()) {
                  if (value.get("title") === s.title) {
                    lay = value;
                    s.id = key;
                    break;
                  }
                }
              }

              if (lay) {
                // apply visible / opacity / title if available
                if (
                  typeof lay.setVisible === "function" &&
                  typeof s.visible !== "undefined"
                )
                  lay.setVisible(s.visible);
                if (
                  typeof lay.setOpacity === "function" &&
                  typeof s.opacity !== "undefined"
                )
                  lay.setOpacity(s.opacity);
                if (s.title) lay.set("title", s.title);

                // if this is the base layer it was already pushed to ordered; just remove from idMap
                if (lay.get("isBaseLayer")) {
                  keysToDelete.push(s.id);
                } else {
                  ordered.push(lay);
                  keysToDelete.push(s.id);
                }
              }
            });

            keysToDelete.forEach((k) => idMap.delete(k));

            Array.from(idMap.values()).forEach((lay) => {
              if (!lay.get("isBaseLayer")) ordered.push(lay);
            });

            if (ordered.length > 0) {
              layersCollection.clear();
              ordered.forEach((l) => layersCollection.push(l));
            }
          } catch (restoreErr) {
            // Only warn if we had valid stored data that then failed to restore
            console.warn("Failed to restore layer state", restoreErr);
            if (addToast) addToast("Failed to restore layer state");
          }
        }
      }
    } catch (e) {
      // Unexpected access error; warn
      console.warn("Failed to access stored layer state", e);
      if (addToast) addToast("Failed to restore layer state");
    }

    syncLayerList();

    // Cleanup function
    return () => {
      // Unbind drag-and-drop listener
      try {
        unByKey(ddKey);
      } catch (e) {
        // best-effort cleanup
      }
      map.setTarget(null);
      mapInstanceRef.current = null;
    };
    // IMPORTANT: baseLayerType is NOT in dependencies to prevent reinitialization
    // Layer switching is handled by the separate useEffect below
  }, [mapInstanceRef, mapRef, syncLayerList, addToast, onBaseLayerReady]);

  // Handle base layer type changes (HOT SWAP - preserves zoom/center)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Toggle visibility of base layers without recreating the map
    const layers = mapInstanceRef.current.getLayers().getArray();
    layers.forEach((layer) => {
      if (layer.get('isBaseLayer')) {
        const layerType = layer.get('type');
        // Only change visibility - this preserves the View (zoom/center)
        layer.setVisible(layerType === baseLayerType);
      }
    });
  }, [baseLayerType, mapInstanceRef]);

  return <div ref={mapRef} className="map-container" />;
};

export default OpenLayersMap;

OpenLayersMap.propTypes = {
  mapInstanceRef: PropTypes.object.isRequired,
  mapRef: PropTypes.object.isRequired,
  syncLayerList: PropTypes.func.isRequired,
  addToast: PropTypes.func,
  baseLayerType: PropTypes.string,
  onBaseLayerReady: PropTypes.func,
};
