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
// import { Cog } from "@/apis/req";
// import { CogData } from "@/types/cog";
import { CogItem } from "@/types/cog";
import { Layers } from "@/constants/consts";
import { convertFromTimestamp } from "@/components/Sidebar/Layers";
import { useGeoData } from "@/contexts/GeoDataProvider";
import { fetchBands } from "@/apis/req";

interface MultiBandTabProps {
  product: string;
  processingLevel: string;
  satelliteId: string;
  onAdd: (data: any) => void;
  toggleOpen?: () => void;
}

export function MultiBandTab({
  product,
  processingLevel,
  satelliteId,
  toggleOpen,
}: MultiBandTabProps) {
  const [redBand, setRedBand] = useState({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
  const [greenBand, setGreenBand] = useState({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
  const [blueBand, setBlueBand] = useState({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
  const [allBands, setAllBands] = useState<CogItem>();
  const { addLayer } = useGeoData();



  useEffect(() => {
    fetchBands({ satID: satelliteId, processingLevel: processingLevel }).then((data) => {
      console.log("MultiBand", data);
      setAllBands(data?.cog);
    })
  }, [processingLevel]);

  const handleAdd = () => {

    if (!redBand || !greenBand || !blueBand) return;
    console.log(`${allBands?.filepath || ""}/${allBands?.filename || ""}`)
    const layer: Layers = {
      id: Math.random().toString(36).substr(2, 9),
      layerType: "RGB",
      date: new Date(allBands?.aquisition_datetime as number),
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

    // setOpen(false);

  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            Red Channel (R)
          </label>
          <Select value={redBand.name} onValueChange={(val) => {
            const selectedBand = allBands?.bands.find((band) => band.description === val);
            if (selectedBand) {
              setRedBand({
                name: selectedBand.description, id: selectedBand.bandId.toString(), minMax: {
                  min: selectedBand.min,
                  max: selectedBand.max,
                  minLim: selectedBand.min,
                  maxLim: selectedBand.max,
                }
              });
            }
          }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select red band" />
            </SelectTrigger>
            <SelectContent>
              {allBands?.bands.map((option) => (
                <SelectItem key={option.bandId} value={option.description}>
                  {option.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            Green Channel (G)
          </label>
          <Select value={greenBand.name} onValueChange={(val) => {
            const selectedBand = allBands?.bands.find((band) => band.description === val);
            if (selectedBand) {
              setGreenBand({
                name: selectedBand.description, id: selectedBand.bandId.toString(), minMax: {
                  min: selectedBand.min,
                  max: selectedBand.max,
                  minLim: selectedBand.min,
                  maxLim: selectedBand.max,
                }
              });
            }
          }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select green band" />
            </SelectTrigger>
            <SelectContent>
              {allBands?.bands.map((option) => (
                <SelectItem key={option.bandId} value={option.description}>
                  {option.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            Blue Channel (B)
          </label>
          <Select value={blueBand.name} onValueChange={(val) => {
            const selectedBand = allBands?.bands.find((band) => band.description === val);
            if (selectedBand) {
              setBlueBand({
                name: selectedBand.description, id: selectedBand.bandId.toString(), minMax: {
                  min: selectedBand.min,
                  max: selectedBand.max,
                  minLim: selectedBand.min,
                  maxLim: selectedBand.max,
                }
              });
            }
          }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select blue band" />
            </SelectTrigger>
            <SelectContent>
              {allBands?.bands.map((option) => (
                <SelectItem key={option.bandId} value={option.description}>
                  {option.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full mt-6"
          onClick={handleAdd}
          disabled={!redBand || !greenBand || !blueBand}
        >
          Add RGB Composite
        </Button>
      </CardContent>
    </Card >
  );
}
