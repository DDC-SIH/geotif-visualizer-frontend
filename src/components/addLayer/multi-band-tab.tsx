/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/SingleSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RGB_BAND_OPTIONS } from "@/constants/addLayerConsts";

interface MultiBandTabProps {
  onAdd: (data: any) => void;
}

export function MultiBandTab({ onAdd }: MultiBandTabProps) {
  const [redBand, setRedBand] = useState<string>("");
  const [greenBand, setGreenBand] = useState<string>("");
  const [blueBand, setBlueBand] = useState<string>("");
  const [bandArithmetic, setBandArithmetic] = useState<string>("");

  const handleAdd = () => {
    if (!redBand || !greenBand || !blueBand) return;

    onAdd({
      mode: "multi",
      red: redBand,
      green: greenBand,
      blue: blueBand,
      arithmetic: bandArithmetic,
    });
  };

  return (
    <div className="space-y-4 py-2 ">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-red-500">
            Red Channel (R)
          </label>
          <Select value={redBand} onValueChange={setRedBand}>
            <SelectTrigger>
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
          <label className="text-sm font-medium text-green-500">
            Green Channel (G)
          </label>
          <Select value={greenBand} onValueChange={setGreenBand}>
            <SelectTrigger>
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
          <label className="text-sm font-medium text-blue-500">
            Blue Channel (B)
          </label>
          <Select value={blueBand} onValueChange={setBlueBand}>
            <SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Band Arithmetic (Optional)
        </label>
        <Input
          placeholder="Enter band arithmetic expression"
          value={bandArithmetic}
          onChange={(e) => setBandArithmetic(e.target.value)}
        />
      </div>

      <Button
        className="w-full mt-4"
        onClick={handleAdd}
        disabled={!redBand || !greenBand || !blueBand}
      >
        Add
      </Button>
    </div>
  );
}
