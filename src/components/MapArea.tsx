/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import {
  defaultMapConfig,
  GET_TITILER_URL,
  mapBandsToTiTilerBands,
  // minMaxToTiTiler,
} from "../constants/consts";
import { useGeoData } from "../contexts/GeoDataProvider";
import ImageTile from "ol/source/ImageTile";
import { ImageWMS, TileWMS } from "ol/source";
import ImageLayer from "ol/layer/Image";
import { fromLonLat } from "ol/proj";
import { addDragBoxInteraction } from "@/lib/dragBoxInteraction";
import BaseLayer from "ol/layer/Base";
function MapComponent() {
  const {
    geoData,
    // url,
    loading,
    selectedBasemap,
    shapeActive,
    layerTransparency,
    processingLevelAndBands,
    mode,
    bandExpression,
    Layers,
    setLayers,
    // bbox,
    setBBOX,
    // setMode,
  } = useGeoData();
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const basemapLayer: BaseLayer = new TileLayer({
    source: new TileWMS({
      url: selectedBasemap.url,
      params: {
        LAYERS: selectedBasemap.layer_name, // Layer to be used
        VERSION: "1.1.1", // Version of the service
        SRS: "EPSG:4326",
        CRS: "EPSG:4326",
      },
      serverType: "geoserver",
      crossOrigin: "anonymous",
      transition: 250,
    }),
  });
  // const COGLayer = new TileLayer({
  //   source: new ImageTile({
  //     url: GET_TITILER_URL({
  //       url,
  //       bands: mapBandsToTiTilerBands(processingLevelAndBands.bands, mode),
  //       minMax: minMaxToTiTiler(processingLevelAndBands.bands, mode),
  //       bandExpression: bandExpression,
  //       mode: mode,
  //       // bbox: bbox,
  //     }),
  //     transition: 250,
  //     crossOrigin: "anonymous",
  //   }),
  // });
  const outlineLayer = new ImageLayer({});
  console.log(
    mode,
    mapBandsToTiTilerBands(processingLevelAndBands.bands, mode)
  );

  //For Bounding Box Selection
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

  const map = useRef(
    new Map({
      // target: mapRef.current as HTMLDivElement,
      layers: [],
      view: new View({
        zoom: defaultMapConfig.zoom,
        center: fromLonLat(defaultMapConfig.center), // India center coordinates
        maxZoom: defaultMapConfig.maxzoom,
        minZoom: defaultMapConfig.minzoom,
      }),
    })
  );
  //Main Loop
  useEffect(() => {
    // if (geoData === null) {
    //   return;
    // }
    // console.log(geoData)
    map.current.setTarget("map");
    map.current.getView().animate({
      zoom: defaultMapConfig.animateZoom,
      duration: defaultMapConfig.animateZoomDuration, // Duration of the zoom animation (in milliseconds)
    });

    const singleBandOLLayers: BaseLayer[] = Layers.map((layer) => {
      return new TileLayer({
        opacity: layer.transparency,
        source: new ImageTile({
          url: GET_TITILER_URL({
            url: layer.url,
            bands: [parseInt(layer.bandID)],
            minMax: [[layer.min, layer.max]],
            bandExpression: bandExpression,
            mode: mode,
            // bbox: bbox,
          }),

          transition: 250,
          crossOrigin: "anonymous",
        }),
      });
    });
    const TempLayers = Layers;
    singleBandOLLayers.forEach((val, index) => {
      TempLayers[index].layer = val;
      TempLayers[index].id = val.ol_uid;
    });
    setLayers(TempLayers);

    // const layers=[basemapLayer];
    // singleBandOLLayers.push(outlineLayer)
    // const layers=[]
    // layers.push(basemapLayer)
    // singleBandOLLayers.forEach((layer)=>{
    //   layers.push(layer)
    // })
    // layers.push(outlineLayer)
    // map.current.setLayers(layers);

    addDragBoxInteraction(map.current, mapRef, isModifierKeyPressed, setBBOX);

    return () => map.current.setTarget(undefined);
  }, [loading, geoData, addDragBoxInteraction]);

  //Updates Basemap
  useEffect(() => {
    const Layers = map.current.getAllLayers();
    basemapLayer.setOpacity(layerTransparency.baseMapLayer);
    Layers[0] = basemapLayer;
    map.current.setLayers(Layers);
  }, [selectedBasemap, layerTransparency.baseMapLayer]);

  // Updates COGLayer
  useEffect(() => {
    console.log("Rerender");
    const layers2 = map.current.getAllLayers();
    console.log(layers2);

    const singleBandOLLayers = Layers.map((layer) => {
      return new TileLayer({
        opacity: layer.transparency,
        source: new ImageTile({
          url: GET_TITILER_URL({
            url: layer.url,
            bands: [parseInt(layer.bandID)],
            minMax: [[layer.min, layer.max]],
            bandExpression: bandExpression,
            mode: mode,
            // bbox: bbox,
          }),

          transition: 250,
          crossOrigin: "anonymous",
        }),
      });
    });

    // const layers=[basemapLayer];
    // singleBandOLLayers.push(outlineLayer)
    const layers: any[] = [];
    // layers.push(basemapLayer)
    singleBandOLLayers.forEach((layer) => {
      layers.push(layer);
    });

    map.current.setLayers(layers);
  }, [Layers]);

  // //Updates Shapefile
  useEffect(() => {
    const Layers = map.current.getAllLayers();
    console.log(Layers);
    // Layers.findIndex()
    if (shapeActive) {
      Layers[5] = new ImageLayer({
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
      });
    } else {
      Layers[-1] = new ImageLayer({});
    }
    map.current.setLayers(Layers);
  }, [shapeActive]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{ height: "100vh", width: "100%" }}
      id="map"
      ref={mapRef}
      className="map-container top-0 left-0"
    />
  );
}

export default MapComponent;
