import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ColorMap,
  FileFormat,
  GeoJSON,
  GeoJSONError,
} from "../../types/geojson.ts";
import {
  BANDS_MASTER,
  basemap,
  baseMaps,
  GeoJSONEndpoint,
  GET_TITILER_URL,
  Layers,
  SELECTED_LAYERS,
} from "../constants/consts.ts";
import TileLayer from "ol/layer/Tile";
import { ImageTile, TileImage, TileWMS } from "ol/source";

interface GeoDataContextType {
  geoData: GeoJSON | GeoJSONError | null;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  reqInfo: RequestInfo;
  setReqInfo: React.Dispatch<React.SetStateAction<RequestInfo>>;
  selectedBasemap: basemap;
  setSelectedBasemap: React.Dispatch<React.SetStateAction<basemap>>;
  shapeActive: boolean;
  setShapeActive: React.Dispatch<React.SetStateAction<boolean>>;
  layerTransparency: layerTransparency;
  setLayerTransparency: React.Dispatch<React.SetStateAction<layerTransparency>>;
  mode: mode;
  setMode: React.Dispatch<React.SetStateAction<mode>>;
  bandExpression: string;
  setBandExpression: React.Dispatch<React.SetStateAction<string>>;
  bbox: bbox;
  setBBOX: React.Dispatch<React.SetStateAction<bbox>>;
  Layers: Layers[] | null;
  setLayers: React.Dispatch<React.SetStateAction<Layers[] | null>>;
  updateLayer: Layers | null;
  setUpdateLayer: React.Dispatch<React.SetStateAction<Layers | null>>;
  layersRef: React.MutableRefObject<TileLayer<any>[]>;
  addLayer: (layer: Layers) => void;
  removeLayer: (index: any) => void;
  updateOpacity: (index: number, opacity: number) => void;
  updateMinMax: (index: number, min: number, max: number, bandIndex?: number) => void;
  updateBaseMap: (selectedBasemap: basemap) => void;
  reorderLayers: (sourceIndex: number, destinationIndex: number) => void;
}

const GeoDataContext = createContext<GeoDataContextType | undefined>(undefined);

interface GeoDataProviderProps {
  children: React.ReactNode;
}

interface RequestInfo {
  format: FileFormat;
  rescale: boolean;
  colormap_name?: ColorMap;
}

interface layerTransparency {
  baseMapLayer: number;
  singleBandCOGLayer: number;
}

export interface bbox {
  active: boolean;
  minx: number | null;
  miny: number | null;
  maxx: number | null;
  maxy: number | null;
}

export type mode = "singleband" | "multiband" | "bandarithmatic";

