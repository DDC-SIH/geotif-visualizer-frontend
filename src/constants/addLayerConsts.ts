// Satellite configuration
export const SATELLITES = {
  INSAT3R: {
    id: "INSAT3R",
    label: "INSAT3R",
    disabled: false,
    types: ["Imager", "Sounder"],
  },
  INSAT3S: {
    id: "INSAT3S",
    label: "INSAT3S",
    disabled: true, // Initially disabled
    types: ["Imager"],
  },
};

// Type configuration with associated bands
export const TYPES = {
  Imager: {
    id: "Imager",
    label: "Imager",
    disabled: false,
    bands: ["TIR1", "TIR2", "MIR", "SWIR", "VIS", "WV"],
  },
  Sounder: {
    id: "Sounder",
    label: "Sounder",
    disabled: true, // Initially disabled
    bands: ["S1", "S2", "S3", "S4", "S5", "S6"],
  },
};

// Processing levels
export const PROCESSING_LEVELS = [
  { value: "L1B", label: "L1B" },
  { value: "L1C", label: "L1C" },
  { value: "L2B", label: "L2B" },
  { value: "L2C", label: "L2C" },
  { value: "L2G", label: "L2G" },
  { value: "L3B", label: "L3B" },
  { value: "L3C", label: "L3C" },
  { value: "L3G", label: "L3G" },
];

// Band options for multi-band selector
export const RGB_BAND_OPTIONS = [
  { value: "TIR1", label: "TIR1" },
  { value: "TIR2", label: "TIR2" },
  { value: "MIR", label: "MIR" },
  { value: "SWIR", label: "SWIR" },
  { value: "VIS", label: "VIS" },
  { value: "WV", label: "WV" },
];

// Default values
export const DEFAULT_SATELLITE = "INSAT3R";
export const DEFAULT_TYPE = "Imager";
export const DEFAULT_PROCESSING_LEVEL = "L1B";
