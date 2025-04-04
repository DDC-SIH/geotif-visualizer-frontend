/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import {
  defaultMapConfig,
} from "../constants/consts";
import { useGeoData } from "../contexts/GeoDataProvider";
import { fromLonLat, toLonLat } from "ol/proj";
import { addDragBoxInteraction } from "@/lib/dragBoxInteraction";
import { FiZoomIn, FiZoomOut, FiMaximize, FiSearch } from "react-icons/fi";

// Declare the map on the window for global access
declare global {
  interface Window {
    map: Map | null;
  }
}

function MapComponent() {
  const {
    layersRef,
    setBBOX,
  } = useGeoData();
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);
  const [mousePosition, setMousePosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);

  // Set up key event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsModifierKeyPressed(true);
        if (mapRef.current) {
          mapRef.current.style.cursor = "crosshair";
        }
      }
    };

    const handleKeyUp = () => {
      setIsModifierKeyPressed(false);
      if (mapRef.current) {
        mapRef.current.style.cursor = "default";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create the map instance
    const map = new Map({
      target: mapRef.current,
      layers: [
        // basemapLayer // Base OSM layer
      ],
      view: new View({
        zoom: defaultMapConfig.zoom,
        center: fromLonLat(defaultMapConfig.center),
        maxZoom: defaultMapConfig.maxzoom,
        minZoom: defaultMapConfig.minzoom,
      }),
    });

    // Store map instance
    mapInstance.current = map;
    window.map = map;

    // Add drag box interaction
    addDragBoxInteraction(map, mapRef, isModifierKeyPressed, setBBOX);

    // Add existing layers from context
    if (layersRef.current.length > 0) {
      layersRef.current.forEach(layer => {
        map.addLayer(layer);
      });
    }

    // Track mouse movement for coordinate display
    map.on('pointermove', (evt) => {
      const lonLat = toLonLat(evt.coordinate);
      setMousePosition([parseFloat(lonLat[0].toFixed(6)), parseFloat(lonLat[1].toFixed(6))]);
    });

    // Clear coordinates when mouse leaves the map
    map.getViewport().addEventListener('mouseout', () => {
      setMousePosition(null);
    });

    // Animate view
    map.getView().animate({
      zoom: defaultMapConfig.animateZoom,
      duration: defaultMapConfig.animateZoomDuration,
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
        window.map = null;
      }
    };
  }, []);

  // Handle zoom in
  const handleZoomIn = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      const currentZoom = view.getZoom() || 0;
      view.animate({
        zoom: currentZoom + 1,
        duration: 250
      });
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      const currentZoom = view.getZoom() || 0;
      view.animate({
        zoom: currentZoom - 1,
        duration: 250
      });
    }
  };

  // Handle fit to default view
  const handleFitView = () => {
    if (mapInstance.current) {
      mapInstance.current.getView().animate({
        center: fromLonLat(defaultMapConfig.center),
        zoom: defaultMapConfig.animateZoom,
        duration: defaultMapConfig.animateZoomDuration,
      });
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery && mapInstance.current) {
      // This is a simple example - in a real app, you'd want to use a geocoding service
      try {
        const coords = searchQuery.split(',').map(coord => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          mapInstance.current.getView().animate({
            center: fromLonLat([coords[0], coords[1]]),
            zoom: 12,
            duration: 1000
          });
        } else {
          alert("Please enter valid coordinates in format: longitude, latitude");
        }
      } catch (error) {
        console.error("Search error:", error);
        alert("Invalid coordinates format. Use: longitude, latitude");
      }
    }
  };

  return (
    <div
      style={{ height: "100vh", width: "100%", position: "relative" }}
      id="map"
      ref={mapRef}
      className="map-container top-0 left-0"
    >
      {mousePosition && (
        <div
          className="coordinate-display"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255, 255, 255, 0.8)",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "14px",
            fontFamily: "monospace",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          Lon: {mousePosition[0]}, Lat: {mousePosition[1]}
        </div>
      )}

      {/* Map Control Buttons */}
      <div
        className="map-controls"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
          title="Zoom In"
        >
          <FiZoomIn size={20} />
        </button>

        <button
          onClick={handleZoomOut}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
          title="Zoom Out"
        >
          <FiZoomOut size={20} />
        </button>

        <button
          onClick={handleFitView}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
          title="Fit to Default View"
        >
          <FiMaximize size={18} />
        </button>

        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
          title="Search Coordinates"
        >
          <FiSearch size={18} />
        </button>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            zIndex: 1000,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter coordinates (lon, lat)"
              style={{
                padding: "8px 12px",
                borderRadius: "4px 0 0 4px",
                border: "1px solid #ccc",
                width: "200px"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "0 4px 4px 0",
                cursor: "pointer"
              }}
            >
              Go
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MapComponent;
