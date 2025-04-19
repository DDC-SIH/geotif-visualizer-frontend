/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/singleselector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { CogItem } from "@/types/cog";
import { Layers } from "@/constants/consts";
import { convertFromTimestamp } from "@/utils/convertFromTimeStamp";
import { useGeoData } from "@/contexts/GeoDataProvider";
import { fetchBands } from "@/apis/req";
import { TZDate } from "react-day-picker";

interface MultiBandTabProps {
  product: string;
  processingLevel: string;
  satelliteId: string;
  onAdd: (data: any) => void;
  toggleOpen?: () => void;
}

interface BandSelection {
  name: string;
  id: string;
  minMax: {
    min: number;
    max: number;
    minLim: number;
    maxLim: number;
  };
}

export function MultiBandTab({
  product,
  processingLevel,
  satelliteId,
  toggleOpen,
}: MultiBandTabProps) {
  const [redBand, setRedBand] = useState<BandSelection>({
    name: "",
    id: "",
    minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
  });
  const [greenBand, setGreenBand] = useState<BandSelection>({
    name: "",
    id: "",
    minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
  });
  const [blueBand, setBlueBand] = useState<BandSelection>({
    name: "",
    id: "",
    minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
  });
  const [allBands, setAllBands] = useState<CogItem>();
  const [isLoading, setIsLoading] = useState(false);
  const { addLayer } = useGeoData();

  useEffect(() => {
    if (satelliteId && processingLevel) {
      setIsLoading(true);
      fetchBands({ satID: satelliteId, processingLevel: processingLevel })
        .then((data) => {
          setAllBands(data?.cog);
          // Reset band selections when data changes
          setRedBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
          setGreenBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
          setBlueBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
        })
        .catch(err => {
          console.error("Error fetching bands:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [processingLevel, satelliteId]);

  const handleAdd = () => {
    if (!redBand.name || !greenBand.name || !blueBand.name || !allBands) return;

    const layer: Layers = {
      id: Math.random().toString(36).substr(2, 9),
      layerType: "RGB",
      date: new TZDate(allBands?.aquisition_datetime as number, "UTC"),
      time: convertFromTimestamp(allBands?.aquisition_datetime as number),
      satID: satelliteId || "",
      bandNames: [redBand.name, greenBand.name, blueBand.name],
      bandIDs: [redBand.id, greenBand.id, blueBand.id],
      minMax: [redBand.minMax, greenBand.minMax, blueBand.minMax],
      url: `${allBands?.filepath || ""}/${allBands?.filename || ""}`,
      colormap: undefined,
      transparency: 1,
      processingLevel: allBands?.processingLevel,
      productCode: allBands?.productCode,
      layer: "",
    };

    addLayer(layer);
    toggleOpen && toggleOpen();
  };

  const selectBand = (channel: 'red' | 'green' | 'blue', val: string) => {
    const selectedBand = allBands?.bands.find((band) => band.description === val);
    if (!selectedBand) return;

    const bandInfo = {
      name: selectedBand.description,
      id: selectedBand.bandId.toString(),
      minMax: {
        min: selectedBand.min,
        max: selectedBand.max,
        minLim: selectedBand.minimum,
        maxLim: selectedBand.maximum,
      }
    };

    if (channel === 'red') setRedBand(bandInfo);
    if (channel === 'green') setGreenBand(bandInfo);
    if (channel === 'blue') setBlueBand(bandInfo);
  };

  const areChannelsSelected = redBand.name && greenBand.name && blueBand.name;

  return (
    <Card className="bg-neutral-800 border-neutral-700">
      <CardContent className="space-y-4 pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-4 text-neutral-400">
            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white border-r-2 border-b-2 border-neutral-600 rounded-full"></div>
            Loading bands...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Red Channel Column */}
              <div className="space-y-2">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-500 mb-1"></div>
                  <label className="text-sm font-medium text-primary-foreground text-center">
                    Red Channel
                  </label>
                </div>
                <Select
                  value={redBand.name}
                  onValueChange={(val) => selectBand('red', val)}
                  disabled={!allBands || allBands.bands.length === 0}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                    position="popper"
                    align="start"
                    sideOffset={5}
                  >
                    {allBands?.bands.map((option) => (
                      <SelectItem key={option.bandId} value={option.description} className="py-2">
                        {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {redBand.name && (
                  <div className="bg-neutral-900/50 rounded-md p-1.5 text-xs text-neutral-400 mt-1">
                    <p className="truncate" title={redBand.name}>{redBand.name}</p>
                    <p className="mt-1">ID: {redBand.id}</p>
                  </div>
                )}
              </div>

              {/* Green Channel Column */}
              <div className="space-y-2">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 mb-1"></div>
                  <label className="text-sm font-medium text-primary-foreground text-center">
                    Green Channel
                  </label>
                </div>
                <Select
                  value={greenBand.name}
                  onValueChange={(val) => selectBand('green', val)}
                  disabled={!allBands || allBands.bands.length === 0}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                    position="popper"
                    align="start"
                    sideOffset={5}
                  >
                    {allBands?.bands.map((option) => (
                      <SelectItem key={option.bandId} value={option.description} className="py-2">
                        {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {greenBand.name && (
                  <div className="bg-neutral-900/50 rounded-md p-1.5 text-xs text-neutral-400 mt-1">
                    <p className="truncate" title={greenBand.name}>{greenBand.name}</p>
                    <p className="mt-1">ID: {greenBand.id}</p>
                  </div>
                )}
              </div>

              {/* Blue Channel Column */}
              <div className="space-y-2">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 mb-1"></div>
                  <label className="text-sm font-medium text-primary-foreground text-center">
                    Blue Channel
                  </label>
                </div>
                <Select
                  value={blueBand.name}
                  onValueChange={(val) => selectBand('blue', val)}
                  disabled={!allBands || allBands.bands.length === 0}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                    position="popper"
                    align="start"
                    sideOffset={5}
                  >
                    {allBands?.bands.map((option) => (
                      <SelectItem key={option.bandId} value={option.description} className="py-2">
                        {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {blueBand.name && (
                  <div className="bg-neutral-900/50 rounded-md p-1.5 text-xs text-neutral-400 mt-1">
                    <p className="truncate" title={blueBand.name}>{blueBand.name}</p>
                    <p className="mt-1">ID: {blueBand.id}</p>
                  </div>
                )}
              </div>
            </div>

            {areChannelsSelected && (
              <div className="p-3 bg-neutral-900/50 rounded-md text-xs text-neutral-400 mt-4">
                <p className="font-medium text-center mb-2">RGB Composite Preview</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="truncate">{redBand.name}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="truncate">{greenBand.name}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span className="truncate">{blueBand.name}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full mt-4 bg-primary hover:bg-primary/90"
              onClick={handleAdd}
              disabled={!redBand.name || !greenBand.name || !blueBand.name}
            >
              Add RGB Composite
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
