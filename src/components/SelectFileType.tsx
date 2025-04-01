import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { fileFormats } from "../constants/consts"
import { useGeoData } from "../contexts/GeoDataProvider";
import { FileFormat } from "types/geojson";

export function SelectFileType() {
    const { setReqInfo } = useGeoData();
    return (
        <Select onValueChange={(val) => {
            setReqInfo((prev) => ({ ...prev, format: val as FileFormat }));
        }}>
            <SelectTrigger className="min-w-full">
                <SelectValue placeholder="Select a file type" />
            </SelectTrigger>
            <SelectContent>
                {
                    fileFormats.map((fileFormat) => (
                        <SelectItem value={fileFormat}>{fileFormat}</SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    )
}
