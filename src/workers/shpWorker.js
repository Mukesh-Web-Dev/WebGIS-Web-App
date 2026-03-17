/* eslint-env worker */
import shp from "shpjs";

// Worker that receives an ArrayBuffer of a shapefile (zip) and returns GeoJSON
// Use `globalThis` to avoid ESLint `no-restricted-globals` warnings.

const ctx =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window.self !== "undefined"
    ? window.self
    : this;
ctx.addEventListener("message", async (e) => {
  try {
    const arrayBuffer = e.data;
    const result = await shp(arrayBuffer);
    // result can be GeoJSON or an array of GeoJSONs
    ctx.postMessage({ type: "result", data: result });
  } catch (err) {
    ctx.postMessage({ type: "error", error: String(err) });
  }
});
