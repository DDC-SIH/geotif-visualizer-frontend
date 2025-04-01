import { useEffect, useRef, useState } from "react";
import GeoJSON from "ol/format/GeoJSON.js";
import "ol/ol.css"; // OpenLayers CSS
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import colormap from "colormap";
import {
  get as getProjection,
  getTransform,
  fromLonLat,
  toLonLat,
  transform,
} from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { defaults as defaultControls, ZoomToExtent } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import { DragBox, Draw, Modify, Snap } from "ol/interaction";
import { platformModifierKeyOnly } from "ol/events/condition";
import MapSideBar from "./Sidebar/MapSideBar";
import { citiesData, IndiaJSON, level1IndiaJSON } from "@/../constants/consts";
import { mapSources } from "@/utils/mapSourcces";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { useAppContext } from "../../contexts/AppContext";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import ImageTile from "ol/source/ImageTile.js";
import { Raster } from "ol/source.js";
import { Image as ImageLayer } from "ol/layer.js";
import * as shapefile from "shapefile"; // Import the shapefile library
import { MultiPolygon } from "ol/geom";

const GeoTIFFMap = () => {
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [basemapCoordinates, setBasemapCoordinates] = useState(false);
  const [showIndianBorders, setShowIndianBorders] = useState(true);
  const [Coords, setCoords] = useState({ x: 0, y: 0 });
  const [BasemapCoords, setBasemapCoords] = useState({ x: 0, y: 0 });
  const {
    setBoundingBox,
    tiffUrls,
    renderArray,
    selectedPolygon,
    setSelectedPolygon,
    isPolygonSelectionEnabled,
    setIsPolygonSelectionEnabled,
    selectedIndex,
    setSelectedIndex,
    setRenderArray,
    colormapSettings,
    setColormapSettings,
  } = useGeoData();
  const { isLoggedIn } = useAppContext();

  const mapRef = useRef<HTMLDivElement>(null); // Reference to the map container
  const mapInstanceRef = useRef<Map | null>(null); // New ref for map instance
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [tiffLayer, setTiffLayer] = useState<TileLayer | null>(null);
  const [basemapLayer, setBasemapLayer] = useState<any>(mapSources[1].layer);
  const [selectedColormap, setSelectedColormap] = useState("viridis");
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [polygonLayer, setPolygonLayer] = useState<VectorLayer | null>(null);
  const [snapInteraction, setSnapInteraction] = useState<Snap | null>(null);

  // Create a dedicated vector layer for drawn features
  function shade(inputs, data) {
    const elevationImage = inputs[0];
    const width = elevationImage.width;
    const height = elevationImage.height;
    const elevationData = elevationImage.data;
    const shadeData = new Uint8ClampedArray(elevationData.length);
    const dp = data.resolution * 2;
    const maxX = width - 1;
    const maxY = height - 1;
    const pixel = [0, 0, 0, 0];
    const twoPi = 2 * Math.PI;
    const halfPi = Math.PI / 2;
    const sunEl = (Math.PI * data.sunEl) / 180;
    const sunAz = (Math.PI * data.sunAz) / 180;
    const cosSunEl = Math.cos(sunEl);
    const sinSunEl = Math.sin(sunEl);
    let pixelX,
      pixelY,
      x0,
      x1,
      y0,
      y1,
      offset,
      z0,
      z1,
      dzdx,
      dzdy,
      slope,
      aspect,
      cosIncidence,
      scaled;
    function calculateElevation(pixel) {
      // The method used to extract elevations from the DEM.
      // In this case the format used is Terrarium
      // red * 256 + green + blue / 256 - 32768
      //
      // Other frequently used methods include the Mapbox format
      // (red * 256 * 256 + green * 256 + blue) * 0.1 - 10000
      //
      return pixel[0] * 256 + pixel[1] + pixel[2] / 256 - 32768;
    }
    for (pixelY = 0; pixelY <= maxY; ++pixelY) {
      y0 = pixelY === 0 ? 0 : pixelY - 1;
      y1 = pixelY === maxY ? maxY : pixelY + 1;
      for (pixelX = 0; pixelX <= maxX; ++pixelX) {
        x0 = pixelX === 0 ? 0 : pixelX - 1;
        x1 = pixelX === maxX ? maxX : pixelX + 1;

        // determine elevation for (x0, pixelY)
        offset = (pixelY * width + x0) * 4;
        pixel[0] = elevationData[offset];
        pixel[1] = elevationData[offset + 1];
        pixel[2] = elevationData[offset + 2];
        pixel[3] = elevationData[offset + 3];
        z0 = data.vert * calculateElevation(pixel);

        // determine elevation for (x1, pixelY)
        offset = (pixelY * width + x1) * 4;
        pixel[0] = elevationData[offset];
        pixel[1] = elevationData[offset + 1];
        pixel[2] = elevationData[offset + 2];
        pixel[3] = elevationData[offset + 3];
        z1 = data.vert * calculateElevation(pixel);

        dzdx = (z1 - z0) / dp;

        // determine elevation for (pixelX, y0)
        offset = (y0 * width + pixelX) * 4;
        pixel[0] = elevationData[offset];
        pixel[1] = elevationData[offset + 1];
        pixel[2] = elevationData[offset + 2];
        pixel[3] = elevationData[offset + 3];
        z0 = data.vert * calculateElevation(pixel);

        // determine elevation for (pixelX, y1)
        offset = (y1 * width + pixelX) * 4;
        pixel[0] = elevationData[offset];
        pixel[1] = elevationData[offset + 1];
        pixel[2] = elevationData[offset + 2];
        pixel[3] = elevationData[offset + 3];
        z1 = data.vert * calculateElevation(pixel);

        dzdy = (z1 - z0) / dp;

        slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));

        aspect = Math.atan2(dzdy, -dzdx);
        if (aspect < 0) {
          aspect = halfPi - aspect;
        } else if (aspect > halfPi) {
          aspect = twoPi - aspect + halfPi;
        } else {
          aspect = halfPi - aspect;
        }

        cosIncidence =
          sinSunEl * Math.cos(slope) +
          cosSunEl * Math.sin(slope) * Math.cos(sunAz - aspect);

        offset = (pixelY * width + pixelX) * 4;
        scaled = 255 * cosIncidence;
        shadeData[offset] = scaled;
        shadeData[offset + 1] = scaled;
        shadeData[offset + 2] = scaled;
        shadeData[offset + 3] = elevationData[offset + 3];
      }
    }

    return { data: shadeData, width: width, height: height };
  }
  const drawVector = new VectorLayer({
    source: new VectorSource(),
    style: {
      "stroke-color": "rgba(100, 255, 0, 1)",
      "stroke-width": 2,
      "fill-color": "rgba(100, 255, 0, 0.3)",
    },
  });

  function getColorStops(
    name: string,
    min: number,
    max: number,
    steps: number,
    reverse: boolean,
    alpha: number,
    brightness: number,
    contrast: number,
    saturation: number,
    exposure: number,
    hueshift: number
  ) {
    if (name === "none") {
      return [];
    }
    const delta = (max - min) / (steps - 1);
    const stops = new Array(steps * 2);
    let colors = colormap({
      colormap: name,
      nshades: steps,
      format: "rgba",
      alpha: alpha,
    });

    if (reverse) {
      colors.reverse();
    }

    // Apply brightness, contrast, saturation, and exposure adjustments
    colors = colors.map((color) => {
      const [r, g, b, a] = color;
      const adjustedColor = adjustColor(
        [r, g, b],
        brightness,
        contrast,
        saturation,
        exposure,
        hueshift
      );
      return [adjustedColor[0], adjustedColor[1], adjustedColor[2], a];
    });

    // Add initial transparent stop for values below min
    stops[0] = min;
    stops[1] = "rgba(0,0,0,0)";

    // Add color stops within the min-max range
    for (let i = 1; i < steps; i++) {
      const value = min + i * delta;
      if (value >= colormapSettings.min && value <= colormapSettings.max) {
        stops[i * 2] = value;
        stops[i * 2 + 1] = colors[i];
      } else {
        stops[i * 2] = value;
        stops[i * 2 + 1] = "rgba(0,0,0,0)";
      }
    }

    // Add final transparent stop for values above max
    stops[steps * 2 - 2] = max;
    stops[steps * 2 - 1] = "rgba(0,0,0,0)";

    return stops;
  }

  function adjustColor(
    [r, g, b]: number[],
    brightness: number,
    contrast: number,
    saturation: number,
    exposure: number,
    hueShift: number
  ): number[] {
    // Apply brightness
    r = r + brightness * 255;
    g = g + brightness * 255;
    b = b + brightness * 255;

    // Apply contrast
    r = (r - 128) * contrast * 2 + 128;
    g = (g - 128) * contrast * 2 + 128;
    b = (b - 128) * contrast * 2 + 128;

    // Apply saturation
    const gray = 0.3 * r + 0.59 * g + 0.11 * b;
    r = gray + (r - gray) * saturation * 1.33;
    g = gray + (g - gray) * saturation * 1.33;
    b = gray + (b - gray) * saturation * 1.33;

    // Apply exposure
    r = r * Math.pow(1.33, exposure);
    g = g * Math.pow(1.33, exposure);
    b = b * Math.pow(1.33, exposure);

    // Apply hue shift
    [r, g, b] = applyHueShift(r, g, b, hueShift);

    // Clamp values to [0, 255]
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return [r, g, b];
  }

  function applyHueShift(
    r: number,
    g: number,
    b: number,
    hueShift: number
  ): number[] {
    const u = Math.cos((hueShift * Math.PI) / 180);
    const w = Math.sin((hueShift * Math.PI) / 180);

    const newR = 0.299 + 0.701 * u + 0.168 * w;
    const newG = 0.587 - 0.587 * u + 0.33 * w;
    const newB = 0.114 - 0.114 * u - 0.497 * w;

    return [
      r * newR + g * newG + b * newB,
      r * newG + g * newR + b * newB,
      r * newB + g * newG + b * newR,
    ];
  }

  // const cropToExtent = (bbox: number[]) => {
  //   if (!tiffLayer || !mapInstanceRef.current) return;

  //   // Convert bbox coordinates to map projection
  //   const [minLon, minLat, maxLon, maxLat] = bbox;
  //   const extent = [
  //     fromLonLat([minLon, minLat]),
  //     fromLonLat([maxLon, maxLat]),
  //   ].flat();

  //   // Set the crop extent on the layer
  //   tiffLayer.setExtent(extent);

  //   // Animate view to the new extent
  //   mapInstanceRef.current.getView().fit(extent, {
  //     duration: 1000,
  //     padding: [50, 50, 50, 50],
  //   });
  // };

  // const cropToStateExtent = (stateName: string) => {
  //   if (!tiffLayer || !mapInstanceRef.current) return;

  //   // Parse the GeoJSON
  //   const geojsonFormat = new GeoJSON();
  //   const features = geojsonFormat.readFeatures(level1IndiaJSON, {
  //     featureProjection: "EPSG:3857", // Adjust projection to match your map's projection
  //   });

  //   // Find the state by name
  //   const feature = features.find(
  //     (f) =>
  //       f.get("NAME_1").toLowerCase() === stateName.toLowerCase() ||
  //       (f.get("VARNAME_1") &&
  //         f.get("VARNAME_1").toLowerCase().includes(stateName.toLowerCase()))
  //   );

  //   if (!feature) {
  //     alert("State not found");
  //     return;
  //   }

  //   // Get the geometry of the found feature
  //   const geometry = feature.getGeometry();

  //   if (!geometry) {
  //     console.error("No geometry found for the feature");
  //     return;
  //   }

  //   // Calculate the extent of the geometry
  //   const stateExtent = geometry.getExtent();

  //   // Set the crop extent on the layer
  //   tiffLayer.setExtent(stateExtent);

  //   // Animate view to the new extent
  //   mapInstanceRef.current.getView().fit(stateExtent, {
  //     duration: 1000,
  //     padding: [50, 50, 50, 50],
  //   });
  // };

  const cropToGeoJSONExtent = () => {
    if (!tiffLayer || !mapInstanceRef.current) return;

    // Parse the GeoJSON
    const geojsonFormat = new GeoJSON();
    const features = geojsonFormat.readFeatures(IndiaJSON, {
      featureProjection: "EPSG:3857", // Adjust projection to match your map's projection
    });

    if (features.length === 0) {
      console.error("No features found in GeoJSON");
      return;
    }

    // Get the geometry from the first feature
    const geometry = features[0].getGeometry();

    if (!geometry) {
      console.error("No geometry found in the feature");
      return;
    }

    // Calculate the extent of the geometry
    const indiaExtent = geometry.getExtent();

    // Set the crop extent on the layer
    tiffLayer.setExtent(indiaExtent);

    // Animate view to the new extent
    mapInstanceRef.current.getView().fit(indiaExtent, {
      duration: 1000,
      padding: [50, 50, 50, 50],
    });
  };

  let borderMaskLayer: VectorLayer | null = null;

  const cropToStateBorders = (stateName: string) => {
    if (!mapInstanceRef.current) return;

    // Remove existing mask layer
    if (borderMaskLayer) {
      mapInstanceRef.current.removeLayer(borderMaskLayer);
      borderMaskLayer = null;
    }

    // Parse the GeoJSON
    const geojsonFormat = new GeoJSON();
    const features = geojsonFormat.readFeatures(level1IndiaJSON, {
      featureProjection: "EPSG:3857", // Adjust to your map projection
    });

    // Find the feature for the state
    const feature = features.find(
      (f) =>
        f.get("NAME_1").toLowerCase() === stateName.toLowerCase() ||
        (f.get("VARNAME_1") &&
          f.get("VARNAME_1").toLowerCase().includes(stateName.toLowerCase()))
    );

    if (!feature) {
      alert("State not found");
      return;
    }

    // Create a vector source and layer for the mask
    const vectorSource = new VectorSource({
      features: [feature],
    });

    borderMaskLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.4)",
        }),
      }),
    });

    // Add the mask layer to the map
    mapInstanceRef.current.addLayer(borderMaskLayer);

    // Fit the map view to the state's geometry
    const geometry = feature.getGeometry();
    if (geometry) {
      mapInstanceRef.current.getView().fit(geometry.getExtent(), {
        duration: 1000,
        padding: [50, 50, 50, 50],
      });
    }
  };
  const search = (query: string) => {
    if (query.replace(" ", "").toLowerCase() === "india") {
      cropToGeoJSONExtent(); // National-level extent (reuse earlier code)
    } else {
      cropToStateBorders(query); // State-level extent
    }
  };

  const geojsonPath = "INDIAN_BORDER.json";

  // Load GeoJSON and style the boundary
  const IndiaVectorSource = new VectorSource({
    url: geojsonPath,
    format: new GeoJSON(),
  });

  const vectorLayer = new VectorLayer({
    source: IndiaVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: "limegreen", // Green outline
        width: 2, // Outline width
      }),
    }),
  });

  const clipLayer = new VectorLayer({
    style: null,
    source: new VectorSource({
      url: "./india-osm.geojson",
      format: new GeoJSON(),
    }),
  });

  const updateColormap = () => {
    if (tiffLayer) {
      const { min, max } = getIndexMinMax(selectedIndex);
      if (selectedIndex !== "none") {
        tiffLayer.setStyle({
          color: [
            "case",
            [
              "all",
              [">", ["band", 1], 0],
              [">", ["band", 2], 0],
              [">", ["band", 3], 0],
            ],
            [
              "interpolate",
              ["linear"],
              getBandArithmeticExpression(selectedIndex),
              ...getColorStops(
                colormapSettings.type,
                min,
                max,
                colormapSettings.steps,
                colormapSettings.reverse,
                colormapSettings.alpha,
                colormapSettings.brightness,
                colormapSettings.contrast,
                colormapSettings.saturation,
                colormapSettings.exposure,
                colormapSettings.hueshift
              ),
            ],
            [0, 0, 0, 0],
          ],
        });
      } else {
        setSelectedIndex("none");
        tiffLayer.setStyle({});
      }
    }
  };

  useEffect(() => {
    updateColormap();
  }, [colormapSettings]);

  useEffect(() => {
    if (tiffLayer) {
      updateColormap();
    }
  }, [selectedIndex, tiffLayer]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getLayers().setAt(0, basemapLayer);
    }
  }, [basemapLayer]);

  useEffect(() => {
    if (tiffLayer) {
      updateColormap();
    }
  }, [selectedColormap, selectedIndex, tiffLayer, colormapSettings]);

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

  const addDragBoxInteraction = (map: Map) => {
    const dragBox = new DragBox({
      condition: platformModifierKeyOnly,
      className: "dragbox-style", // Add this line
    });

    dragBox.on("boxstart", () => {
      if (mapRef.current) {
        mapRef.current.style.cursor = "crosshair";
      }
    });

    dragBox.on("boxend", () => {
      if (mapRef.current) {
        mapRef.current.style.cursor = isModifierKeyPressed
          ? "crosshair"
          : "default";
      }

      const extent = dragBox.getGeometry().getExtent();
      const bottomLeft = transform(
        [extent[0], extent[1]],
        map.getView().getProjection(),
        "EPSG:4326"
      );
      const topRight = transform(
        [extent[2], [extent[3]]],
        map.getView().getProjection(),
        "EPSG:4326"
      );

      const bbox = [
        Number(bottomLeft[0].toFixed(4)),
        Number(bottomLeft[1].toFixed(4)),
        Number(topRight[0].toFixed(4)),
        Number(topRight[1].toFixed(4)),
      ];

      setBoundingBox(bbox);
    });

    map.addInteraction(dragBox);
  };

  const applyPolygonClipping = (polygon) => {
    if (!tiffLayer) return;

    const coordinates = polygon.getCoordinates()[0];
    const { min, max } = getIndexMinMax(selectedIndex);

    const expression = getBandArithmeticExpression(selectedIndex);
    tiffLayer.setStyle({
      color: [
        "interpolate",
        ["linear"],
        expression,
        ...getColorStops(
          colormapSettings.type,
          min,
          max,
          colormapSettings.steps,
          colormapSettings.reverse,
          colormapSettings.alpha,
          colormapSettings.brightness,
          colormapSettings.contrast,
          colormapSettings.saturation,
          colormapSettings.exposure,
          colormapSettings.hueshift
        ),
      ],
    });

    // Set the extent of the tiffLayer to the polygon's extent
    const extent = polygon.getExtent();
    tiffLayer.setExtent(extent);
  };

  const addPolygonInteraction = (map: Map) => {
    const source = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: "rgba(0, 255, 0, 0.2)",
        }),
        stroke: new Stroke({
          color: "#00ff00",
          width: 2,
        }),
      }),
    });
    if (!isPolygonSelectionEnabled) {
      map.removeLayer(vectorLayer);
      return;
    }

    map.addLayer(vectorLayer);
    setPolygonLayer(vectorLayer);

    const drawInteraction = new Draw({
      source: source,
      type: "Polygon",
      style: new Style({
        stroke: new Stroke({
          color: "rgba(255, 255, 100, 0.5)",
          width: 1.5,
        }),
        fill: new Fill({
          color: "rgba(255, 255, 100, 0.25)",
        }),
      }),
    });

    drawInteraction.on("drawend", (event) => {
      const polygon = event.feature.getGeometry();
      vectorLayer?.getSource().clear();
      vectorLayer?.getSource().addFeature(event.feature);

      applyPolygonClipping(polygon);

      // Transform the polygon to EPSG:4326 (longitude/latitude)
      const polygonClone = polygon.clone();
      polygonClone.transform(map.getView().getProjection(), "EPSG:4326");

      // Create GeoJSON with transformed coordinates
      const geojson = new GeoJSON().writeGeometryObject(polygonClone);
      setSelectedPolygon(geojson);
      map.removeInteraction(drawInteraction);
    });

    map.addInteraction(drawInteraction);
    setDraw(drawInteraction);
  };

  useEffect(() => {
    if (mapInstanceRef.current && isPolygonSelectionEnabled) {
      addPolygonInteraction(mapInstanceRef.current);
    } else if (mapInstanceRef.current && !isPolygonSelectionEnabled) {
      if (draw) {
        mapInstanceRef.current.removeInteraction(draw);
        setDraw(null);
      }
      if (snapInteraction) {
        mapInstanceRef.current.removeInteraction(snapInteraction);
        setSnapInteraction(null);
      }
      // Remove draw vector layer when disabling
      if (polygonLayer) {
        mapInstanceRef.current.removeLayer(polygonLayer);
        setPolygonLayer(null);
      }
    }
  }, [isPolygonSelectionEnabled, mapInstanceRef.current]);

  const getBandArithmeticExpression = (type: string) => {
    switch (type) {
      case "none":
        return ["band", 1]; // Just show band 1 data
      case "ndvi":
        return [
          "/",
          ["-", ["band", 2], ["band", 1]],
          ["+", ["band", 2], ["band", 1]],
        ];
      case "evi":
        return [
          "*",
          2.5,
          [
            "/",
            ["-", ["band", 3], ["band", 2]],
            [
              "+",
              ["band", 3],
              ["*", 6, ["band", 2]],
              ["*", 7.5, ["band", 1]],
              1,
            ],
          ],
        ];
      case "savi":
        return [
          "*",
          1.5,
          [
            "/",
            ["-", ["band", 2], ["band", 1]],
            ["+", ["band", 2], ["band", 1], 0.5],
          ],
        ];
      case "nbr":
        return [
          "/",
          ["-", ["band", 2], ["band", 1]],
          ["+", ["band", 2], ["band", 1]],
        ];
      case "msavi":
        return [
          "*",
          0.5,
          [
            "+",
            2,
            ["*", ["band", 3], 1],
            [
              "-",
              [
                "sqrt",
                [
                  "-",
                  ["*", ["*", 2, ["band", 3]], 1],
                  ["*", 8, ["-", ["band", 3], ["band", 2]]],
                ],
              ],
              1,
            ],
          ],
        ];
      case "ndwi":
        return [
          "/",
          ["-", ["band", 2], ["band", 3]],
          ["+", ["band", 2], ["band", 3]],
        ];
      case "hillshade":
        return ["*", 255, ["var", "hillshade"]];
      default:
        return ["band", 1];
    }
  };

  const getIndexMinMax = (type: string) => {
    switch (type) {
      case "none":
        return { min: 0, max: 255 }; // Typical range for raw image data
      case "ndvi":
      case "ndwi":
        return { min: -1, max: 1 };
      case "evi":
        return { min: -1, max: 1 };
      case "savi":
        return { min: -1.5, max: 1.5 };
      case "nbr":
        return { min: -1, max: 1 };
      case "msavi":
        return { min: -1, max: 1 };
      case "hillshade":
        return { min: 0, max: 255 };
      default:
        return { min: 0, max: 1 };
    }
  };

  const setupHillshade = (map: Map) => {
    const elevation = new ImageTile({
      url: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
      crossOrigin: "anonymous",
      maxZoom: 15,
    });

    const raster = new Raster({
      sources: [elevation],
      operationType: "image",
      operation: shade,
    });

    raster.on("beforeoperations", (event: any) => {
      event.data.resolution = event.resolution;
      event.data.vert = colormapSettings.verticalExaggeration;
      event.data.sunEl = colormapSettings.sunElevation;
      event.data.sunAz = colormapSettings.sunAzimuth;
    });

    const hillshadeLayer = new ImageLayer({
      opacity: 0.3,
      source: raster,
    });

    map.addLayer(hillshadeLayer);
    return hillshadeLayer;
  };

  const fetchGeoTIFF = async () => {
    // Remove existing tiffLayer if any
    if (tiffLayer) {
      mapInstanceRef.current?.removeLayer(tiffLayer);
    }
    
    // Create sources based on renderArray
    const sources = renderArray.map((layer) => ({
      url: tiffUrls[layer.key].url,
      bands: [1],
      min: (tiffUrls[layer.key].min.toFixed(3)),
      max: (tiffUrls[layer.key].max.toFixed(3)),
      nodata: 0,
    }));
    console.log(sources);
    const geoTIFFSource = new GeoTIFF({
      sources: sources,
    });

    const layer = new TileLayer({
      className: "tiff",
      source: geoTIFFSource,
    });

    setTiffLayer(layer);

    const openLayersMap = new Map({
      target: mapRef.current as HTMLElement,
      layers: [basemapLayer, layer], // Use the selected basemap layer
      controls: defaultControls({
        zoom: false, // Disable default zoom controls
      }).extend([
        new ZoomToExtent({
          extent: [
            68.1766,
            6.4627,
            97.4026,
            35.5175, // India's extent
          ],
        }),
      ]),
      interactions: defaultInteractions({
        pinchRotate: false,
        doubleClickZoom: true,
        mouseWheelZoom: true,
      }),
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // India center coordinates
        zoom: 2,
        maxZoom: 19,
        minZoom: 2,
      }),
    });

    
    if (showIndianBorders) {
      openLayersMap.addLayer(vectorLayer);
    }


    // Animate the zoom transition from 2 to 4
    openLayersMap.getView().animate({
      zoom: 4,
      duration: 2000, // Duration of the zoom animation (in milliseconds)
    });

    mapInstanceRef.current = openLayersMap;
    addDragBoxInteraction(openLayersMap);
    addPolygonInteraction(openLayersMap);
    // Apply initial colormap
    updateColormap();

    if (selectedIndex === "hillshade") {
      const hillshadeLayer = setupHillshade(openLayersMap);
      setTiffLayer(hillshadeLayer as any);
    } else {
      // ...existing TIFF layer creation code...
    }
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      fetchGeoTIFF();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [renderArray,showIndianBorders]);


  const downloadPolygon = () => {
    if (!selectedPolygon) {
      alert("No polygon selected");
      return;
    }

    const blob = new Blob([JSON.stringify(selectedPolygon)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "polygon.geojson";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update useEffect to attach and detach the pointermove event
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const logCoordinates = (event: any) => {
      if (!showCoordinates) return;
      const coordinate = event.coordinate;
      setBasemapCoords({ x: coordinate[0], y: coordinate[1] });
      console.log("Coordinates:", coordinate);
    };

    map.on("pointermove", logCoordinates);

    // Cleanup event listener
    return () => {
      map.un("pointermove", logCoordinates);
    };
  }, [showCoordinates]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const handleMapClick = (event: any) => {
        if (basemapCoordinates) {
          const clickedCoords = event.coordinate;
          const lonLat = toLonLat(clickedCoords);
          console.log("Basemap Coordinates:", {
            lon: lonLat[0],
            lat: lonLat[1],
          });
          setCoords({ x: lonLat[0], y: lonLat[1] });
        }
      };

      map.on("pointermove", handleMapClick);

      return () => {
        map.un("pointermove", handleMapClick);
      };
    }
  }, [basemapCoordinates]);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <style>
        {`
            html,
            body {
              overscroll-behavior-y: none;
              touch-action: none;
            }
            .dragbox-style {
                border: 2px solid #1a73e8;
                background-color: rgba(26, 115, 232, 0.2);
            }
            `}
      </style>

      {/* UI Layer */}

      <div className="absolute inset-0 pointer-events-none">
        {/* Sidebar */}
        <MapSideBar
          setColormapSettings={setColormapSettings}
          colormapSettings={colormapSettings}
          setBasemapLayer={setBasemapLayer}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setShowCoordinates={setShowCoordinates}
          showCoordinates={showCoordinates}
          basemapCoordinates={basemapCoordinates}
          setBasemapCoordinates={setBasemapCoordinates}
          showIndianBorders={showIndianBorders}
          setShowIndianBorders={setShowIndianBorders}
        />

        {/* Search Bar and Controls Container */}
        <div className="fixed right-4 bottom-4 flex gap-2 items-end pointer-events-auto z-50 flex-col justify-end">
          <div className="flex flex-col">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none h-9 bg-white"
              onClick={() =>
                mapInstanceRef.current
                  ?.getView()
                  .setZoom(mapInstanceRef.current.getView().getZoom()! + 1)
              }
            >
              <span className="text-lg">+</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none h-9 bg-white"
              onClick={() =>
                mapInstanceRef.current
                  ?.getView()
                  .setZoom(mapInstanceRef.current.getView().getZoom()! - 1)
              }
            >
              <span className="text-lg">−</span>
            </Button>
          </div>
          <div className="flex items-center bg-white shadow-lg overflow-hidden">
            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                isSearchOpen ? "w-[200px] opacity-100" : "w-0 opacity-0 hidden"
              )}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="h-9 border-none bg-transparent px-2 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    search(searchQuery.replace(" ", ""));
                  }
                }}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none h-9"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {(basemapCoordinates || showCoordinates) && (
        <div className="fixed top-2 right-2 rounded-lg p-3 z-[1000] bg-white">
          {basemapCoordinates && (
            <p>
              <span className="font-bold">Location Coordinates: </span>{" "}
              <span>{`${Coords.x.toFixed(3)}, ${Coords.y.toFixed(3)}`}</span>
            </p>
          )}
          {showCoordinates && (
            <p>
              <span className="font-bold">Basemap Coordinates: </span>{" "}
              <span>{`${BasemapCoords.x.toFixed(3)}, ${BasemapCoords.y.toFixed(
                3
              )}`}</span>
            </p>
          )}
        </div>
      )}

      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default GeoTIFFMap;
