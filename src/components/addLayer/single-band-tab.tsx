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
import { TYPES } from "@/constants/addLayerConsts";
import { Card } from "antd";
import { CardContent } from "../ui/card";

interface SingleBandTabProps {
  type: string;
  processingLevel: string;
  onAdd: (data: any) => void;
}

export function SingleBandTab({
  type,
  processingLevel,
  onAdd,
}: SingleBandTabProps) {
  const [band, setBand] = useState<string>("");

  // Reset band when type changes
  useEffect(() => {
    setBand("");
  }, [type]);

  const handleAdd = () => {
    if (!band) return;

    onAdd({
      mode: "single",
      type,
      processingLevel,
      band,
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Band Selector</label>
          <Select value={band} onValueChange={setBand}>
            <SelectTrigger className="bg-white">
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

        <Button className="w-full mt-6" onClick={handleAdd} disabled={!band}>
          Add Single Band
        </Button>
      </CardContent>
    </Card>
  );
}
