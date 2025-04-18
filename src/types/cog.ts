export interface BandData {
    band: string;
    type: string;
    originalName: string;
    source: string;
    cogId: string;
    filename: string;
    filepath: string;
    aquisition_datetime: number;
    acquisition_date: string;
    productCode: string;
    size: {
        width: number;
        height: number;
    };
    bands: {
        bandId: number;
        data_type: string;
        min: number;
        max: number;
        minimum: number;
        maximum: number;
        mean: number;
        stdDev: number;
        nodata_value: number;
        description: string;
    };
    coverage: {
        lat1: number;
        lat2: number;
        lon1: number;
        lon2: number;
    };
    cornerCoords: {
        upperLeft: [number, number];
        lowerLeft: [number, number];
        lowerRight: [number, number];
        upperRight: [number, number];
        center: [number, number];
    };
    version: string;
    revision: string;
    coordinateSystem: string;
    _id: string;
    satellite: string;
    satelliteId: string;
    processingLevel: string;
}

export interface LatestBandsResp {
    bandData: BandData[];
}

export interface CogItem {
    _id: string;
    filename: string;
    aquisition_datetime: number;
    filepath: string;
    size: {
        width: number;
        height: number;
    };
    coverage: {
        lat1: number;
        lat2: number;
        lon1: number;
        lon2: number;
    };
    cornerCoords: {
        upperLeft: [number, number];
        lowerLeft: [number, number];
        lowerRight: [number, number];
        upperRight: [number, number];
        center: [number, number];
    };
    bands: {
        bandId: number;
        data_type: string;
        min: number;
        max: number;
        minimum: number;
        maximum: number;
        mean: number;
        stdDev: number;
        nodata_value: number;
        description: string;
    }[];
    product: string;
    processingLevel: string;
    satelliteId: string;
    version: string;
    revision: string;
    satellite: string;
    coordinateSystem: string;
    type: string;
    productCode: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface CogItemResponse {
    cog: CogItem;
}
