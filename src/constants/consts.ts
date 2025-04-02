// import { colorMaps } from './consts';
// import { bbox } from "./../contexts/GeoDataProvider";
import { FileFormat } from "types/geojson";
import type { bbox as bboxtype, mode } from "../contexts/GeoDataProvider";

export const TITILER_BASE_URL = "http://192.168.1.116:8000";
export const GeoJSONEndpoint = `${TITILER_BASE_URL}/cog/info.geojson`;
export const TileEndpoint = `${TITILER_BASE_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}`;
export const TileDownloadEndpoint = `${TITILER_BASE_URL}/cog/preview`;
export const TileBBOXEndpoint = `${TITILER_BASE_URL}/cog/bbox/`;
// export const colorMaps: ColorMap[] = [
//   "accent",
//   "accent_r",
//   "afmhot",
//   "afmhot_r",
//   "algae",
//   "algae_r",
//   "amp",
//   "amp_r",
//   "autumn",
//   "autumn_r",
//   "balance",
//   "balance_r",
//   "binary",
//   "binary_r",
//   "blues",
//   "blues_r",
//   "bone",
//   "bone_r",
//   "brbg",
//   "brbg_r",
//   "brg",
//   "brg_r",
//   "bugn",
//   "bugn_r",
//   "bupu",
//   "bupu_r",
//   "bwr",
//   "bwr_r",
//   "cfastie",
//   "cividis",
//   "cividis_r",
//   "cmrmap",
//   "cmrmap_r",
//   "cool",
//   "cool_r",
//   "coolwarm",
//   "coolwarm_r",
//   "copper",
//   "copper_r",
//   "cubehelix",
//   "cubehelix_r",
//   "curl",
//   "curl_r",
//   "dark2",
//   "dark2_r",
//   "deep",
//   "deep_r",
//   "delta",
//   "delta_r",
//   "dense",
//   "dense_r",
//   "diff",
//   "diff_r",
//   "flag",
//   "flag_r",
//   "gist_earth",
//   "gist_earth_r",
//   "gist_gray",
//   "gist_gray_r",
//   "gist_heat",
//   "gist_heat_r",
//   "gist_ncar",
//   "gist_ncar_r",
//   "gist_rainbow",
//   "gist_rainbow_r",
//   "gist_stern",
//   "gist_stern_r",
//   "gist_yarg",
//   "gist_yarg_r",
//   "gnbu",
//   "gnbu_r",
//   "gnuplot",
//   "gnuplot2",
//   "gnuplot2_r",
//   "gnuplot_r",
//   "gray",
//   "gray_r",
//   "greens",
//   "greens_r",
//   "greys",
//   "greys_r",
//   "haline",
//   "haline_r",
//   "hot",
//   "hot_r",
//   "hsv",
//   "hsv_r",
//   "ice",
//   "ice_r",
//   "inferno",
//   "inferno_r",
//   "jet",
//   "jet_r",
//   "magma",
//   "magma_r",
//   "matter",
//   "matter_r",
//   "nipy_spectral",
//   "nipy_spectral_r",
//   "ocean",
//   "ocean_r",
//   "oranges",
//   "oranges_r",
//   "orrd",
//   "orrd_r",
//   "oxy",
//   "oxy_r",
//   "paired",
//   "paired_r",
//   "pastel1",
//   "pastel1_r",
// ];

type colorMap =
  | "accent"
  | "accent_r"
  | "afmhot"
  | "afmhot_r"
  | "algae"
  | "algae_r"
  | "amp"
  | "amp_r"
  | "autumn"
  | "autumn_r"
  | "balance"
  | "balance_r"
  | "binary"
  | "binary_r"
  | "blues"
  | "blues_r"
  | "bone"
  | "bone_r"
  | "brbg"
  | "brbg_r"
  | "brg"
  | "brg_r"
  | "bugn"
  | "bugn_r"
  | "bupu"
  | "bupu_r"
  | "bwr"
  | "bwr_r"
  | "cfastie"
  | "cividis"
  | "cividis_r"
  | "cmrmap"
  | "cmrmap_r"
  | "cool"
  | "cool_r"
  | "coolwarm"
  | "coolwarm_r"
  | "copper"
  | "copper_r"
  | "cubehelix"
  | "cubehelix_r"
  | "curl"
  | "curl_r"
  | "dark2"
  | "dark2_r"
  | "deep"
  | "deep_r"
  | "delta"
  | "delta_r"
  | "dense"
  | "dense_r"
  | "diff"
  | "diff_r"
  | "flag"
  | "flag_r"
  | "gist_earth"
  | "gist_earth_r"
  | "gist_gray"
  | "gist_gray_r"
  | "gist_heat"
  | "gist_heat_r"
  | "gist_ncar"
  | "gist_ncar_r"
  | "gist_rainbow"
  | "gist_rainbow_r"
  | "gist_stern"
  | "gist_stern_r"
  | "gist_yarg"
  | "gist_yarg_r"
  | "gnbu"
  | "gnbu_r"
  | "gnuplot"
  | "gnuplot2"
  | "gnuplot2_r"
  | "gnuplot_r"
  | "gray"
  | "gray_r"
  | "greens"
  | "greens_r"
  | "greys"
  | "greys_r"
  | "haline"
  | "haline_r"
  | "hot"
  | "hot_r"
  | "hsv"
  | "hsv_r"
  | "ice"
  | "ice_r"
  | "inferno"
  | "inferno_r"
  | "jet"
  | "jet_r"
  | "magma"
  | "magma_r"
  | "matter"
  | "matter_r"
  | "nipy_spectral"
  | "nipy_spectral_r"
  | "ocean"
  | "ocean_r"
  | "oranges"
  | "oranges_r"
  | "orrd"
  | "orrd_r"
  | "oxy"
  | "oxy_r"
  | "paired"
  | "paired_r"
  | "pastel1"
  | "pastel1_r";

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

