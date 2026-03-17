import React from "react";
import PropTypes from "prop-types";

const ProjectionControls = ({
  sourceEPSG,
  setSourceEPSG,
  projCode,
  setProjCode,
  projDef,
  setProjDef,
  setProjRegistered,
  addToast,
}) => {
  return (
    <div className="card projection-card">
      <label className="proj-label">Source projection:</label>
      <select
        value={sourceEPSG}
        onChange={(e) => setSourceEPSG(e.target.value)}
      >
        <option value="detect">Detect (default)</option>
        <option value="EPSG:4326">EPSG:4326 (lon/lat)</option>
        <option value="map">Map projection</option>
      </select>

      <div style={{ marginTop: 6 }}>
        <label className="proj-label">
          Register custom proj4 definition (optional):
        </label>
        <div className="proj-inputs">
          <input
            placeholder="EPSG:xxxx"
            value={projCode}
            onChange={(e) => setProjCode(e.target.value)}
            className="proj-code"
          />
          <input
            placeholder="proj4 def string"
            value={projDef}
            onChange={(e) => setProjDef(e.target.value)}
            className="proj-def"
          />
          <button
            type="button"
            onClick={async () => {
              if (!projCode || !projDef) {
                if (addToast)
                  addToast("Provide both code and proj4 definition");
                return;
              }
              try {
                const proj4 = (await import("proj4")).default;
                const proj4ol = await import("ol/proj/proj4");
                proj4.defs(projCode, projDef);
                proj4ol.register(proj4);
                setProjRegistered(true);
                if (addToast) addToast(`Registered ${projCode}`);
              } catch (e) {
                console.error("proj4 register failed", e);
                if (addToast) addToast("Failed to register proj4 def");
              }
            }}
            className="proj-btn"
          >
            Register
          </button>
          <button
            type="button"
            onClick={async () => {
              let code = projCode;
              if (!code) {
                if (addToast) addToast("Enter EPSG code to fetch");
                return;
              }
              if (!code.toUpperCase().startsWith("EPSG:"))
                code = "EPSG:" + code;
              const numeric = code.split(":")[1];
              try {
                const url = `https://epsg.io/${numeric}.proj4`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Not found");
                const text = await res.text();
                setProjDef(text.trim());
                setProjCode(code);
                if (addToast) addToast(`Fetched proj4 for ${code}`);
              } catch (e) {
                console.error("EPSG fetch failed", e);
                if (addToast) addToast("Failed to fetch proj4 from epsg.io");
              }
            }}
            className="proj-btn"
          >
            Fetch
          </button>
        </div>
      </div>
    </div>
  );
};

ProjectionControls.propTypes = {
  sourceEPSG: PropTypes.string,
  setSourceEPSG: PropTypes.func,
  projCode: PropTypes.string,
  setProjCode: PropTypes.func,
  projDef: PropTypes.string,
  setProjDef: PropTypes.func,
  setProjRegistered: PropTypes.func,
  addToast: PropTypes.func,
};

export default ProjectionControls;
