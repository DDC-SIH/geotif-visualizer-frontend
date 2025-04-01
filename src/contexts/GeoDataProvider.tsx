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
import { ImageTile } from "ol/source";

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
  processingLevelAndBands: (typeof BANDS_MASTER)[0];
  setProcessingLevelAndBands: React.Dispatch<
    React.SetStateAction<(typeof BANDS_MASTER)[0]>
  >;
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
  const [processingLevelAndBands, setProcessingLevelAndBands] = useState({
    processingLevel: BANDS_MASTER[0].processingLevel,
    bands: [
      BANDS_MASTER[0].bands[0],
      BANDS_MASTER[0].bands[1],
      BANDS_MASTER[0].bands[2],
    ],
  });
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

  const addLayer = (layer: Layers) => {
    const newLayer = new TileLayer({
      opacity: layer.transparency,
      source: new ImageTile({
        url: GET_TITILER_URL({
          url: layer.url,
          bands: layer.bandIDs.map((band) => parseInt(band)),
          minMax: layer.minMax.map(band => [band.min, band.max]),
          bandExpression: bandExpression,
          mode: mode,
          // bbox: bbox,
        }),

        transition: 250,
        crossOrigin: "anonymous",
      }),
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

        // Create new source with updated parameters
        const newSource = new ImageTile({
          url: GET_TITILER_URL({
            url: updatedLayer.url,
            bands: updatedLayer.bandIDs.map((band) => parseInt(band)),
            minMax: updatedLayer.minMax.map(band => [band.min, band.max]),
            bandExpression: bandExpression,
            mode: mode,
          }),
          transition: 250,
          crossOrigin: "anonymous",
        });

        // Update the layer's source
        layersRef.current[index].setSource(newSource);

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
        processingLevelAndBands,
        setProcessingLevelAndBands,
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
