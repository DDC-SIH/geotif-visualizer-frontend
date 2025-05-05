/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/singleselector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { CogItem } from "@/types/cog";
import { Layers } from "@/constants/consts";
import { convertFromTimestamp } from "@/utils/convertFromTimeStamp";
import { useGeoData } from "@/contexts/GeoDataProvider";
import { fetchBands } from "@/apis/req";
import { TZDate } from "react-day-picker";

interface MultiBandTabProps {
  product: string;
  processingLevel: string;
  satelliteId: string;
  onAdd: (data: any) => void;
  toggleOpen?: () => void;
}

interface BandSelection {
  name: string;
  id: string;
  minMax: {
    min: number;
    max: number;
    minLim: number;
    maxLim: number;
  };
}

interface BandPreset {
  name: string;
  description: string;
  bands: {
    red: string;
    green: string;
    blue: string;
  };
}

export function MultiBandTab({
  product,
  processingLevel,
  satelliteId,
  toggleOpen,
}: MultiBandTabProps) {
  const [redBand, setRedBand] = useState<BandSelection>({
    name: "",
    id: "",
    minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
  });
  const [greenBand, setGreenBand] = useState<BandSelection>({
    name: "",
    id: "",
    minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
  });
  const [blueBand, setBlueBand] = useState<BandSelection>({
    name: "",
    id: "",
    minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [allBands, setAllBands] = useState<CogItem>();
  const [presets, setPresets] = useState<BandPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addLayer } = useGeoData();

  useEffect(() => {
    if (satelliteId && processingLevel) {
      setIsLoading(true);
      fetchBands({ satID: satelliteId, processingLevel: processingLevel, productCode: product })
        .then((data) => {
          setAllBands(data?.cog);
          // Reset band selections when data changes
          setRedBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
          setGreenBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
          setBlueBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
          setSelectedPreset("");

          // Generate presets based on available bands
          generatePresets(data?.cog?.bands || []);
        })
        .catch(err => {
          console.error("Error fetching bands:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [processingLevel, satelliteId, product]);

  // Generate preset options based on available bands
  const generatePresets = (bands: any[]) => {
    const availablePresets: BandPreset[] = [];

    // Check for band presence
    const hasVIS = bands.some(b => b.description === "VIS");
    const hasSWIR = bands.some(b => b.description === "SWIR");
    const hasTIR1 = bands.some(b => b.description === "TIR1");
    const hasTIR2 = bands.some(b => b.description === "TIR2");
    const hasMIR = bands.some(b => b.description === "MIR");
    const hasWV = bands.some(b => b.description === "WV");

    // Check for radiance bands
    const hasVISRad = bands.some(b => b.description === "VIS_RADIANCE");
    const hasSWIRRad = bands.some(b => b.description === "SWIR_RADIANCE");
    const hasTIR1Rad = bands.some(b => b.description === "TIR1_RADIANCE");

    // Check for temperature bands
    const hasTIR1Temp = bands.some(b => b.description === "TIR1_TEMP");
    const hasTIR2Temp = bands.some(b => b.description === "TIR2_TEMP");
    const hasMIRTemp = bands.some(b => b.description === "MIR_TEMP");

    // Natural Color-like composite (if available)
    if (hasVIS && hasSWIR && hasMIR) {
      availablePresets.push({
        name: "Natural Color Approximation",
        description: "VIS (Red), SWIR (Green), MIR (Blue)",
        bands: {
          red: "VIS",
          green: "SWIR",
          blue: "MIR"
        }
      });
    }

    // Thermal composite
    if (hasTIR1 && hasTIR2 && hasMIR) {
      availablePresets.push({
        name: "Thermal Composite",
        description: "TIR1 (Red), TIR2 (Green), MIR (Blue)",
        bands: {
          red: "TIR1",
          green: "TIR2",
          blue: "MIR"
        }
      });
    }

    // Thermal Temperature Analysis
    if (hasTIR1Temp && hasTIR2Temp && hasMIRTemp) {
      availablePresets.push({
        name: "Temperature Analysis",
        description: "TIR1_TEMP (Red), TIR2_TEMP (Green), MIR_TEMP (Blue)",
        bands: {
          red: "TIR1_TEMP",
          green: "TIR2_TEMP",
          blue: "MIR_TEMP"
        }
      });
    }

    // Moisture/Weather Analysis
    if (hasWV && hasSWIR && hasVIS) {
      availablePresets.push({
        name: "Moisture Analysis",
        description: "WV (Red), SWIR (Green), VIS (Blue)",
        bands: {
          red: "WV",
          green: "SWIR",
          blue: "VIS"
        }
      });
    }

    // Radiance Analysis
    if (hasVISRad && hasSWIRRad && hasTIR1Rad) {
      availablePresets.push({
        name: "Radiance Analysis",
        description: "VIS_RADIANCE (Red), SWIR_RADIANCE (Green), TIR1_RADIANCE (Blue)",
        bands: {
          red: "VIS_RADIANCE",
          green: "SWIR_RADIANCE",
          blue: "TIR1_RADIANCE"
        }
      });
    }

    setPresets(availablePresets);
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);

    if (!preset) return;

    const selectedPresetObj = presets.find(p => p.name === preset);
    if (!selectedPresetObj || !allBands) return;

    // Set bands based on the preset
    selectBand('red', selectedPresetObj.bands.red);
    selectBand('green', selectedPresetObj.bands.green);
    selectBand('blue', selectedPresetObj.bands.blue);
  };

  const handleAdd = () => {
    if (!redBand.name || !greenBand.name || !blueBand.name || !allBands) return;
    const date = new TZDate(allBands?.aquisition_datetime as number, "UTC");
    const time = convertFromTimestamp(allBands?.aquisition_datetime as number);

    // Use the preset name in the layer name if a preset was selected
    const presetName = selectedPreset ? ` (${selectedPreset})` : "";

    const layer: Layers = {
      name: `${date?.toISOString().split("T")[0] || ""} / ${time} / ${processingLevel} / ${product} / RGB${presetName}`,
      id: Math.random().toString(36).substr(2, 9),
      layerType: "RGB",
      date: new TZDate(allBands?.aquisition_datetime as number, "UTC"),
      time: convertFromTimestamp(allBands?.aquisition_datetime as number),
      satID: satelliteId || "",
      bandNames: [redBand.name, greenBand.name, blueBand.name],
      bandIDs: [redBand.id, greenBand.id, blueBand.id],
      minMax: [redBand.minMax, greenBand.minMax, blueBand.minMax],
      url: `${allBands?.filepath || ""}/${allBands?.filename || ""}`,
      colormap: undefined,
      transparency: 1,
      processingLevel: allBands?.processingLevel,
      productCode: allBands?.productCode,
      layer: "",
    };

    addLayer(layer);
    toggleOpen && toggleOpen();
  };

  const selectBand = (channel: 'red' | 'green' | 'blue', val: string) => {
    const selectedBand = allBands?.bands.find((band) => band.description === val);
    if (!selectedBand) return;

    const bandInfo = {
      name: selectedBand.description,
      id: selectedBand.bandId.toString(),
      minMax: {
        min: selectedBand.min,
        max: selectedBand.max,
        minLim: selectedBand.minimum,
        maxLim: selectedBand.maximum,
      }
    };

    if (channel === 'red') setRedBand(bandInfo);
    if (channel === 'green') setGreenBand(bandInfo);
    if (channel === 'blue') setBlueBand(bandInfo);
  };

  const areChannelsSelected = redBand.name && greenBand.name && blueBand.name;

  return (
    <Card className="bg-neutral-800 border-neutral-700">
      <CardContent className="space-y-4 pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-4 text-neutral-400">
            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white border-r-2 border-b-2 border-neutral-600 rounded-full"></div>
            Loading bands...
          </div>
        ) : (
          <>
            {/* Preset Selection */}
            {presets.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-primary-foreground block mb-2">
                  Band Presets
                </label>
                <Select
                  value={selectedPreset}
                  onValueChange={handlePresetChange}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                    <SelectValue placeholder="Select a band combination" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-neutral-900 border-neutral-700 text-primary-foreground"
                    position="popper"
                    align="start"
                    sideOffset={5}
                  >

                    {presets.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name} className="py-2">
                        <div>
                          <span className="font-medium">{preset.name}</span>
                          <span className="text-xs block text-neutral-400">{preset.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Red Channel Column */}
              <div className="space-y-2">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-500 mb-1"></div>
                  <label className="text-sm font-medium text-primary-foreground text-center">
                    Red Channel
                  </label>
                </div>
                <Select
                  value={redBand.name}
                  onValueChange={(val) => {
                    selectBand('red', val);
                    setSelectedPreset("");  // Clear preset when manual selection is made
                  }}
                  disabled={!allBands || allBands.bands.length === 0}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                    position="popper"
                    align="start"
                    sideOffset={5}
                  >
                    {allBands?.bands.map((option) => (
                      <SelectItem key={option.bandId} value={option.description} className="py-2">
                        {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Green Channel Column */}
              <div className="space-y-2">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 mb-1"></div>
                  <label className="text-sm font-medium text-primary-foreground text-center">
                    Green Channel
                  </label>
                </div>
                <Select
                  value={greenBand.name}
                  onValueChange={(val) => {
                    selectBand('green', val);
                    setSelectedPreset("");  // Clear preset when manual selection is made
                  }}
                  disabled={!allBands || allBands.bands.length === 0}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                    position="popper"
                    align="start"
                    sideOffset={5}
                  >
                    {allBands?.bands.map((option) => (
                      <SelectItem key={option.bandId} value={option.description} className="py-2">
                        {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Blue Channel Column */}
              <div className="space-y-2">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 mb-1"></div>
                  <label className="text-sm font-medium text-primary-foreground text-center">
                    Blue Channel
                  </label>
                </div>
                <Select
                  value={blueBand.name}
                  onValueChange={(val) => {
                    selectBand('blue', val);
                    setSelectedPreset("");  // Clear preset when manual selection is made
                  }}
                  disabled={!allBands || allBands.bands.length === 0}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                    position="popper"
                    align="start"
                    sideOffset={5}
                  >
                    {allBands?.bands.map((option) => (
                      <SelectItem key={option.bandId} value={option.description} className="py-2">
                        {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {allBands && (
              <div className="p-2 bg-neutral-900/50 rounded-md text-xs text-neutral-400 ">
                <p className="">Date: {new Date(allBands.aquisition_datetime).toLocaleDateString()}</p>
                {selectedPreset && (
                  <p className="mt-1">Preset: {selectedPreset}</p>
                )}
              </div>
            )}
            <Button
              className="w-full  bg-primary hover:bg-primary/90"
              onClick={handleAdd}
              disabled={!redBand.name || !greenBand.name || !blueBand.name}
            >
              Add RGB Composite
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
