/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MultiBandTab } from "./multi-band-tab";
import { SingleBandTab } from "./single-band-tab";

interface SatelliteBandDialogProps {
  trigger?: React.ReactNode;
}

export function SatelliteBandDialog({ trigger }: SatelliteBandDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const handleAdd = (data: any) => {
    console.log("Selected data:", data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Open Band Selector</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Satellite Band Selection</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="single"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Band</TabsTrigger>
            <TabsTrigger value="multi">Multi Band</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <SingleBandTab onAdd={handleAdd} />
          </TabsContent>

          <TabsContent value="multi">
            <MultiBandTab onAdd={handleAdd} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
