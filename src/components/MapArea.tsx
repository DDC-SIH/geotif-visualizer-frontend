/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import { defaultMapConfig } from "../constants/consts";
import { useGeoData } from "../contexts/GeoDataProvider";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { addDragBoxInteraction } from "@/lib/dragBoxInteraction";
import { buffer } from 'ol/extent';

// Import our new components
import { CoordinateDisplay } from "./MapTools/CoordinateDisplay";
import { MapControls } from "./MapTools/MapControls";
import { SearchPanel } from "./MapTools/SearchPanel";

// Declare the map on the window for global access
declare global {
  interface Window {
    map: Map | null;
  }
}

function MapComponent() {
  const { layersRef, setBBOX } = useGeoData();
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);
  const [mousePosition, setMousePosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCoords, setShowCoords] = useState(true);
  const [searchMode, setSearchMode] = useState<'coordinates' | 'location'>('location');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
      layers: [],
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

  // Function to fit view to a location
  const fitToLocation = (lon: number, lat: number, zoomLevel?: number) => {
    if (!mapInstance.current) return;

    // Create a buffer around the point (larger for lower zoom levels)
    const bufferSize = zoomLevel ? 0.05 / zoomLevel : 0.1;

    // Create a bounding box around the point
    const extent = [
      lon - bufferSize,
      lat - bufferSize,
      lon + bufferSize,
      lat + bufferSize
    ];

    // Transform from WGS 84 to the map's projection
    const transformedExtent = transformExtent(
      extent,
      'EPSG:4326',
      mapInstance.current.getView().getProjection()
    );

    // Apply buffer for better visual appearance
    const bufferedExtent = buffer(transformedExtent, 100);

    // Fit the map to the extent
    mapInstance.current.getView().fit(bufferedExtent, {
      padding: [50, 50, 50, 50],
      duration: 1000,
      maxZoom: zoomLevel || 16 // Limit maximum zoom
    });
  };

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !mapInstance.current) return;

    if (searchMode === 'coordinates') {
      // Coordinates search logic with dynamic zoom
      try {
        const coords = searchQuery.split(',').map(coord => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          fitToLocation(coords[0], coords[1], 12);
          setSearchResults([]);
        } else {
          alert("Please enter valid coordinates in format: longitude, latitude");
        }
      } catch (error) {
        console.error("Search error:", error);
        alert("Invalid coordinates format. Use: longitude, latitude");
      }
    } else {
      // Location search using Nominatim with dynamic zoom
      try {
        setIsSearching(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&bounded=1&viewbox=-180,-90,180,90`
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setSearchResults(data);
        setIsSearching(false);

        // If we have results, fit the map to the first one
        if (data.length > 0) {
          const firstResult = data[0];

          if (firstResult.boundingbox) {
            // Nominatim returns bounding box as [south, north, west, east]
            // Calculate a zoom level based on the size of the bounding box
            const south = parseFloat(firstResult.boundingbox[0]);
            const north = parseFloat(firstResult.boundingbox[1]);
            const west = parseFloat(firstResult.boundingbox[2]);
            const east = parseFloat(firstResult.boundingbox[3]);

            // Create the extent and transform it
            const extent = transformExtent(
              [west, south, east, north],
              'EPSG:4326',
              mapInstance.current.getView().getProjection()
            );

            // Fit the map to the bounding box
            mapInstance.current.getView().fit(extent, {
              padding: [50, 50, 50, 50],
              duration: 1000
            });
          } else {
            // If no bounding box, fall back to our point-based approach
            fitToLocation(parseFloat(firstResult.lon), parseFloat(firstResult.lat), 12);
          }
        } else {
          alert("No locations found. Try a different search term.");
        }
      } catch (error) {
        console.error("Location search error:", error);
        setIsSearching(false);
        alert("Error searching for location. Please try again.");
      }
    }
  };

  // Handle clicking on a search result with dynamic zoom
  const handleResultClick = (result: any) => {
    if (mapInstance.current) {
      if (result.boundingbox) {
        // Get the bounding box
        const south = parseFloat(result.boundingbox[0]);
        const north = parseFloat(result.boundingbox[1]);
        const west = parseFloat(result.boundingbox[2]);
        const east = parseFloat(result.boundingbox[3]);

        // Transform the extent
        const extent = transformExtent(
          [west, south, east, north],
          'EPSG:4326',
          mapInstance.current.getView().getProjection()
        );

        // Fit the map to the bounding box
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
      } else {
        // No bounding box available, use point-based approach
        fitToLocation(parseFloat(result.lon), parseFloat(result.lat), 14);
      }

      // Clear results after selection
      setSearchResults([]);
    }
  };

  return (
    <div
      className="h-screen w-full relative"
      id="map"
      ref={mapRef}
    >
      {/* Coordinate Display Component */}
      <CoordinateDisplay
        mousePosition={mousePosition}
        showCoords={showCoords}
        setShowCoords={setShowCoords}
      />

      {/* Map Controls Component */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onToggleSearch={() => setShowSearch(!showSearch)}
      />

      {/* Search Panel Component */}
      {showSearch && (
        <SearchPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          isSearching={isSearching}
          searchResults={searchResults}
          onSearch={handleSearch}
          onResultClick={handleResultClick}
        />
      )}
    </div>
  );
}

export default MapComponent;
