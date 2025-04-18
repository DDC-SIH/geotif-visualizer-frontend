// import { colorMaps } from './consts';
import {availableColorMaps} from "./colormaps";
// import { bbox } from "./../contexts/GeoDataProvider";
import { FileFormat } from "types/geojson";
import type { bbox as bboxtype } from "../contexts/GeoDataProvider";
import { colorMap } from "@/types/colormap";
export const TITILER_BASE_URL = "http://74.226.242.56:8000";
export const GeoJSONEndpoint = `${TITILER_BASE_URL}/cog/info.geojson`;
export const TileEndpoint = `${TITILER_BASE_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}`;
export const TileDownloadEndpoint = `${TITILER_BASE_URL}/cog/preview`;
export const TileBBOXEndpoint = `${TITILER_BASE_URL}/cog/bbox/`;
export const TilePreviewEndpoint = `${TITILER_BASE_URL}/cog/preview`;



export type basemap = {
  name: string;
  layer_name: string;
  url: string;
};

export const baseMaps: basemap[] = [
  {
    name: "OSM",
    layer_name: "osm",
    url: "https://mosdac.gov.in/mapproxy/service",
  },
  {
    name: "Natural Earth",
    layer_name: "natural_earth",
    url: "https://mosdac.gov.in/geoserver_2/wms",
  },
  {
    name: "Black Marble",
    layer_name: "black_marble",
    url: "https://mosdac.gov.in/geoserver_2/wms",
  },
  {
    name: "True Marble",
    layer_name: "true_marble",
    url: "https://mosdac.gov.in/geoserver_2/wms",
  },
  {
    name: "GTOPO",
    layer_name: "forecast_india",
    url: "https://mosdac.gov.in/geoserver_2/wms",
  },
];

export const fileFormats: FileFormat[] = [
  "tif",
  "jp2",
  "png",
  "pngraw",
  "jpeg",
  "jpg",
  "webp",
  "npy",
];



interface TITILER_PARAMS {
  url: string;
  bands: string[] | number[];
  tileFormat?: FileFormat;
  bandExpression?: string;
  minMax: number[][];
  mode: LayerType;
  bbox?: bboxtype;
  colorMap?: colorMap;
}
export const GET_TITILER_URL = (params: TITILER_PARAMS) => {
  let url = TileEndpoint;
  if (params.tileFormat) {
    url += `.${params.tileFormat}`;
  }

  const tempObj = new URL(url);

  tempObj.searchParams.append("url", params.url);

  if (params.bands.length > 0) {
    params.bands.forEach((element) => {
      tempObj.searchParams.append("bidx", element.toString());
    });
  } else {
    tempObj.searchParams.append("bidx", "1");
  }
  if (params.mode !== "BandArithmatic") {
    params.minMax.map((item) => {
      tempObj.searchParams.append("rescale", `${item[0]},${item[1]}`);
    });
  }
  if (params.colorMap && params.mode === "Singleband") {
    tempObj.searchParams.append("colormap_name", params.colorMap);
  }

  if (params.bandExpression && params.mode === "BandArithmatic") {
    tempObj.searchParams.append("expression", params.bandExpression);
  }

  return url + tempObj.search;
};

interface TITILER_PARAMS {
  url: string;
  bands: string[] | number[];
  tileFormat?: FileFormat;
  bandExpression?: string;
  minMax: number[][];
  mode: LayerType;
  bbox?: bboxtype;
  colorMap?: colorMap;
}
export const GET_FINAL_DOWNLOAD_URL = (params: TITILER_PARAMS) => {
  let url = TileDownloadEndpoint;
  if (params.bbox &&
    params.bbox.active &&
    params.bbox.minx &&
    params.bbox.miny &&
    params.bbox.maxx &&
    params.bbox.maxy
  ) {
    url = `${TileBBOXEndpoint}${params.bbox.minx},${params.bbox.miny},${params.bbox.maxx},${params.bbox.maxy}`;
  }

  if (params.tileFormat) {
    url += `.${params.tileFormat}`;
  }

  const tempObj = new URL(url);

  tempObj.searchParams.append("url", params.url);

  if (params.bands.length > 0) {
    params.bands.forEach((element) => {
      tempObj.searchParams.append("bidx", element.toString());
    });
  } else {
    tempObj.searchParams.append("bidx", "1");
  }
  if (params.mode !== "BandArithmatic") {
    params.minMax.map((item) => {
      tempObj.searchParams.append("rescale", `${item[0]},${item[1]}`);
    });
  }
  if (params.colorMap && params.mode === "Singleband") {
    tempObj.searchParams.append("colormap_name", params.colorMap);
  }

  if (params.bandExpression && params.mode === "BandArithmatic") {
    tempObj.searchParams.append("expression", params.bandExpression);
  }

  return url + tempObj.search;
};

interface DOWNLOAD_PARAMS {
  url: string;
  bands: string[] | number[];
  tileFormat: FileFormat;
  bandExpression?: string;
  minMax: number[][];
  mode: LayerType;
  bbox: bboxtype;
}
export const GET_DOWNLOAD_URL = (params: DOWNLOAD_PARAMS) => {
  let url = TileDownloadEndpoint;
  if (
    params.bbox.active &&
    params.bbox.minx &&
    params.bbox.miny &&
    params.bbox.maxx &&
    params.bbox.maxy
  ) {
    url = `${TileBBOXEndpoint}${params.bbox.minx},${params.bbox.miny},${params.bbox.maxx},${params.bbox.maxy}`;
  }
  if (params.tileFormat) {
    url += `.${params.tileFormat}`;
  }

  const tempObj = new URL(url);

  tempObj.searchParams.append("url", params.url);

  if (params.bands.length > 0) {
    params.bands.forEach((element) => {
      tempObj.searchParams.append("bidx", element.toString());
    });
  } else {
    tempObj.searchParams.append("bidx", "1");
  }
  if (params.mode !== "BandArithmatic") {
    params.minMax.map((item) => {
      tempObj.searchParams.append("rescale", `${item[0]},${item[1]}`);
    });
  }

  if (params.bandExpression && params.mode === "BandArithmatic") {
    tempObj.searchParams.append("expression", params.bandExpression);
  }

  return url + tempObj.search;
};


type LayerType = "BandArithmatic" | "Singleband" | "RGB"
// type satID= 
export interface Layers {
  id: string
  layerType: LayerType,
  satID: string,
  date: Date,
  time: string,
  bandNames: string[],
  bandIDs: string[],
  minMax: {
    min: number;
    max: number;
    minLim: number;
    maxLim: number;
  }[];
  url: string,
  colormap: colorMap | undefined,
  transparency: number,
  processingLevel?: string,
  layer: unknown,
  zIndex?: number, // Add zIndex property to track layer positioning
  productCode?: string,
}



export const defaultMapConfig = {
  center: [78.9629, 20.5937],
  zoom: 4,
  maxzoom: 19,
  minzoom: 2,
  animateZoom: 4.5,
  animateZoomDuration: 2000, //in ms
};