export const GeoDataProvider: React.FC<GeoDataProviderProps> = ({
  children,
}) => {
  const [url, setUrl] = useState<string>(
    "/COG/3RIMG/2025/03/12/3RIMG_12MAR2025_0945_L1C_ASIA_MER_V01R00.cog.tif"
    // "/usr/local/code/souradip/cog-testing/final-test/3RIMG_12MAR2025_0945_L1B_IMG_TIR1_V01R00.tif"
  );
  const [geoData, setGeoData] = useState<GeoJSON | null>(null);
  const [reqInfo, setReqInfo] = useState<RequestInfo>({
    format: "png",
    rescale: false,
  });
  const [selectedBasemap, setSelectedBasemap] = useState<basemap>(baseMaps[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [shapeActive, setShapeActive] = useState(false);
  const [mode, setMode] = useState<mode>("singleband");

  const [bbox, setBBOX] = useState<bbox>({
    active: false,
    minx: null,
    miny: null,
    maxx: null,
    maxy: null,
  });
  const [bandExpression, setBandExpression] = useState("b1+b2");
  const [layerTransparency, setLayerTransparency] = useState<layerTransparency>(
    {
      baseMapLayer: 1,
      singleBandCOGLayer: 1,
    }
  );
  const [Layers, setLayers] = useState<Layers[] | null>(null);
  const layersRef = useRef<TileLayer<any>[]>([]);
  const [updateLayer, setUpdateLayer] = useState<Layers | null>(null);
  const [, forceRender] = useState(0);
  const basemapLayer = useRef(new TileLayer({
    source: new TileWMS({
      url: baseMaps[0].url,
      params: {
        LAYERS: baseMaps[0].layer_name, // Layer to be used
        VERSION: "1.1.1", // Version of the service
        SRS: "EPSG:4326",
        CRS: "EPSG:4326",
      },
      serverType: "geoserver",
      crossOrigin: "anonymous",
      transition: 250,
    }),
  }));

  useEffect(() => {
    window.map?.addLayer(basemapLayer.current);
  }, []);

  const updateBaseMap = (selectedBasemap: basemap) => {
    basemapLayer.current.setOpacity(layerTransparency.baseMapLayer);
    basemapLayer.current.setSource(
      new TileWMS({
        url: selectedBasemap.url,
        params: {
          LAYERS: selectedBasemap.layer_name,
          VERSION: "1.1.1",
          SRS: "EPSG:4326",
          CRS: "EPSG:4326",
        },
        serverType: "geoserver",
        crossOrigin: "anonymous",
        transition: 250,
      })
    );
  };

  const addLayer = (layer: Layers) => {
    // Calculate z-index for the new layer - top layer gets highest z-index
    const zIndex = Layers ? 1000 - Layers.length : 1000;

    const newLayer = new TileLayer({
      opacity: layer.transparency,
      source: new ImageTile({
        url: GET_TITILER_URL({
          url: layer.url,
          bands: layer.bandIDs.map((band) => parseInt(band)),
          minMax: layer.minMax.map(band => [band.min, band.max]),
          bandExpression: bandExpression,
          mode: mode,
        }),
        transition: 250,
        crossOrigin: "anonymous",
      }),
      zIndex: zIndex, // Set initial z-index
    });

    // Add the layer to our reference array
    layersRef.current.push(newLayer);

    // Add the layer directly to the map
    if (window.map && window.map.addLayer) {
      window.map.addLayer(newLayer);
    }

    // Update Layers state with the new layer's information
    setLayers(prevLayers => [...(prevLayers || []), layer]);

    forceRender((prev) => prev + 1); // Triggers re-render
  };

  const removeLayer = (index) => {
    // Remove the layer from the map before removing from our array
    if (window.map && window.map.removeLayer && layersRef.current[index]) {
      window.map.removeLayer(layersRef.current[index]);
    }

    // Remove from our reference array
    layersRef.current.splice(index, 1);

    // Update Layers state
    setLayers(prevLayers => (prevLayers ? prevLayers.filter((_, i) => i !== index) : null));

    forceRender((prev) => prev + 1); // Triggers re-render
  };

  const updateOpacity = (index: number, opacity: number) => {
    if (layersRef.current[index]) {
      layersRef.current[index].setOpacity(opacity);

      // Update Layers state
      setLayers(prevLayers =>
        prevLayers ? prevLayers.map((layer, i) =>
          i === index ? { ...layer, transparency: opacity } : layer
        ) : null
      );
    }
  };

  // New function to reorder layers and update z-indices
  const reorderLayers = (sourceIndex: number, destinationIndex: number) => {
    if (
      !Layers ||
      sourceIndex < 0 ||
      destinationIndex < 0 ||
      sourceIndex >= Layers.length ||
      destinationIndex >= Layers.length
    ) {
      return;
    }

    // Create a copy of the current layers
    const newLayers = [...Layers];
    const [removed] = newLayers.splice(sourceIndex, 1);
    newLayers.splice(destinationIndex, 0, removed);

    // Reorder the actual layer references
    const [removedLayer] = layersRef.current.splice(sourceIndex, 1);
    layersRef.current.splice(destinationIndex, 0, removedLayer);

    // Update z-indices for all layers - top layer (index 0) gets highest z-index
    newLayers.forEach((_, index) => {
      const zIndex = 1000 - index; // Highest z-index for first layer (index 0)
      if (layersRef.current[index]) {
        layersRef.current[index].setZIndex(zIndex);
      }
    });

    // Update state
    setLayers(newLayers);
    forceRender((prev) => prev + 1);
  };

  const updateMinMax = (index: number, min: number, max: number, bandIndex: number = 0) => {
    if (layersRef.current[index]) {
      // First update the layer state
      setLayers(prevLayers => {
        if (!prevLayers) return null;

        const updatedLayers = [...prevLayers];
        const updatedLayer = { ...updatedLayers[index] };

        // Create a copy of minMax array
        const updatedMinMax = [...updatedLayer.minMax];
        // Update the specific band's min/max
        updatedMinMax[bandIndex] = {
          ...updatedMinMax[bandIndex],
          min: min,
          max: max
        };

        updatedLayer.minMax = updatedMinMax;
        updatedLayers[index] = updatedLayer;

        // A more aggressive approach: Create and replace the entire layer instead of just updating the source
        const newLayerUrl = GET_TITILER_URL({
          url: updatedLayer.url,
          bands: updatedLayer.bandIDs.map((band) => parseInt(band)),
          minMax: updatedLayer.minMax.map(band => [band.min, band.max]),
          bandExpression: bandExpression,
          mode: mode,
        });

        // Store the current zIndex to preserve it
        const currentZIndex = layersRef.current[index].getZIndex();

        // Create completely new source
        const newSource = new TileImage({
          url: newLayerUrl,
          transition: 0,
          crossOrigin: "anonymous",
        });

        // Remove the old layer from the map
        window.map?.removeLayer(layersRef.current[index]);

        // Create a completely new layer
        const newLayer = new TileLayer({
          opacity: updatedLayer.transparency,
          source: newSource,
          visible: true,
          zIndex: currentZIndex || (index + 100), // Preserve the original zIndex or use default if undefined
        });

        // Replace in our layer reference
        layersRef.current[index] = newLayer;

        // Add the new layer to the map
        window.map?.addLayer(newLayer);

        return updatedLayers;
      });
    }
  };

  return (
    <GeoDataContext.Provider
      value={{
        geoData,
        url,
        setUrl,
        loading,
        setLoading,
        reqInfo,
        setReqInfo,
        selectedBasemap,
        setSelectedBasemap,
        shapeActive,
        setShapeActive,
        layerTransparency,
        setLayerTransparency,
        mode,
        setMode,
        bandExpression,
        setBandExpression,
        bbox,
        setBBOX,
        Layers,
        setLayers,
        updateLayer,
        setUpdateLayer,
        layersRef,
        addLayer,
        removeLayer,
        updateOpacity,
        updateMinMax,
        updateBaseMap,
        reorderLayers
      }}
    >
      {children}
    </GeoDataContext.Provider>
  );
};

// Custom hook to access geo data
export const useGeoData = (): GeoDataContextType => {
  const context = useContext(GeoDataContext);
  if (!context) {
    throw new Error("useGeoData must be used within a GeoDataProvider");
  }
  return context;
};
