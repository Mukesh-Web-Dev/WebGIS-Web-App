// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Provide a lightweight mock for ol/format/GeoJSON used by unit tests
jest.mock("ol/format/GeoJSON", () => {
  return jest.fn().mockImplementation(() => ({
    readFeatures: (input, options) => {
      let obj = input;
      if (typeof input === "string") {
        try {
          obj = JSON.parse(input);
        } catch (e) {
          obj = null;
        }
      }
      if (!obj || !obj.features) return [];
      return obj.features.map((f) => ({
        getGeometry: () => ({
          getCoordinates: () => f.geometry && f.geometry.coordinates,
        }),
      }));
    },
  }));
});

// Mock KML format for tests
jest.mock("ol/format/KML", () => {
  return jest.fn().mockImplementation(() => ({
    readFeatures: (input, options) => {
      // small stub: return empty array for tests
      return [];
    },
  }));
});
