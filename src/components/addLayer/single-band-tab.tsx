/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/SingleSelector";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_SATELLITE,
  DEFAULT_TYPE,
  SATELLITES,
  TYPES,
} from "@/constants/addLayerConsts";

interface SingleBandTabProps {
  onAdd: (data: any) => void;
}

export function SingleBandTab({ onAdd }: SingleBandTabProps) {
  const [satellite, setSatellite] = useState(DEFAULT_SATELLITE);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [band, setBand] = useState<string>("");

  // Reset type when satellite changes
  useEffect(() => {
    // Set type to first available type for the selected satellite
    const availableTypes =
      SATELLITES[satellite as keyof typeof SATELLITES].types;
    setType(availableTypes[0]);
  }, [satellite]);

  // Reset band when type changes
  useEffect(() => {
    setBand("");
  }, [type]);

  const handleAdd = () => {
    if (!band) return;

    onAdd({
      mode: "single",
      satellite,
      type,
      band,
    });
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Satellite Selector</label>
        <Select value={satellite} onValueChange={setSatellite}>
          <SelectTrigger>
            <SelectValue placeholder="Select satellite" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(SATELLITES).map((sat) => (
              <SelectItem key={sat.id} value={sat.id} disabled={sat.disabled}>
                {sat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {SATELLITES[satellite as keyof typeof SATELLITES].types.map(
              (typeId) => {
                const typeConfig = TYPES[typeId as keyof typeof TYPES];
                return (
                  <SelectItem
                    key={typeConfig.id}
                    value={typeConfig.id}
                    disabled={
                      "disabled" in typeConfig ? typeConfig.disabled : false
                    }
                  >
                    {typeConfig.label}
                  </SelectItem>
                );
              }
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Band Selector</label>
        <Select value={band} onValueChange={setBand}>
          <SelectTrigger>
            <SelectValue placeholder="Select band" />
          </SelectTrigger>
          <SelectContent>
            {TYPES[type as keyof typeof TYPES].bands.map((bandOption) => (
              <SelectItem key={bandOption} value={bandOption}>
                {bandOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full mt-4" onClick={handleAdd} disabled={!band}>
        Add
      </Button>
    </div>
  );
}
