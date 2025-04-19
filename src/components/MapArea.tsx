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
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { addDragBoxInteraction } from "@/lib/dragBoxInteraction";
import { Search, ZoomIn, ZoomOut, Maximize, MapPin, Navigation, Eye, EyeOff } from "lucide-react";
import { buffer } from 'ol/extent';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

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
      {/* Coordinate Display with Toggle */}
      {mousePosition && showCoords && (
        <div
          className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur-sm p-2 rounded-md text-sm font-mono text-primary-foreground z-[1001] flex items-center gap-2 border border-neutral-800"
        >
          <span>Lon: {mousePosition[0]}, Lat: {mousePosition[1]}</span>
          <Button
            
            size="icon"
            className="h-6 w-6 p-1 text-neutral-400 hover:text-white"
            onClick={() => setShowCoords(false)}
          >
            <EyeOff size={14} />
          </Button>
        </div>
      )}

      {!showCoords && (
        <Button
          className="absolute top-4 right-4 z-[1001] bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
          size="sm"
          
          onClick={() => setShowCoords(true)}
        >
          <Eye size={14} className="mr-1" /> Show Coordinates
        </Button>
      )}

      {/* Map Control Buttons */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-[1000]">
        <Button
          onClick={handleZoomIn}
          className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
          title="Zoom In"
          variant="outline"
        >
          <ZoomIn size={18} className="text-white" />
        </Button>

        <Button
          onClick={handleZoomOut}
          className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
          title="Zoom Out"
          variant="outline"
        >
          <ZoomOut size={18} className="text-white" />
        </Button>

        <Button
          onClick={handleFitView}
          className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
          title="Fit to Default View"
          variant="outline"
        >
          <Maximize size={16} className="text-white" />
        </Button>

        <Button
          onClick={() => setShowSearch(!showSearch)}
          className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
          title="Search"
          variant="outline"
        >
          <Search size={16} className="text-white" />
        </Button>
      </div>

      {/* Search Input - Moved to top right */}
      {showSearch && (
        <div className="absolute top-16 right-5 z-[1001] bg-neutral-900/80 backdrop-blur-sm p-3 rounded-md border border-neutral-800 w-80">
          <div className="flex mb-2">
            <Button
              onClick={() => setSearchMode('location')}
              className={cn(
                "flex-1 gap-1 rounded-r-none",
                searchMode === 'location'
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-neutral-800 hover:bg-neutral-700 text-white"
              )}
              size="sm"
            >
              <MapPin size={14} /> Location
            </Button>
            <Button
              onClick={() => setSearchMode('coordinates')}
              className={cn(
                "flex-1 gap-1 rounded-l-none",
                searchMode === 'coordinates'
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-neutral-800 hover:bg-neutral-700 text-white"
              )}
              size="sm"
            >
              <Navigation size={14} /> Coordinates
            </Button>
          </div>

          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchMode === 'coordinates'
                ? "Enter coordinates (lon, lat)"
                : "Search for a location..."}
              className="rounded-r-none bg-neutral-800 text-white border-neutral-700 focus:border-primary"
            />
            <Button
              type="submit"
              disabled={isSearching}
              className={cn(
                "rounded-l-none",
                isSearching ? "opacity-50" : ""
              )}
            >
              {isSearching ? "..." : "Go"}
            </Button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-[200px] overflow-y-auto custom-scrollbar border border-neutral-700 rounded-md">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "p-2 cursor-pointer hover:bg-neutral-700/70 bg-neutral-800/70",
                    index < searchResults.length - 1 ? "border-b border-neutral-700" : ""
                  )}
                >
                  <div className="font-medium text-primary-foreground">{result.display_name.split(',')[0]}</div>
                  <div className="text-xs text-neutral-400 truncate">
                    {result.display_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MapComponent;
