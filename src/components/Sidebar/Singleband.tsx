import { useState } from "react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { Input } from "../ui/input";
import { Layers } from "@/constants/consts";
// import { Search } from "lucide-react";
import { Slider } from "../ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { DotSquare, GrabIcon, LucideGrab, Plus, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import Layer from "ol/layer/Layer";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { add } from "ol/coordinate";
// import { set } from "ol/transform";

function LayerItem({ Layers }: { Layers: Layers }) {
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
  const layerIndex = allLayers.findIndex((layer) => layer.id === Layers.id);

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
    <AccordionItem value={Layers.id.toString()} key={Layers.id}>
      <AccordionTrigger className="flex justify-between">
        <div className="flex gap-2 items-center">
          <div className="flex cursor-grab active:cursor-grabbing">
            <DotsVerticalIcon />
            <DotsVerticalIcon className="-ml-2" />
          </div>
          3R_STD_L1B_2025_946
        </div>
        {/* <CameraIcon className="w-4"/> */}
        <Trash2Icon onClick={() => {
          removeLayer(layerIndex);
          setLayers((prev) => {
            return prev.filter((layer) => layer.id !== Layers.id);
          });
        }} />
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
  );
}

export default function LayersSection() {
  const { Layers, addLayer } = useGeoData();

  return (
    <div>
      <h3 className="font-semibold mb-4 text-primary-foreground">
        Map Layers (Single Band)
      </h3>
      <Accordion collapsible type="single">
        {Layers?.map((layer) => {
          return <LayerItem Layers={layer} />;
        })}
      </Accordion>
      {/* <DialogTrigger className="bg-transparent w-full mt-5"> */}
      <Button
        className="w-full flex items-center"
        onClick={() => {
          const layer: Layers = {
            id: Math.random().toString(36).substr(2, 9), // Generate a random id
            layerType: "RGB",
            bandNames: ["SWIR"],
            minMax: [{
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
        Add Layer <Plus className="ml-2 font-bold text-xl" />{" "}
      </Button>
      {/* </DialogTrigger> */}
    </div>
  );
}
