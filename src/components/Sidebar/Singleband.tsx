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
  const [minMaxError, setMinMaxEror] = useState({
    minError: "",
    maxError: "",
  });
  const [minMax, setMinMax] = useState({
    min: Layers.minLim,
    max: Layers.maxLim,
  });

  // Find the index of this layer in the context
  const layerIndex = allLayers.findIndex((layer) => layer.id === Layers.id);

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
        <div className="grid grid-cols-2 text-background text-xs font-medium gap-2 mt-2">
          <div>
            <div className="flex justify-between">
              Min:{" "}
              {minMaxError.minError && (
                <div className=" text-red-600 font-medium">
                  {minMaxError.minError}
                </div>
              )}
            </div>
            <Input
              defaultValue={minMax.min}
              // value={processingLevelAndBands.bands[0].min}
              className="h-[25px]"
              onChange={(e) => {
                const evnt = parseInt(e.target.value);
                if (evnt >= Layers.minLim && evnt <= minMax.max) {
                  setMinMax({
                    ...minMax,
                    min: evnt,
                  });
                  // setProcessingLevelAndBands({
                  //   ...processingLevelAndBands,
                  //   bands: bands,
                  // });
                  setMinMaxEror({ ...minMaxError, minError: "" });
                } else {
                  setMinMaxEror({ ...minMaxError, minError: "Invalid" });
                }
              }}
            />
          </div>
          <div>
            <div className="flex justify-between">
              Max:{" "}
              {minMaxError.maxError && (
                <div className=" text-red-600 font-medium">
                  {minMaxError.maxError}
                </div>
              )}
            </div>
            <Input
              className="h-[25px]"
              defaultValue={minMax.max}
              // value={processingLevelAndBands.bands[0].max}
              onChange={(e) => {
                const evnt = parseInt(e.target.value);
                if (evnt >= minMax.min && evnt <= Layers.maxLim) {
                  setMinMax({
                    ...minMax,
                    max: evnt,
                  });
                  // setProcessingLevelAndBands({
                  //   ...processingLevelAndBands,
                  //   bands: bands,
                  // });
                  setMinMaxEror({ ...minMaxError, maxError: "" });
                } else {
                  setMinMaxEror({ ...minMaxError, maxError: "Invalid" });
                }
              }}
            />
          </div>
          <div className="w-full mx-auto">
            {(minMax.min !== Layers.min ||
              minMax.max !== Layers.max) &&
              !minMaxError.minError &&
              !minMaxError.maxError && (
                <Button
                  className="mt-2 py-[0.5] px-2 text-xs font-normal h-[30px]"
                  onClick={() => {
                    // First update the min/max in the context
                    updateMinMax(
                      layerIndex,
                      minMax.min,
                      minMax.max
                    );

                    // Then update the local state while preserving other properties
                    setLayers((prev) => {
                      if (!prev) return prev;
                      return prev.map((layer) => {
                        if (layer.id === Layers.id) {
                          return {
                            ...layer, // Keep all existing properties
                            min: minMax.min,
                            max: minMax.max
                          };
                        }
                        return layer;
                      });
                    });
                  }}
                >
                  Apply
                </Button>
              )}
          </div>
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
          const layer = {
            id: Math.random().toString(36).substr(2, 9), // Generate a random id
            layerType: "Multiband",
            bandNames: ["SWIR"],
            min: 0,
            max: 1000,
            minLim: 0,
            maxLim: 1000,
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
      {/* </DialogTrigger> */}
    </div>
  );
}
