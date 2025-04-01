import { Button } from "../ui/button";
import { useGeoData } from "../../contexts/GeoDataProvider";
import {
  fileFormats,
  GET_DOWNLOAD_URL,
  mapBandsToTiTilerBands,
  minMaxToTiTiler,
} from "@/constants/consts";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import ListItem from "./list-item";

export default function Export() {
  const { bbox, url, processingLevelAndBands, mode, bandExpression } =
    useGeoData();

  const [selectedFormat, setSelectedFormat] = useState(fileFormats[0]);
  const [searchInput, setSearchInput] = useState("");
  const downloadURL = useMemo(() => {
    return GET_DOWNLOAD_URL({
      url,
      bands: mapBandsToTiTilerBands(processingLevelAndBands.bands, mode),
      minMax: minMaxToTiTiler(processingLevelAndBands.bands, mode),
      bandExpression: bandExpression,
      mode: mode,
      bbox: bbox,
      tileFormat: selectedFormat,
    });
  }, [
    url,
    bbox,
    processingLevelAndBands,
    bandExpression,
    mode,
    selectedFormat,
  ]);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold ">Export Options</h3>
      <div className="flex flex-col">
        <Select>
          <SelectTrigger
            className={cn(
              "bg-transparent h-[27px] font-semibold text-white"
            )}
          >
            <SelectValue placeholder={selectedFormat} />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 text-white font-semibold">
            <Input
              placeholder="Search Bands..."
              value={searchInput}
              className="mb-1"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {fileFormats
              .filter((format) => format.includes(searchInput))
              .map((format) => {
                return (
                  <ListItem
                    className="hover:bg-neutral-400 bg-neutral-800"
                    onClick={() => {
                      setSelectedFormat(format);
                    }}
                    checked={selectedFormat === format}
                  >
                    {format}
                  </ListItem>
                );
              })}
          </SelectContent>
        </Select>
        {
          <Button
            className="my-2"
            onClick={() => {
              window.open(downloadURL);
              // setLink("");
            }}
          >
            Download
          </Button>
        }
      </div>
    </div>
  );
}
