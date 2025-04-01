interface BandMetadata {
    STATISTICS_APPROXIMATE: string;
    STATISTICS_MAXIMUM: string;
    STATISTICS_MEAN: string;
    STATISTICS_MINIMUM: string;
    STATISTICS_STDDEV: string;
    STATISTICS_VALID_PERCENT: string;
}

interface GeoJSONProperties {
    bounds: [number, number, number, number];
    minzoom: number;
    maxzoom: number;
    band_metadata: [string, BandMetadata][];
    band_descriptions: [string, string][];
    dtype: string;
    nodata_type: string;
    colorinterp: string[];
    scales: number[];
    offsets: number[];
    driver: string;
    count: number;
    width: number;
    height: number;
    overviews: number[];
    nodata_value: number;
}

interface GeoJSON {
    type: string;
    geometry: {
        type: string;
        coordinates: number[][][];
    };
    properties: GeoJSONProperties;
}

interface GeoJSONError {
    "detail": [
        {
            "loc": [
                "string",
                0
            ],
            "msg": "string",
            "type": "string"
        }
    ]
}

type ColorMap =
    | 'accent'
    | 'accent_r'
    | 'afmhot'
    | 'afmhot_r'
    | 'algae'
    | 'algae_r'
    | 'amp'
    | 'amp_r'
    | 'autumn'
    | 'autumn_r'
    | 'balance'
    | 'balance_r'
    | 'binary'
    | 'binary_r'
    | 'blues'
    | 'blues_r'
    | 'bone'
    | 'bone_r'
    | 'brbg'
    | 'brbg_r'
    | 'brg'
    | 'brg_r'
    | 'bugn'
    | 'bugn_r'
    | 'bupu'
    | 'bupu_r'
    | 'bwr'
    | 'bwr_r'
    | 'cfastie'
    | 'cividis'
    | 'cividis_r'
    | 'cmrmap'
    | 'cmrmap_r'
    | 'cool'
    | 'cool_r'
    | 'coolwarm'
    | 'coolwarm_r'
    | 'copper'
    | 'copper_r'
    | 'cubehelix'
    | 'cubehelix_r'
    | 'curl'
    | 'curl_r'
    | 'dark2'
    | 'dark2_r'
    | 'deep'
    | 'deep_r'
    | 'delta'
    | 'delta_r'
    | 'dense'
    | 'dense_r'
    | 'diff'
    | 'diff_r'
    | 'flag'
    | 'flag_r'
    | 'gist_earth'
    | 'gist_earth_r'
    | 'gist_gray'
    | 'gist_gray_r'
    | 'gist_heat'
    | 'gist_heat_r'
    | 'gist_ncar'
    | 'gist_ncar_r'
    | 'gist_rainbow'
    | 'gist_rainbow_r'
    | 'gist_stern'
    | 'gist_stern_r'
    | 'gist_yarg'
    | 'gist_yarg_r'
    | 'gnbu'
    | 'gnbu_r'
    | 'gnuplot'
    | 'gnuplot2'
    | 'gnuplot2_r'
    | 'gnuplot_r'
    | 'gray'
    | 'gray_r'
    | 'greens'
    | 'greens_r'
    | 'greys'
    | 'greys_r'
    | 'haline'
    | 'haline_r'
    | 'hot'
    | 'hot_r'
    | 'hsv'
    | 'hsv_r'
    | 'ice'
    | 'ice_r'
    | 'inferno'
    | 'inferno_r'
    | 'jet'
    | 'jet_r'
    | 'magma'
    | 'magma_r'
    | 'matter'
    | 'matter_r'
    | 'nipy_spectral'
    | 'nipy_spectral_r'
    | 'ocean'
    | 'ocean_r'
    | 'oranges'
    | 'oranges_r'
    | 'orrd'
    | 'orrd_r'
    | 'oxy'
    | 'oxy_r'
    | 'paired'
    | 'paired_r'
    | 'pastel1'
    | 'pastel1_r'
    | 'pastel2'
    | 'pastel2_r'
    | 'phase'
    | 'phase_r'
    | 'pink'
    | 'pink_r'
    | 'piyg'
    | 'piyg_r'
    | 'plasma'
    | 'plasma_r'
    | 'prgn'
    | 'prgn_r'
    | 'prism'
    | 'prism_r'
    | 'pubu'
    | 'pubu_r'
    | 'pubugn'
    | 'pubugn_r'
    | 'puor'
    | 'puor_r'
    | 'purd'
    | 'purd_r'
    | 'purples'
    | 'purples_r'
    | 'rain'
    | 'rain_r'
    | 'rainbow'
    | 'rainbow_r'
    | 'rdbu'
    | 'rdbu_r'
    | 'rdgy'
    | 'rdgy_r'
    | 'rdpu'
    | 'rdpu_r'
    | 'rdylbu'
    | 'rdylbu_r'
    | 'rdylgn'
    | 'rdylgn_r'
    | 'reds'
    | 'reds_r'
    | 'rplumbo'
    | 'schwarzwald'
    | 'seismic'
    | 'seismic_r'
    | 'set1'
    | 'set1_r'
    | 'set2'
    | 'set2_r'
    | 'set3'
    | 'set3_r'
    | 'solar'
    | 'solar_r'
    | 'spectral'
    | 'spectral_r'
    | 'speed'
    | 'speed_r'
    | 'spring'
    | 'spring_r'
    | 'summer'
    | 'summer_r'
    | 'tab10'
    | 'tab10_r'
    | 'tab20'
    | 'tab20_r'
    | 'tab20b'
    | 'tab20b_r'
    | 'tab20c'
    | 'tab20c_r'
    | 'tarn'
    | 'tarn_r'
    | 'tempo'
    | 'tempo_r'
    | 'terrain'
    | 'terrain_r'
    | 'thermal'
    | 'thermal_r'
    | 'topo'
    | 'topo_r'
    | 'turbid'
    | 'turbid_r'
    | 'turbo'
    | 'turbo_r'
    | 'twilight'
    | 'twilight_r'
    | 'twilight_shifted'
    | 'twilight_shifted_r'
    | 'viridis'
    | 'viridis_r'
    | 'winter'
    | 'winter_r'
    | 'wistia'
    | 'wistia_r'
    | 'ylgn'
    | 'ylgn_r'
    | 'ylgnbu'
    | 'ylgnbu_r'
    | 'ylorbr'
    | 'ylorbr_r'
    | 'ylorrd'
    | 'ylorrd_r';


function isGeoJSONError(value: any): boolean {
    return (
        value &&
        value.detail instanceof Array &&
        value.detail.every((item: any) =>
            item.loc instanceof Array &&
            typeof item.loc[0] === 'string' &&
            typeof item.loc[1] === 'number' &&
            typeof item.msg === 'string' &&
            typeof item.type === 'string'
        )
    );
}

type FileFormat =
    | 'png'
    | 'npy'
    | 'tif'
    | 'jpeg'
    | 'jpg'
    | 'jp2'
    | 'webp'
    | 'pngraw';


export { type GeoJSON, type GeoJSONError, isGeoJSONError, type ColorMap, type FileFormat };