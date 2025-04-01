import React, { createContext, useContext, useEffect, useState } from "react";
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
  Layers,
  SELECTED_LAYERS,
} from "../constants/consts.ts";

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
  Layers: Layers[];
  setLayers: React.Dispatch<React.SetStateAction<Layers[]>>;
  updateLayer: Layers | null;
  setUpdateLayer: React.Dispatch<React.SetStateAction<Layers | null>>;
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
  const [Layers, setLayers] = useState(SELECTED_LAYERS);
  const [updateLayer, setUpdateLayer] = useState<Layers | null>(null);
  // Fetch the GeoJSON data when the URL changes
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${GeoJSONEndpoint}?url=${url}`);
        if (!response.ok) {
          throw new Error("Failed to fetch geo data");
        }
        const data: GeoJSON = await response.json();
        setGeoData(data);
        console.log(data);
        setLoading(false);
      } catch {
        setGeoData(null);
        setLoading(false);
      }
    };

    fetchGeoData();
  }, [url]);

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
