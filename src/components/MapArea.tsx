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
    </div>
  );
}

export default MapComponent;
