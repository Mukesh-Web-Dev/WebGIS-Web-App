import { useCallback, useEffect, useRef, useState } from "react";
import { uiIndexToOlIndex, isValidOlIndexForMove } from "../utils/layerUtils";
import { setItem as storageSetItem } from "../../../shared/utils/storage/localStorage";

// Hook encapsulating layer list sync + simple layer operations
export default function useLayerManager(mapInstanceRef) {
  const [layerList, setLayerList] = useState([]);
  const debounceRef = useRef(null);

  const saveLayerState = useCallback((state) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        storageSetItem("layerState", JSON.stringify(state));
      } catch (e) {
        // ignore
      }
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const syncLayerList = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const layers = mapInstanceRef.current.getLayers().getArray();
    const list = layers
      .map((layer, index) => ({
        id: layer.get("id") || layer.ol_uid,
        title: layer.get("title") || `Layer ${index + 1}`,
        layer,
        isBaseLayer: layer.get("isBaseLayer") || false,
        visible:
          typeof layer.getVisible === "function" ? layer.getVisible() : true,
        opacity:
          typeof layer.getOpacity === "function" ? layer.getOpacity() : 1,
      }))
      .reverse();

    setLayerList(list);
    try {
      const state = list.map((l) => ({
        id: l.id,
        title: l.title,
        visible: l.visible,
        opacity: l.opacity,
      }));
      saveLayerState(state);
    } catch (e) {}
  }, [mapInstanceRef, saveLayerState]);

  const removeLayer = useCallback(
    (layerToRemove, onCannotRemove) => {
      if (!mapInstanceRef.current || !layerToRemove) return;
      if (layerToRemove.get("isBaseLayer")) {
        if (onCannotRemove) onCannotRemove();
        return;
      }
      mapInstanceRef.current.removeLayer(layerToRemove);
      syncLayerList();
    },
    [mapInstanceRef, syncLayerList]
  );

  const toggleVisibility = useCallback(
    (layer) => {
      if (!layer) return;
      const current =
        typeof layer.getVisible === "function" ? layer.getVisible() : true;
      if (typeof layer.setVisible === "function") layer.setVisible(!current);
      syncLayerList();
    },
    [syncLayerList]
  );

  const setOpacity = useCallback(
    (layer, value) => {
      if (!layer) return;
      if (typeof layer.setOpacity === "function") layer.setOpacity(value);
      syncLayerList();
    },
    [syncLayerList]
  );

  const renameLayer = useCallback(
    (layer, newName) => {
      if (!layer) return;
      layer.set("title", newName);
      syncLayerList();
    },
    [syncLayerList]
  );

  const moveLayer = useCallback(
    (index, direction) => {
      if (!mapInstanceRef.current) return;
      const layersCollection = mapInstanceRef.current.getLayers();
      const arrayLength = layersCollection.getLength();
      const currentOlIndex = uiIndexToOlIndex(arrayLength, index);
      const newOlIndex = currentOlIndex + direction;
      if (!isValidOlIndexForMove(newOlIndex, arrayLength)) return;
      const layer = layersCollection.item(currentOlIndex);
      layersCollection.removeAt(currentOlIndex);
      layersCollection.insertAt(newOlIndex, layer);
      syncLayerList();
    },
    [mapInstanceRef, syncLayerList]
  );

  return {
    layerList,
    syncLayerList,
    removeLayer,
    toggleVisibility,
    setOpacity,
    renameLayer,
    moveLayer,
  };
}
