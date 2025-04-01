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
    bands: ["TIR1", "TIR2", "MIR", "SWIR", "VIS", "WV"],
  },
  Sounder: {
    id: "Sounder",
    label: "Sounder",
    disabled: true, // Initially disabled
    bands: ["S1", "S2", "S3", "S4", "S5", "S6"],
  },
};

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
