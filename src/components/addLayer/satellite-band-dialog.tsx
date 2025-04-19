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
// import { Separator } from "./ui/separator";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/singleselector";
import { Plus, Satellite, Layers, Box } from "lucide-react";
import { fetchAvailableBandNames, fetchAvailableProductCodes, fetchProcessingLevels, fetchSatelites } from "@/apis/req";

interface SatelliteBandDialogProps {
  trigger?: React.ReactNode;
}

export function SatelliteBandDialog({ trigger }: SatelliteBandDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [allSatelites, setAllSatelites] = useState<string[]>([]);
  const [satellite, setSatellite] = useState('');
  const [allProcessingLevels, setAllProcessingLevels] = useState<string[]>([]);
  const [processingLevel, setProcessingLevel] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetchSatelites().then((data) => {
        const availableSatellites = data.satellites.map((sat) => sat.satelliteId);
        setAllSatelites(availableSatellites);
        setSatellite(availableSatellites[0]); // Set default satellite

        fetchProcessingLevels(availableSatellites[0]).then((levels) => {
          const availableLevels = levels.processingLevels.map((level) => level);
          setAllProcessingLevels(availableLevels);
          setProcessingLevel(availableLevels[0]); // Set default processing level

          fetchAvailableProductCodes(availableSatellites[0], availableLevels[0]).then((data) => {
            const availableProducts = data.productCodes;
            setAvailableProducts(availableProducts);
            if (availableProducts.length > 0) {
              setSelectedProduct(availableProducts[0]);
            }
            setIsLoading(false);
          });
        });
      }).catch(err => {
        console.error("Error fetching initial data:", err);
        setIsLoading(false);
      });
    }
  }, [open]);

  useEffect(() => {
    if (satellite) {
      setIsLoading(true);
      fetchProcessingLevels(satellite).then((levels) => {
        const availableLevels = levels.processingLevels.map((level) => level);
        setAllProcessingLevels(availableLevels);
        setProcessingLevel(availableLevels[0]); // Set default processing level
        setIsLoading(false);
      }).catch(err => {
        console.error("Error fetching processing levels:", err);
        setIsLoading(false);
      });
    }
  }, [satellite]);

  useEffect(() => {
    if (satellite && processingLevel) {
      setIsLoading(true);
      fetchAvailableProductCodes(satellite, processingLevel).then((data) => {
        const availableProducts = data.productCodes;
        setAvailableProducts(availableProducts);
        if (availableProducts.length > 0) {
          setSelectedProduct(availableProducts[0]);
        }
        setIsLoading(false);
      }).catch(err => {
        console.error("Error fetching product codes:", err);
        setIsLoading(false);
      });
    }
  }, [satellite, processingLevel]);

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
        {trigger || (
          <Button
            size="icon"
            variant="outline"
            className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-w-[90vw] bg-neutral-900/90 backdrop-blur-md border-neutral-700 text-primary-foreground max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Satellite className="h-5 w-5" />
            Satellite Band Selection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-white">
          <Card className="bg-neutral-800 border-neutral-700 text-white">
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Satellite Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Satellite className="h-4 w-4" /> Satellite
                  </label>
                  <Select value={satellite} onValueChange={setSatellite} disabled={isLoading}>
                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                      <SelectValue placeholder="Select satellite" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                      {allSatelites.map((sat, index) => (
                        <SelectItem key={index} value={sat}>
                          {sat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Processing Level Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Layers className="h-4 w-4" /> Processing Level
                  </label>
                  <Select value={processingLevel} onValueChange={setProcessingLevel} disabled={isLoading}>
                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                      {allProcessingLevels.map((level, index) => (
                        <SelectItem key={index} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Box className="h-4 w-4" /> Product
                  </label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isLoading || availableProducts.length === 0}>
                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                      {availableProducts.map((product, index) => (
                        <SelectItem key={index} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Separator className="bg-neutral-700" /> */}

          <Tabs
            defaultValue="single"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-neutral-800">
              <TabsTrigger
                value="single"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Single Band
              </TabsTrigger>
              <TabsTrigger
                value="multi"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Multi Band
              </TabsTrigger>
              <TabsTrigger
                value="arithmetic"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Band Math
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-neutral-400">
                  <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-white border-r-2 border-b-2 border-neutral-600 rounded-full"></div>
                  Loading data...
                </div>
              ) : (
                <>
                  <TabsContent value="single">
                    <SingleBandTab
                      product={selectedProduct}
                      satelliteId={satellite}
                      processingLevel={processingLevel}
                      onAdd={handleAdd}
                      toggleOpen={() => setOpen(false)}
                    />
                  </TabsContent>

                  <TabsContent value="multi">
                    <MultiBandTab
                      product={selectedProduct}
                      satelliteId={satellite}
                      processingLevel={processingLevel}
                      onAdd={handleAdd}
                      toggleOpen={() => setOpen(false)}
                    />
                  </TabsContent>

                  <TabsContent value="arithmetic">
                    <div className="bg-neutral-800 p-4 rounded-md text-center">
                      <p className="text-neutral-400">Band arithmetic features coming soon</p>
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          <div className="text-xs text-neutral-400">
            {selectedProduct && !isLoading ? `Selected: ${satellite} • ${processingLevel} • ${selectedProduct}` : ""}
          </div>
   
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
