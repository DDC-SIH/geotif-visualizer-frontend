import { useRef, useState } from "react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { Input } from "../ui/input";
import { Layers } from "@/constants/consts";
import { Slider } from "../ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Plus, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { DotsVerticalIcon } from "@radix-ui/react-icons";

function LayerItem({ Layers, index, onDragStart, onDragOver, onDrop }: {
  Layers: Layers,
  index: number,
  onDragStart: (e: React.DragEvent, index: number) => void,
  onDragOver: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent, index: number) => void
}) {
  const { setLayers, Layers: allLayers, updateOpacity, updateMinMax, removeLayer } = useGeoData();
  const [minMaxError, setMinMaxError] = useState(
    Layers.bandNames.map(() => ({ minError: "", maxError: "" }))
  );
  const [minMax, setMinMax] = useState(
    Layers.minMax.map((band) => ({
      min: band.min,
      max: band.max,
    }))
  );

  // Find the index of this layer in the context
  const layerIndex = allLayers?.findIndex((layer) => layer.id === Layers.id) ?? -1;

  // Handle min/max changes for a specific band
  const handleMinMaxChange = (index: number, type: 'min' | 'max', value: number) => {
    const newMinMax = [...minMax];
    const newMinMaxError = [...minMaxError];

    if (type === 'min') {
      if (value >= Layers.minMax[index].minLim && value <= newMinMax[index].max) {
        newMinMax[index].min = value;
        newMinMaxError[index].minError = "";
      } else {
        newMinMaxError[index].minError = "Invalid";
      }
    } else {
      if (value >= newMinMax[index].min && value <= Layers.minMax[index].maxLim) {
        newMinMax[index].max = value;
        newMinMaxError[index].maxError = "";
      } else {
        newMinMaxError[index].maxError = "Invalid";
      }
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
      className=" rounded-lg mb-2 items-center flex flex-col bg-neutral-800"
    >
      <AccordionItem value={Layers.id.toString()} className="rounded-t-lg flex flex-col border-none min-w-full">



        <AccordionTrigger>
          <div className="cursor-grab active:cursor-grabbing flex items-center">
            <DotsVerticalIcon className="h-5 w-5" />
            <DotsVerticalIcon className="-ml-3 h-5 w-5" />
          </div>
          {/* <Trash2Icon
            className="h-4 w-4 cursor-pointer hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              removeLayer(layerIndex);
              setLayers((prev) => {
                return prev ? prev.filter((layer) => layer.id !== Layers.id) : [];
              });
            }}
          /> */}
          <span className="text-sm font-medium">{Layers.id}</span>


        </AccordionTrigger>



        <AccordionContent>
          {Layers.bandNames.map((bandName, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="text-sm font-medium mb-1">{bandName} Band</h4>
              <div className="grid grid-cols-2 text-background text-xs font-medium gap-2">
                <div>
                  <div className="flex justify-between">
                    Min:{" "}
                    {minMaxError[idx]?.minError && (
                      <div className="text-red-600 font-medium">
                        {minMaxError[idx].minError}
                      </div>
                    )}
                  </div>
                  <Input
                    defaultValue={minMax[idx].min}
                    className="h-[25px]"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        handleMinMaxChange(idx, 'min', value);
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between">
                    Max:{" "}
                    {minMaxError[idx]?.maxError && (
                      <div className="text-red-600 font-medium">
                        {minMaxError[idx].maxError}
                      </div>
                    )}
                  </div>
                  <Input
                    className="h-[25px]"
                    defaultValue={minMax[idx].max}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        handleMinMaxChange(idx, 'max', value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="w-full mx-auto">
            {hasMinMaxChanged() && !hasErrors() && (
              <Button
                className="mt-2 py-[0.5] px-2 text-xs font-normal h-[30px]"
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

                  // Then update the local state while preserving other properties
                  setLayers((prev) => {
                    if (!prev) return prev;
                    return prev.map((layer) => {
                      if (layer.id === Layers.id) {
                        return {
                          ...layer,
                          minMax: layer.minMax.map((band, idx) => ({
                            ...band,
                            min: minMax[idx].min,
                            max: minMax[idx].max
                          }))
                        };
                      }
                      return layer;
                    });
                  });
                }}
              >
                Apply All Changes
              </Button>
            )}
          </div>

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
      <h3 className="font-semibold mb-4 text-primary-foreground">
        Map Layers (Single Band)
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

      <Button
        className="w-full flex items-center mt-4"
        onClick={() => {
          const layer: Layers = {
            id: Math.random().toString(36).substr(2, 9), // Generate a random id
            layerType: "RGB",
            bandNames: ["SWIR", "NIR", "RED"],
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
            bandIDs: ["1", "2", "3"],
            colormap: "",
            transparency: 1,
            processingLevel: "L1B",
            layer: "",
          };
          addLayer(layer);
        }}
      >
        Add Layer <Plus className="ml-2 font-bold text-xl" />{" "}
      </Button>
    </div>
  );
}
