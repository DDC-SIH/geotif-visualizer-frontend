/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MultiBandTab } from "./multi-band-tab";
import { SingleBandTab } from "./single-band-tab";
import { BandArithmeticTab } from "./band-arithmetic-tab";
import { Separator } from "@radix-ui/react-select";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/singleselector";
import {
  DEFAULT_PROCESSING_LEVEL,
  DEFAULT_SATELLITE,
  DEFAULT_TYPE,
  PROCESSING_LEVELS,
  SATELLITES,
  TYPES,
} from "@/constants/addLayerConsts";

interface SatelliteBandDialogProps {
  trigger?: React.ReactNode;
}

export function SatelliteBandDialog({ trigger }: SatelliteBandDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const [satellite, setSatellite] = useState(DEFAULT_SATELLITE);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [processingLevel, setProcessingLevel] = useState(
    DEFAULT_PROCESSING_LEVEL
  );

  // Reset type when satellite changes
  useEffect(() => {
    // Set type to first available type for the selected satellite
    const availableTypes =
      SATELLITES[satellite as keyof typeof SATELLITES].types;
    setType(availableTypes[0]);
  }, [satellite]);

  const handleAdd = (data: any) => {
    // Add satellite to the data
    const completeData = {
      ...data,
      satellite,
    };
    console.log("Selected data:", completeData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Open Band Selector</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-gray-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Satellite Band Selection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {/* Satellite Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Satellite</label>
                <Select value={satellite} onValueChange={setSatellite}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select satellite" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SATELLITES).map((sat) => (
                      <SelectItem
                        key={sat.id}
                        value={sat.id}
                        disabled={sat.disabled}
                      >
                        {sat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-white">
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
                            disabled={typeConfig.disabled ?? false}
                          >
                            {typeConfig.label}
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Processing Level Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Processing Level</label>
                <Select
                  value={processingLevel}
                  onValueChange={setProcessingLevel}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select processing level" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROCESSING_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Tabs
            defaultValue="single"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Single Band</TabsTrigger>
              <TabsTrigger value="multi">Multi Band</TabsTrigger>
              <TabsTrigger value="arithmetic">Band Arithmetic</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="single">
                <SingleBandTab
                  type={type}
                  processingLevel={processingLevel}
                  onAdd={handleAdd}
                />
              </TabsContent>

              <TabsContent value="multi">
                <MultiBandTab
                  type={type}
                  processingLevel={processingLevel}
                  onAdd={handleAdd}
                />
              </TabsContent>

              <TabsContent value="arithmetic">
                <BandArithmeticTab
                  type={type}
                  processingLevel={processingLevel}
                  onAdd={handleAdd}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
