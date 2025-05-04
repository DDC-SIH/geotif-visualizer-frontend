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
import { Card, CardContent } from "../ui/card";
import { fetchLatestAvailableBandsWithData } from "@/apis/req";
import { BandData } from "@/types/cog";
import { Layers } from "@/constants/consts";
import { convertFromTimestamp } from "@/utils/convertFromTimeStamp";
import { useGeoData } from "@/contexts/GeoDataProvider";
import { TZDate } from "react-day-picker";
import { LayersIcon } from "lucide-react";

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
  const [allSingleBands, setAllSingleBands] = useState<BandData[]>([]);
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const { addLayer } = useGeoData();

  useEffect(() => {
    if (satelliteId && processingLevel && product) {
      setIsSingleLoading(true);
      fetchLatestAvailableBandsWithData(satelliteId, processingLevel, product)
        .then((data) => {
          setAllSingleBands(data.bandData || []);
          if (data.bandData && data.bandData.length > 0) {
            setBand(data.bandData[0]);
          }
        })
        .catch(err => {
          console.error("Error fetching band data:", err);
        })
        .finally(() => {
          setIsSingleLoading(false);
        });
    }
  }, [processingLevel, product, satelliteId]);

  const handleAdd = () => {
    if (!band) return;
    const date = new TZDate(band?.aquisition_datetime as number, "UTC");
    const time = convertFromTimestamp(band?.aquisition_datetime as number);
    const layer: Layers = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${date?.toISOString().split("T")[0] || ""} / ${time} / ${processingLevel} / ${product} /  ${band.band}`,
      layerType: "Singleband",
      date: date,
      time: time,
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
      colormap: "gray",
      transparency: 1,
      processingLevel: band?.processingLevel,
      productCode: band?.productCode,
      layer: "",
    };

    addLayer(layer);
    toggleOpen && toggleOpen();
  };

  return (
    <Card className="bg-neutral-800 border-neutral-700">
      <CardContent className="space-y-4 pt-6">
        {isSingleLoading ? (
          <div className="flex items-center justify-center p-4 text-neutral-400">
            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white border-r-2 border-b-2 border-neutral-600 rounded-full"></div>
            Loading bands...
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-foreground flex items-center gap-1">
                <LayersIcon className="h-4 w-4" /> Band Selection
              </label>
              <Select
                value={band?.band || ''}
                onValueChange={(value) => {
                  const selectedBand = allSingleBands.find((b) => b.band === value);
                  setBand(selectedBand || null);
                }}
                disabled={allSingleBands.length === 0}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                  <SelectValue placeholder="Select a band" />
                </SelectTrigger>
                <SelectContent
                  className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                  position="popper"
                  align="start"
                  sideOffset={5}
                >
                  {allSingleBands.length > 0 ? allSingleBands.map((band, index) => (
                    <SelectItem key={index} value={band.band} className="py-2.5">
                      {band.band}
                    </SelectItem>
                  )) : (
                    <SelectItem value="none" disabled>No bands available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {band && (
              <div className="p-2 bg-neutral-900/50 rounded-md text-xs text-neutral-400 ">
                <p className="mt-1">Date: {new Date(band.aquisition_datetime).toLocaleDateString()}</p>
              </div>
            )}

            <Button
              className="w-full mt-4 bg-primary hover:bg-primary/90"
              onClick={handleAdd}
              disabled={!band}
            >
              Add Single Band
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
