import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ColorMap,
  FileFormat,
  GeoJSON,
  GeoJSONError,
} from "../../types/geojson.ts";
import {
  basemap,
  baseMaps,
  GET_TITILER_URL,
  Layers,
} from "../constants/consts.ts";
import TileLayer from "ol/layer/Tile";
import { ImageTile, ImageWMS, TileImage, TileWMS } from "ol/source";
import { colorMap } from "@/types/colormap.ts";
import ImageLayer from "ol/layer/Image";

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
  updateColorMap: (index: number, colorMap: colorMap | undefined) => void;
  updateLayerFunc: (index: number, updatedLayerProps: Partial<Layers>) => void;
  updateBaseMapOpacity: (opacity: number) => void;
  toggleOutlineLayer: (active: boolean) => void;
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
  const basemapLayer = useRef(
    new TileLayer({
      source: new TileWMS({
        url: baseMaps[0].url,
        params: {
          LAYERS: baseMaps[0].layer_name,
          VERSION: "1.1.1",
          SRS: "EPSG:4326",
          CRS: "EPSG:4326",
        },
        serverType: "geoserver",
        crossOrigin: "anonymous",
        transition: 250,
      }),
    })
  );

  const outlineLayer = useRef(
    new ImageLayer({
      visible: false,
      zIndex: 1001,
      source: new ImageWMS({
        url: "https://mosdac.gov.in/geoserver_2/worldview/wms",
        params: {
          LAYERS: "worldview:INDIA_STATE250NATGIS2005",
          TRANSPARENT: true,
          FORMAT: "image/png",
          OPACITY: 1,
          CRS: "EPSG:4326",
        },
      }),
    })
  )

  useEffect(() => {
    window.map?.addLayer(basemapLayer.current);
    window.map?.addLayer(outlineLayer.current);
  }, []);

  const toggleOutlineLayer = (active: boolean) => {
    if (outlineLayer.current) {
      outlineLayer.current.setVisible(active);
    }
  }

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

  const updateBaseMapOpacity = (opacity: number) => {
    basemapLayer.current.setOpacity(opacity);
    setLayerTransparency((prev) => ({
      ...prev,
      baseMapLayer: opacity,
    }));
  }

  const addLayer = (layer: Layers) => {
    const zIndex = Layers ? 1000 - Layers.length : 1000;

    const layerWithZIndex = {
      ...layer,
      zIndex: zIndex,
    };

    const newLayer = new TileLayer({
      opacity: layerWithZIndex.transparency,
      source: new ImageTile({
        url: GET_TITILER_URL({
          url: layerWithZIndex.url,
          bands: layerWithZIndex.bandIDs.map((band) => parseInt(band)),
          minMax: layerWithZIndex.minMax.map((band) => [band.min, band.max]),
          bandExpression: bandExpression,
          mode: layerWithZIndex.layerType,
        }),
        transition: 250,
        crossOrigin: "anonymous",
      }),
      zIndex: zIndex,
    });

    layersRef.current.push(newLayer);

    if (window.map && window.map.addLayer) {
      window.map.addLayer(newLayer);
    }

    setLayers((prevLayers) => [...(prevLayers || []), layerWithZIndex]);
    forceRender((prev) => prev + 1);
  };

  const removeLayer = (index: number) => {
    if (window.map && window.map.removeLayer && layersRef.current[index]) {
      window.map.removeLayer(layersRef.current[index]);
    }

    layersRef.current.splice(index, 1);

    setLayers((prevLayers) =>
      prevLayers ? prevLayers.filter((_, i) => i !== index) : null
    );

    forceRender((prev) => prev + 1);
  };

  const updateOpacity = (index: number, opacity: number) => {
    if (layersRef.current[index]) {
      layersRef.current[index].setOpacity(opacity);

      setLayers((prevLayers) =>
        prevLayers
          ? prevLayers.map((layer, i) =>
            i === index ? { ...layer, transparency: opacity } : layer
          )
          : null
      );
    }
  };

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

    const newLayers = [...Layers];
    const [removed] = newLayers.splice(sourceIndex, 1);
    newLayers.splice(destinationIndex, 0, removed);

    const [removedLayer] = layersRef.current.splice(sourceIndex, 1);
    layersRef.current.splice(destinationIndex, 0, removedLayer);

    newLayers.forEach((_, index) => {
      const zIndex = 1000 - index;

      newLayers[index] = {
        ...newLayers[index],
        zIndex: zIndex,
      };

      if (layersRef.current[index]) {
        layersRef.current[index].setZIndex(zIndex);
      }
    });

    setLayers(newLayers);
    forceRender((prev) => prev + 1);
  };

  const updateColorMap = (index: number, colorMap: colorMap | undefined) => {
    if (layersRef.current[index]) {
      setLayers((prevLayers) => {
        if (!prevLayers) return null;

        const updatedLayers = [...prevLayers];
        const updatedLayer = { ...updatedLayers[index] };

        updatedLayer.colormap = colorMap;
        updatedLayers[index] = updatedLayer;

        const zIndex =
          updatedLayer.zIndex ||
          layersRef.current[index].getZIndex() ||
          1000 - index;

        const newSource = new TileImage({
          url: GET_TITILER_URL({
            url: updatedLayer.url,
            bands: updatedLayer.bandIDs.map((band) => parseInt(band)),
            minMax: updatedLayer.minMax.map((band) => [band.min, band.max]),
            bandExpression: bandExpression,
            mode: updatedLayer.layerType,
            colorMap: colorMap,
          }),
          transition: 0,
          crossOrigin: "anonymous",
        });

        window.map?.removeLayer(layersRef.current[index]);

        const newLayer = new TileLayer({
          opacity: updatedLayer.transparency,
          source: newSource,
          visible: true,
          zIndex: zIndex,
        });

        layersRef.current[index] = newLayer;

        window.map?.addLayer(newLayer);

        return updatedLayers;
      });
    }
  };

  const updateMinMax = (
    index: number,
    min: number,
    max: number,
    bandIndex: number = 0
  ) => {
    if (layersRef.current[index]) {
      setLayers((prevLayers) => {
        if (!prevLayers) return null;

        const updatedLayers = [...prevLayers];
        const updatedLayer = { ...updatedLayers[index] };

        const updatedMinMax = [...updatedLayer.minMax];
        updatedMinMax[bandIndex] = {
          ...updatedMinMax[bandIndex],
          min: min,
          max: max,
        };

        updatedLayer.minMax = updatedMinMax;
        updatedLayers[index] = updatedLayer;

        const colorMap = updatedLayer.colormap;
        const zIndex =
          updatedLayer.zIndex ||
          layersRef.current[index].getZIndex() ||
          1000 - index;

        const newLayerUrl = GET_TITILER_URL({
          url: updatedLayer.url,
          bands: updatedLayer.bandIDs.map((band) => parseInt(band)),
          minMax: updatedLayer.minMax.map((band) => [band.min, band.max]),
          bandExpression: bandExpression,
          mode: updatedLayer.layerType,
          colorMap: colorMap,
        });

        const newSource = new TileImage({
          url: newLayerUrl,
          transition: 0,
          crossOrigin: "anonymous",
        });

        window.map?.removeLayer(layersRef.current[index]);

        const newLayer = new TileLayer({
          opacity: updatedLayer.transparency,
          source: newSource,
          visible: true,
          zIndex: zIndex,
        });

        layersRef.current[index] = newLayer;

        window.map?.addLayer(newLayer);

        return updatedLayers;
      });
    }
  };

  const updateLayerFunc = (index: number, updatedLayerProps: Partial<Layers>) => {
    if (layersRef.current[index]) {
      setLayers((prevLayers) => {
        if (!prevLayers) return null;

        const updatedLayers = [...prevLayers];
        const updatedLayer = {
          ...updatedLayers[index],
          ...updatedLayerProps,
        };
        updatedLayers[index] = updatedLayer;

        const zIndex =
          updatedLayer.zIndex ||
          layersRef.current[index].getZIndex() ||
          1000 - index;

        const newSource = new TileImage({
          url: GET_TITILER_URL({
            url: updatedLayer.url,
            bands: updatedLayer.bandIDs.map((band) => parseInt(band)),
            minMax: updatedLayer.minMax.map((band) => [band.min, band.max]),
            bandExpression: bandExpression,
            mode: updatedLayer.layerType,
            colorMap: updatedLayer.colormap,
          }),
          transition: 0,
          crossOrigin: "anonymous",
        });

        window.map?.removeLayer(layersRef.current[index]);

        const newLayer = new TileLayer({
          opacity: updatedLayer.transparency,
          source: newSource,
          visible: true,
          zIndex: zIndex,
        });

        layersRef.current[index] = newLayer;

        window.map?.addLayer(newLayer);

        return updatedLayers;
      });

      forceRender((prev) => prev + 1);
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
        reorderLayers,
        updateColorMap,
        updateLayerFunc,
        updateBaseMapOpacity,
        toggleOutlineLayer
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
