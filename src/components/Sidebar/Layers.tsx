import { useRef, useState, useEffect } from "react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { Input } from "../ui/input";
import { BANDS_MASTER, Layers, availableColorMaps } from "@/constants/consts";
import { Slider } from "../ui/slider";
import { DualRangeSlider } from "../ui/dual-range-slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Plus, Trash2Icon, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { SatelliteBandDialog } from "../addLayer/satellite-band-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { cn } from "@/lib/utils";

function LayerItem({ Layers, index, onDragStart, onDragOver, onDrop }: {
  Layers: Layers,
  index: number,
  onDragStart: (e: React.DragEvent, index: number) => void,
  onDragOver: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent, index: number) => void
}) {
  const { setLayers, Layers: allLayers, updateOpacity, updateMinMax, removeLayer, updateColorMap } = useGeoData();
  const [minMaxError, setMinMaxError] = useState(
    Layers.bandNames.map(() => ({ minError: "", maxError: "" }))
  );
  const [minMax, setMinMax] = useState(
    Layers.minMax.map((band) => ({
      min: band.min,
      max: band.max,
    }))
  );
  const [open, setOpen] = useState(false);
  const [colorMapValue, setColorMapValue] = useState<string>(Layers.colormap || "");

  // Find the index of this layer in the context
  const layerIndex = allLayers?.findIndex((layer) => layer.id === Layers.id) ?? -1;

  // Update local state when layer properties change
  useEffect(() => {
    // Update minMax state
    setMinMax(Layers.minMax.map((band) => ({
      min: band.min,
      max: band.max,
    })));

    // Update colormap state
    setColorMapValue(Layers.colormap || "");
  }, [Layers.minMax, Layers.colormap]);

  useEffect(() => {

  }, []);

  // Handle min/max changes for a specific band
  const handleMinMaxChange = (index: number, values: number[]) => {
    const [min, max] = values;
    const newMinMax = [...minMax];
    const newMinMaxError = [...minMaxError];

    // Validate min value
    if (min >= Layers.minMax[index].minLim && min <= max) {
      newMinMax[index].min = min;
      newMinMaxError[index].minError = "";
    } else {
      newMinMaxError[index].minError = "Invalid";
    }

    // Validate max value
    if (max <= Layers.minMax[index].maxLim && max >= min) {
      newMinMax[index].max = max;
      newMinMaxError[index].maxError = "";
    } else {
      newMinMaxError[index].maxError = "Invalid";
    }

    setMinMax(newMinMax);
    setMinMaxError(newMinMaxError);
  };

  // Check if any min/max has changed
  const hasMinMaxChanged = () => {
    return minMax.some((band, idx) =>
      band.min !== Layers.minMax[idx].min || band.max !== Layers.minMax[idx].max
    );
  };

  // Check if there are any validation errors
  const hasErrors = () => {
    return minMaxError.some(error => error.minError || error.maxError);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className=" "
    >
      <AccordionItem value={Layers.id.toString()} className="rounded-t-lg flex flex-col border-none min-w-full">

        <AccordionTrigger>
          <div className="cursor-grab active:cursor-grabbing flex items-center">
            <DotsVerticalIcon className="h-5 w-5" />
            <DotsVerticalIcon className="-ml-3 h-5 w-5" />
          </div>
          <span className="text-sm font-medium">{Layers.date + "/" + Layers.processingLevel + "/" + (Layers.layerType === "Singleband" ? Layers.bandNames[0] : "RGB")}</span>
        </AccordionTrigger>

        <AccordionContent>
          {Layers.bandNames.map((bandName, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="text-sm font-medium mb-1 text-white">{bandName} Band</h4>
              <select
                className="w-full bg-neutral-800 text-white text-sm p-2 rounded"
                value={Layers.bandIDs[idx] || ""}
                onChange={(e) => {
                  const selectedBandID = e.target.value;

                  // Update the selected band ID in the context
                  const updatedLayers = [...allLayers];
                  updatedLayers[layerIndex].bandIDs[idx] = selectedBandID;
                  setLayers(updatedLayers);
                }}
              >
                {BANDS_MASTER.filter((band) => band.processingLevel === Layers.processingLevel)[0].bands.map((band) => (
                  <option key={band.value} value={band.value}>
                    {band.label}
                  </option>
                ))}
              </select>

              <div className="mb-2">
                <div className="flex justify-between text-background text-xs font-medium mb-1">
                  <div>
                    Min: {minMax[idx].min}
                    {minMaxError[idx]?.minError && (
                      <span className="text-red-600 font-medium ml-1">
                        ({minMaxError[idx].minError})
                      </span>
                    )}
                  </div>
                  <div>
                    Max: {minMax[idx].max}
                    {minMaxError[idx]?.maxError && (
                      <span className="text-red-600 font-medium ml-1">
                        ({minMaxError[idx].maxError})
                      </span>
                    )}
                  </div>
                </div>

                {/* Use the DualRangeSlider component */}
                <div className="relative mt-2">
                  <DualRangeSlider
                    value={[minMax[idx].min, minMax[idx].max]}
                    min={Layers.minMax[idx].minLim}
                    max={Layers.minMax[idx].maxLim}
                    step={1}
                    minStepsBetweenThumbs={1}
                    className="mt-2"
                    onValueChange={(values) => handleMinMaxChange(idx, values)}
                  />
                </div>

                <div className="flex justify-between text-background text-xs mt-1">
                  <span>{Layers.minMax[idx].minLim}</span>
                  <span>{Layers.minMax[idx].maxLim}</span>
                </div>
              </div>
            </div>
          ))}



          <div className="w-full flex items-start">
            {hasMinMaxChanged() && !hasErrors() && (
              <Button
                className="  mb-2 text-xs font-normal h-[30px]"
                onClick={() => {
                  // Update all bands' min/max values in the context
                  Layers.minMax.forEach((_, idx) => {
                    updateMinMax(
                      layerIndex,
                      minMax[idx].min,
                      minMax[idx].max,
                      idx // Pass band index
                    );
                  });

                  // No need to update the local state here as it will be updated through the effect
                }}
              >
                Apply
              </Button>
            )}
          </div>
          {/* ColorMap Selector - Only for Singleband layers */}
          {Layers.layerType === "Singleband" && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1 text-white">ColorMap</p>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-[30px] text-xs"
                  >
                    {colorMapValue
                      ? colorMapValue
                      : "Select colormap..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-neutral-800">
                  <Command className="">
                    <CommandInput placeholder="Search colormap..." className="h-9" />
                    <CommandEmpty>No colormap found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {availableColorMaps.map((colorMap) => (
                        <CommandItem
                          key={colorMap}
                          value={colorMap}
                          onSelect={(currentValue) => {
                            setColorMapValue(currentValue);

                            // Update layer colormap in the context
                            if (layerIndex !== -1) {
                              // Use the updateColorMap function from context
                              updateColorMap(layerIndex, currentValue);
                            }

                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              colorMapValue === colorMap ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {colorMap}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          <div>
            <p className="text-background text-xs font-medium mb-2">
              Layer Transparency
            </p>
            <Slider
              title={"Transparency"}
              value={[Layers.transparency * 100]}
              step={10}
              onValueChange={(val) => {
                const newOpacity = val[0] / 100;

                // Update React state for UI
                setLayers((prev) => {
                  return prev.map((layer) => {
                    if (layer.id === Layers.id) {
                      layer.transparency = newOpacity;
                    }
                    return layer;
                  });
                });

                // Update actual layer opacity if layer exists
                if (layerIndex !== -1) {
                  updateOpacity(layerIndex, newOpacity);
                }
              }}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export default function LayersSection() {
  const { Layers, addLayer, reorderLayers } = useGeoData();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Event handlers for HTML5 Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    // Set the drag effect and add some data to the dataTransfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    // Add a class to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      setTimeout(() => {
        e.currentTarget.classList.add('opacity-50');
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    // Remove the opacity class from dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('opacity-50');
    }

    if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
      // Call the reordering function from context
      reorderLayers(draggedItemIndex, targetIndex);
      setDraggedItemIndex(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Clean up any visual effects
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('opacity-50');
    }
    setDraggedItemIndex(null);
  };

  return (
    <div>
      <h3 className="font-semibold mb-4 text-primary-foreground flex  items-center justify-between">
        <div>

          Map Layers
        </div>
        <Button
          size={"icon"}
          variant={"secondary"}
          className=" flex items-center "
          onClick={() => {
            const layer: Layers = {
              id: Math.random().toString(36).substr(2, 9), // Generate a random id
              layerType: "Singleband",
              date: "2025-03-22",
              time: "09:15",
              bandNames: ["SWIR"],
              minMax: [{
                min: 0,
                max: 1000,
                minLim: 0,
                maxLim: 1000,
              }, {
                min: 0,
                max: 1000,
                minLim: 0,
                maxLim: 1000,
              }, {
                min: 0,
                max: 1000,
                minLim: 0,
                maxLim: 1000,
              }],
              url: "C:\\Users\\SUBINOY\\Downloads\\3RIMG_22MAR2025_0915_L1C_ASIA_MER_V01R00.cog.tif",
              bandIDs: ["1"],
              colormap: "",
              transparency: 1,
              processingLevel: "L1B",
              layer: "",
            };
            addLayer(layer);
          }}
        >
          <Plus className="font-bold " />{" "}
        </Button>
      </h3>

      <div
        className="mb-4"
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Accordion
          type="single"
          collapsible
          className="space-y-0"
        >
          {Layers?.map((layer, index) => (
            <LayerItem
              key={layer.id}
              Layers={layer}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </Accordion>
      </div>


      <SatelliteBandDialog />
    </div>
  );
}
