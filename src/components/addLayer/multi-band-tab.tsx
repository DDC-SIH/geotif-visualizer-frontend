/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/singleselector";
import { Button } from "@/components/ui/button";
import { RGB_BAND_OPTIONS } from "@/constants/addLayerConsts";
import { Card, CardContent } from "../ui/card";

interface MultiBandTabProps {
  type: string;
  processingLevel: string;
  onAdd: (data: any) => void;
}

export function MultiBandTab({
  type,
  processingLevel,
  onAdd,
}: MultiBandTabProps) {
  const [redBand, setRedBand] = useState<string>("");
  const [greenBand, setGreenBand] = useState<string>("");
  const [blueBand, setBlueBand] = useState<string>("");

  const handleAdd = () => {
    if (!redBand || !greenBand || !blueBand) return;

    onAdd({
      mode: "multi",
      type,
      processingLevel,
      red: redBand,
      green: greenBand,
      blue: blueBand,
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            Red Channel (R)
          </label>
          <Select value={redBand} onValueChange={setRedBand}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select red band" />
            </SelectTrigger>
            <SelectContent>
              {RGB_BAND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
          <Select value={greenBand} onValueChange={setGreenBand}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select green band" />
            </SelectTrigger>
            <SelectContent>
              {RGB_BAND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
          <Select value={blueBand} onValueChange={setBlueBand}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select blue band" />
            </SelectTrigger>
            <SelectContent>
              {RGB_BAND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
    </Card>
  );
}
