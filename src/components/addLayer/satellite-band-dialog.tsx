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
  // TYPES,
} from "@/constants/addLayerConsts";
import { Plus } from "lucide-react";
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
  // const [type, setType] = useState(DEFAULT_TYPE);
  const [allProcessingLevels, setAllProcessingLevels] = useState<string[]>([]);
  const [processingLevel, setProcessingLevel] = useState('');

  useEffect(() => {
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
          // setSelectedProduct(availableProducts[0]); // Set default product
        });
      });
      console.log("Available satellites:", availableSatellites);
    });
  }, []);

  useEffect(() => {
    if (satellite) {
      fetchProcessingLevels(satellite).then((levels) => {
        const availableLevels = levels.processingLevels.map((level) => level);
        setAllProcessingLevels(availableLevels);
        setProcessingLevel(availableLevels[0]); // Set default processing level
      });
    }
  }, [satellite]);

  useEffect(() => {
    if (satellite && processingLevel) {
      fetchAvailableProductCodes(satellite, processingLevel).then((data) => {
        const availableProducts = data.productCodes;
        setAvailableProducts(availableProducts);
        setSelectedProduct(availableProducts[0]); // Set default product

      });
    }
  }, [satellite, processingLevel]);

  useEffect(() => { }, [])

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
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button
          size={"icon"}
          variant={"secondary"}
          className="flex items-center"

        >
          <Plus className="font-bold" />{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-gray-50 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Satellite Band Selection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Satellite Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Satellite</label>
                  <Select value={satellite} onValueChange={setSatellite}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select satellite" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="text-sm font-medium">Processing Level</label>
                  <Select value={processingLevel} onValueChange={setProcessingLevel}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select processing level" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="text-sm font-medium">Product</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
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

              {/* <TabsContent value="arithmetic">
                <BandArithmeticTab
                  // type={type}
                  processingLevel={processingLevel}
                  onAdd={handleAdd}

                />
              </TabsContent> */}
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
