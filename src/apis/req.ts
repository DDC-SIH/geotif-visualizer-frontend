import { CogItemResponse, LatestBandsResp } from "@/types/cog";
// import { format } from "date-fns";
import { Layers } from "@/constants/consts"
// import Layers 
const BACKEND_API_URL = "http://74.226.242.56:7000"


type ProductCodesResponse = {
    productCodes: string[];
};
type BandsResponse = {
    bands: string[];
};
type AvailableDate = {
    date: string; // ISO date string (YYYY-MM-DD)
    datetime: number; // Timestamp in milliseconds
};

type AvailableDatesResponse = {
    availableDates: AvailableDate[];
};
type ProcessingLevelsResponse = {
    processingLevels: string[];
};
type Satellite = {
    _id: string;
    satelliteId: string;
    name: string;
    description: string;
    launchDate: string; // ISO date string (YYYY-MM-DD)
    products: string[];
};

type SatellitesResponse = {
    message: string;
    satellites: Satellite[];
};

export const fetchAvailableDates = async (Layers: Layers): Promise<AvailableDatesResponse> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/metadata/${Layers.satID}/cog/available-dates`;
    url.searchParams.append("processingLevel", Layers.processingLevel as string);
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        console.log("Available dates:", data);
        return data;
    }
    return { availableDates: [] };
}

// const availableDates = await fetchAvailableDates()
export const fetchAvailableTimes = async (date: Date, Layers: Layers): Promise<{ aquisition_datetime: number; datetime: string }[]> => {
    const formattedDate = date ? date.toISOString().split("T")[0] : "";
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/metadata/${Layers.satID}/cog/available-times`;
    if (formattedDate) {
        url.searchParams.append("date", formattedDate);
    }
    url.searchParams.append("processingLevel", Layers.processingLevel as string);
    const res = await fetch(url.toString());
    console.log("Available times URL:", url.toString());
    if (res.ok) {
        const data = await res.json();
        return data.availableTimes;
    }
    return [];
};
export const fetchAllBands = async (date: Date, time: string, Layers: Layers): Promise<CogItemResponse | undefined> => {
    const formattedDate = date ? date.toISOString().split("T")[0] : "";
    const formattedDateTime = `${formattedDate}T${time}`;
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/metadata/${Layers.satID}/cog/show`;
    url.searchParams.append("processingLevel", Layers.processingLevel as string);
    url.searchParams.append("datetime", formattedDateTime);
    url.searchParams.append("type", "MULTI");
    if (Layers.productCode) {
        url.searchParams.append("productCode", Layers.productCode);
    }
    // url.searchParams.append("type", Layers.layerType == "Singleband" ? Layers.bandNames[0] : "MULTI");
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return undefined;
}

export const fetchBands = async (Layers: Partial<Layers>): Promise<CogItemResponse | null> => {

    const url = new URL(BACKEND_API_URL);
    url.pathname = `api/metadata/${Layers.satID}/cog/show`;
    url.searchParams.append("processingLevel", Layers.processingLevel as string);
    url.searchParams.append("type", "MULTI");
    if (Layers.productCode) {
        url.searchParams.append("productCode", Layers.productCode);
    }
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return null;
    // return undefined;
}

export const fetchSatelites = async (): Promise<SatellitesResponse> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/satellite`;
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return { message: "", satellites: [] };
}

export const fetchProcessingLevels = async (satelliteId: string): Promise<ProcessingLevelsResponse> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/product/${satelliteId}/processing-levels`;
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return { processingLevels: [] };
}

// export const fetchAllBandsWithData = async (date: Date, time: string, Layers: Layers): Promise<{

export const fetchAvailableBandNames = async (satID: string, processingLevel: string): Promise<BandsResponse> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/metadata/${satID}/${processingLevel}/all-bands`;
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return { bands: [] };
}

export const fetchAvailableProductCodes = async (satID: string, processingLevel: string): Promise<ProductCodesResponse> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/product/${satID}/${processingLevel}/product-codes`;
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return { productCodes: [] };
}

export const fetchLatestAvailableBands = async (satID: string, processingLevel: string, productCode?: string): Promise<BandsResponse> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/metadata/${satID}/${processingLevel}/all-bands`;
    if (productCode) {
        url.searchParams.append("productCode", productCode);
    }
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return { bands: [] };
};

export const fetchLatestAvailableBandsWithData = async (satID: string, processingLevel: string, productCode?: string): Promise<LatestBandsResp> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/metadata/${satID}/${processingLevel}/all-bands-with-latest-data`;
    if (productCode) {
        url.searchParams.append("productCode", productCode);
    }
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return { bandData: [] };
};

export const fetchAvailableBandsWithDateTime = async (satID: string, processingLevel: string, date: Date, time: string): Promise<LatestBandsResp> => {
    const formattedDate = date ? date.toISOString().split("T")[0] : "";
    const formattedDateTime = `${formattedDate}T${time}`;
    const url = new URL(BACKEND_API_URL);
    url.pathname = `/api/metadata/${satID}/${processingLevel}/all-bands-with-datetime`;
    url.searchParams.append("datetime", formattedDateTime);
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return { bandData: [] };
}

// export const fetchBandData = async (satID: string, processingLevel: string, band: string): Promise<CogType> => {
//     const url = new URL(BACKEND_API_URL);
//     url.pathname = `/api/metadata/${satID}/cog/show`;
//     url.searchParams.append("band", band);
//     const res = await fetch(url.toString());
//     if (res.ok) {
//         const data = await res.json();
//         return data;
//     }
//     return {} as CogType;
// }