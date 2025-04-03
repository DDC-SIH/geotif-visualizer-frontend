import { CogType } from "@/types/cog";
import { format } from "date-fns";
import { Layers } from "@/constants/consts"
// import Layers 
const BACKEND_API_URL = "http://192.168.1.147:7000/api/metadata"

type AvailableDate = {
    date: string; // ISO date string (YYYY-MM-DD)
    datetime: number; // Timestamp in milliseconds
};

type AvailableDatesResponse = {
    availableDates: AvailableDate[];
};


export const fetchAvailableDates = async (Layers: Layers): Promise<AvailableDatesResponse> => {
    const url = new URL(BACKEND_API_URL);
    url.pathname = url.pathname + `/${Layers.satID}/cog/available-dates`;
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
    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
    const url = new URL(BACKEND_API_URL);
    url.pathname = url.pathname + `/${Layers.satID}/cog/available-times`;
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
export const fetchAllBands = async (date: Date, time: string, Layers: Layers): Promise<{
    cog: CogType
} | undefined> => {
    const formattedDateTime = `${format(date, "yyyy-MM-dd")}T${time}`;
    const url = new URL(BACKEND_API_URL);
    url.pathname = url.pathname + `/${Layers.satID}/cog/show`;
    url.searchParams.append("processingLevel", Layers.processingLevel as string);
    url.searchParams.append("datetime", formattedDateTime);
    url.searchParams.append("type", "MULTI");
    // url.searchParams.append("type", Layers.layerType == "Singleband" ? Layers.bandNames[0] : "MULTI");
    const res = await fetch(url.toString());
    if (res.ok) {
        const data = await res.json();
        return data;
    }
    return undefined;
}