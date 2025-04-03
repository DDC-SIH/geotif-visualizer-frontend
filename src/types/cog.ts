export interface CogType {
    _id: string;
    name?: string;
    description?: string;
    filename: string;
    aquisition_datetime: number;
    coverage?: CoverageType;
    filepath: string;
    coordinateSystem?: any;
    size: { width: number; height: number };
    cornerCoords?: CornerCoords;
    bands: BandType[];
    // product: Types.ObjectId;
    processingLevel: string;
    version: string;
    revision: string;
    resolution?: string;
    satellite: string;
    satelliteId: string;
    type: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface CoverageType {
    lat1: number;
    lat2: number;
    lon1: number;
    lon2: number;
}

export interface CornerCoords {
    upperLeft: number[];
    lowerLeft: number[];
    lowerRight: number[];
    upperRight: number[];
    center: number[];
}

export interface BandType {
    description: string;
    bandId: number;
    data_type: string;
    min: number;
    max: number;
    minimum: number;
    maximum: number;
    mean: number;
    stdDev: number;
    nodata_value: number;
}