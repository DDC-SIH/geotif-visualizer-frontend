/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/singleselector";
import { Button } from "@/components/ui/button";
import { Card } from "antd";
import { CardContent } from "../ui/card";
import { fetchBands } from "@/apis/req";
import { CogType } from "@/types/cog";
import { Layers } from "@/constants/consts";
import { convertFromTimestamp } from "../Sidebar/Layers";
import { useGeoData } from "@/contexts/GeoDataProvider";

interface SingleBandTabProps {
  type: string;
  processingLevel: string;
  satelliteId: string;
  onAdd: (data: any) => void;
  toggleOpen?: () => void;
}

export function SingleBandTab({
  type,
  processingLevel,
  satelliteId,
  onAdd,
  toggleOpen,
}: SingleBandTabProps) {
  const [band, setBand] = useState({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
  const [allBands, setAllBands] = useState<CogType>();
  const { addLayer } = useGeoData();

  useEffect(() => {
    fetchBands({ satID: satelliteId, processingLevel: processingLevel }).then((data) => {
      setAllBands(data?.cog);
    })
  }, [processingLevel]);
  // Reset band when type changes

  const handleAdd = () => {

    if (!band) return;
    console.log(`${allBands?.filepath || ""}/${allBands?.filename || ""}`)
    const layer: Layers = {
      id: Math.random().toString(36).substr(2, 9),
      layerType: "Singleband",
      date: new Date(allBands?.aquisition_datetime as number),
      time: convertFromTimestamp(allBands?.aquisition_datetime as number),
      satID: "3R",
      bandNames: [band.name],
      bandIDs: [band.id],
      minMax: [band.minMax],
      url: `${allBands?.filepath || ""}/${allBands?.filename || ""}`,
      colormap: "",
      transparency: 1,
      processingLevel: allBands?.processingLevel,
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
          <label className="text-sm font-medium">Band Selector</label>
          <Select value={band.name} onValueChange={(val) => {

            const selectedBand = allBands?.bands.find((band) => band.description === val);
            if (selectedBand) {
              setBand({
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
              <SelectValue placeholder="Select band" />
            </SelectTrigger>
            <SelectContent>
              {allBands?.bands.map((band) => (
                <SelectItem key={band.bandId} value={band.description}>
                  {band.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full mt-6" onClick={handleAdd} disabled={!band}>
          Add Single Band
        </Button>
      </CardContent>
    </Card>
  );
}
