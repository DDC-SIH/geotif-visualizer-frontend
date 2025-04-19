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
import { fetchLatestAvailableBandsWithData } from "@/apis/req";
import { BandData } from "@/types/cog";
// import { CogType } from "@/types/cog";
import { Layers } from "@/constants/consts";
import { convertFromTimestamp } from "@/utils/convertFromTimeStamp";

import { useGeoData } from "@/contexts/GeoDataProvider";
import { TZDate } from "react-day-picker";

interface SingleBandTabProps {
  product: string;
  processingLevel: string;
  satelliteId: string;
  onAdd: (data: any) => void;
  toggleOpen?: () => void;
}

export function SingleBandTab({
  product,
  processingLevel,
  satelliteId,
  toggleOpen,
}: SingleBandTabProps) {
  const [band, setBand] = useState<BandData | null>(null);
  const [allBands, setAllBands] = useState<BandData[]>([]);
  const { addLayer } = useGeoData();
  
  useEffect(() => {
    fetchLatestAvailableBandsWithData(satelliteId, processingLevel, product).then((data) => {
      console.log(data);
      setAllBands(data.bandData);
      setBand(data.bandData[0]);
    })
    // fetchLatestAvailableBands(satelliteId, processingLevel, product).then((data) => {
    //   setAllBands(data.bands);
    //   setBand(data.bands[0]);
    // })

  }, [processingLevel, product]);


  // Reset band when type changes

  const handleAdd = () => {

    if (!band) return;
    const layer: Layers = {
      id: Math.random().toString(36).substr(2, 9),
      layerType: "Singleband",
      date: new TZDate(band?.aquisition_datetime as number, "UTC"),
      time: convertFromTimestamp(band?.aquisition_datetime as number),
      satID: satelliteId,
      bandNames: [band.band],
      bandIDs: [band.bands.bandId.toString()],
      minMax: [{
        min: band.bands.min,
        max: band.bands.max,
        minLim: band.bands.minimum,
        maxLim: band.bands.maximum,
      }],
      url: `${band?.filepath || ""}/${band?.filename || ""}`,
      colormap: undefined,
      transparency: 1,
      processingLevel: band?.processingLevel,
      productCode: band?.productCode,
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
          <Select value={band?.band} onValueChange={(value) => {
            const selectedBand = allBands.find((band) => band.band === value);
            setBand(selectedBand || null);
          }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select band" />
            </SelectTrigger>
            <SelectContent>
              {allBands.map((band, index) => (
                <SelectItem key={index} value={band.band}>
                  {band.band}
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