type TILE_FORMAT = "png" | "pngraw" | "jpeg" | "jpg" | "webp" | "npy";

interface TITILER_PARAMS {
  url: string;
  bands: string[] | number[];
  tileFormat?: TILE_FORMAT;
  bandExpression?: string;
  minMax: number[][];
  mode: mode;
  bbox?: bboxtype;
}
export const GET_TITILER_URL = (params: TITILER_PARAMS) => {
  let url = TileEndpoint;
  // if (
  //   params.bbox.active &&
  //   params.bbox.minx &&
  //   params.bbox.miny &&
  //   params.bbox.maxx &&
  //   params.bbox.maxy
  // ) {
  //   url = `${TileBBOXEndpoint}${params.bbox.minx},${params.bbox.miny},${params.bbox.maxx},${params.bbox.maxy}.png`;
  // }
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
  if (params.mode !== "bandarithmatic") {
    params.minMax.map((item) => {
      tempObj.searchParams.append("rescale", `${item[0]},${item[1]}`);
    });
  }
  // tempObj.searchParams.append("rescale", "37,266");
  // tempObj.searchParams.append("rescale", "8,421");
  // tempObj.searchParams.append("rescale", "394,896");

  if (params.bandExpression && params.mode === "bandarithmatic") {
    tempObj.searchParams.append("expression", params.bandExpression);
  }

  return url + tempObj.search;
};

interface DOWNLOAD_PARAMS {
  url: string;
  bands: string[] | number[];
  tileFormat: TILE_FORMAT;
  bandExpression?: string;
  minMax: number[][];
  mode: mode;
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
  if (params.mode !== "bandarithmatic") {
    params.minMax.map((item) => {
      tempObj.searchParams.append("rescale", `${item[0]},${item[1]}`);
    });
  }
  // tempObj.searchParams.append("rescale", "37,266");
  // tempObj.searchParams.append("rescale", "8,421");
  // tempObj.searchParams.append("rescale", "394,896");

  if (params.bandExpression && params.mode === "bandarithmatic") {
    tempObj.searchParams.append("expression", params.bandExpression);
  }

  return url + tempObj.search;
};

const L1B_BANDS = [
  { value: "vis", label: "VIS" },
  { value: "swir", label: "SWIR" },
  { value: "mir", label: "MIR" },
  { value: "tir1", label: "TIR1" },
  { value: "tir2", label: "TIR2" },
  { value: "wv", label: "WV" },
  { value: "vis2", label: "VIS2" },
  { value: "swir2", label: "SWIR2" },
  { value: "mir2", label: "MIR2" },
];
export const L1C_BANDS = [
  { value: "vis", label: "VIS" },
  { value: "swir", label: "SWIR" },
  { value: "mir", label: "MIR" },
  { value: "tir1", label: "TIR1" },
  { value: "tir2", label: "TIR2" },
  { value: "wv", label: "WV" },
];
export const L2B_BANDS = [
  { value: "vis", label: "VIS" },
  { value: "swir", label: "SWIR" },
  { value: "mir", label: "MIR" },
  { value: "tir1", label: "TIR1" },
  { value: "tir2", label: "TIR2" },
  { value: "wv", label: "WV" },
];
export const L2C_BANDS = [
  { value: "vis", label: "VIS" },
  { value: "swir", label: "SWIR" },
  { value: "mir", label: "MIR" },
  { value: "tir1", label: "TIR1" },
  { value: "tir2", label: "TIR2" },
  { value: "wv", label: "WV" },
];
export const L3B_BANDS = [
  { value: "vis", label: "VIS" },
  { value: "swir", label: "SWIR" },
  { value: "mir", label: "MIR" },
  { value: "tir1", label: "TIR1" },
  { value: "tir2", label: "TIR2" },
  { value: "wv", label: "WV" },
];
export const L3C_BANDS = [
  { value: "vis", label: "VIS" },
  { value: "swir", label: "SWIR" },
  { value: "mir", label: "MIR" },
  { value: "tir1", label: "TIR1" },
  { value: "tir2", label: "TIR2" },
  { value: "wv", label: "WV" },
];

type LayerType = "BandArithmatic" | "Singleband" | "RGB";

export interface Layers {
  id: string | number;
  layerType: LayerType;
  bandNames: string[];
  bandIDs: string[];
  minMax: {
    min: number;
    max: number;
    minLim: number;
    maxLim: number;
  }[];
  url: string;
  colormap: colorMap | "";
  transparency: number;
  processingLevel?: string;
  layer: unknown;
}

export const SELECTED_LAYERS: Layers[] = [
  {
    id: 1,
    layerType: "BandArithmatic",
    bandName: "VIS",
    bandID: "1",
    min: 0,
    max: 1000,
    minLim: 0,
    maxLim: 1000,
    url: "C:\\Users\\ASUS\\Downloads\\3RIMG_01APR2025_1145_L1C_SGP_IMG_SWIR_V01R00.cog.tif",
    colormap: "",
    transparency: 0,
    processingLevel: "L1B",
    layer: "",
  },
  {
    id: 2,
    layerType: "Singleband",
    bandName: "SWIR",
    min: 0,
    max: 1000,
    minLim: 0,
    maxLim: 1000,
    url: "C:\\Users\\ASUS\\Downloads\\3RIMG_01APR2025_1145_L1C_SGP_IMG_SWIR_V01R00.cog.tif",
    bandID: "2",
    colormap: "",
    transparency: 1,
    processingLevel: "L1B",
    layer: "",
  },
  {
    id: 3,
    layerType: "RGB",
    bandName: "MIR",
    min: 0,
    max: 0.29,
    minLim: 0,
    maxLim: 1000,
    url: "C:\\Users\\ASUS\\Downloads\\3RIMG_01APR2025_1145_L1C_SGP_IMG_SWIR_V01R00.cog.tif",
    bandID: "11",
    colormap: "",
    transparency: 0.1,
    processingLevel: "L1B",
    layer: "",
  },
];

export const BANDS_MASTER = [
  {
    processingLevel: "L1B",
    bands: L1B_BANDS,
  },
  {
    processingLevel: "L2B",
    bands: L2B_BANDS,
  },
  {
    processingLevel: "L3B",
    bands: L3B_BANDS,
  },
  {
    processingLevel: "L1C",
    bands: L1C_BANDS,
  },
  {
    processingLevel: "L2C",
    bands: L2C_BANDS,
  },
  {
    processingLevel: "L3C",
    bands: L3C_BANDS,
  },
];

export const getBandsByLevel = (processingLevel: string) => {
  return BANDS_MASTER.filter((band) => {
    return band.processingLevel.toLowerCase() === processingLevel.toLowerCase();
  })[0].bands;
};
export const getThreeBandsByLevel = (processingLevel: string) => {
  return BANDS_MASTER.filter((band) => {
    return band.processingLevel.toLowerCase() === processingLevel.toLowerCase();
  })[0].bands.slice(0, 3);
};
export const getAllProcessingLevel = () => {
  return BANDS_MASTER.map((band) => {
    return { value: band.processingLevel, label: band.processingLevel };
  });
};

export const defaultMapConfig = {
  center: [78.9629, 20.5937],
  zoom: 4,
  maxzoom: 19,
  minzoom: 2,
  animateZoom: 4.5,
  animateZoomDuration: 2000, //in ms
};

export const mapBandsToTiTilerBands = (
  bands: {
    value: string;
    label: string;
    min: number;
    max: number;
    minLim: number;
    maxLim: number;
  }[],
  mode: mode
) => {
  const map = {
    vis: "1",
    swir: "2",
    mir: "3",
    tir1: "4",
    tir2: "5",
    wv: "6",
  };
  type mapKeys = keyof typeof map;
  const allBands = bands.map((band) => {
    return map[band.value as mapKeys];
  });
  if (mode === "singleband") {
    return [map[bands[0].value as mapKeys]];
  }
  if (mode === "bandarithmatic") {
    return [];
  } else {
    return allBands;
  }
};

export const minMaxToTiTiler = (
  bands: {
    value: string;
    label: string;
    min: number;
    max: number;
    minLim: number;
    maxLim: number;
  }[],
  mode: mode
) => {
  const allMinMax = bands.map((band) => {
    return [band.min, band.max];
  });

  return mode === "singleband" ? [allMinMax[0]] : allMinMax;
};
