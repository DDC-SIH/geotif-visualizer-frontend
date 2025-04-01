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
import { DotSquare, GrabIcon, LucideGrab, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import Layer from "ol/layer/Layer";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
// import { set } from "ol/transform";

function LayerItem({ Layers }: { Layers: Layers }) {
  const { setLayers } = useGeoData();
  const [minMaxError, setMinMaxEror] = useState({
    minError: "",
    maxError: "",
  });
  const [minMax, setMinMax] = useState({
    min: Layers.minLim,
    max: Layers.maxLim,
  });
  // const [transparency,setTransparency]=useState(Layers.transparency)
  return (
    <AccordionItem value={Layers.max + Layers.bandID}>
      <AccordionTrigger className="flex justify-between">
        <div className="flex gap-2 items-center">
          <div className="flex cursor-grab active:cursor-grabbing">
            <DotsVerticalIcon />
            <DotsVerticalIcon className="-ml-2" />
          </div>
          3R_STD_L1B_2025_946
        </div>
        {/* <CameraIcon className="w-4"/> */}
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
              defaultValue={Layers.minLim}
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
              defaultValue={Layers.maxLim}
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
              console.log(val[0]);
              // setTransparency(val[0]/100)
              // setLayerTransparencyFunc(Layers.id,val[0]/100)
              setLayers((prev) => {
                return prev.map((layer) => {
                  if (layer.id === Layers.id) {
                    layer.transparency = val[0] / 100;
                  }
                  return layer;
                });
              });
              // setLayerTransparency({
              //   ...layerTransparency,
              //   singleBandCOGLayer: val[0] / 100,
              // });
            }}
          />
        </div>
      </AccordionContent>
    </AccordionItem>

    // </Accordion>
  );
}
export default function LayersSection() {
  const { Layers } = useGeoData();

  return (
    <div>
      <h3 className="font-semibold mb-4 text-primary-foreground">
        Map Layers (Single Band)
      </h3>
      <Accordion collapsible type="single">
        {Layers.map((layer) => {
          return <LayerItem Layers={layer} />;
        })}
      </Accordion>
      <DialogTrigger className="bg-transparent w-full mt-5">
        <Button className="w-full flex items-center">
          Add Layer <Plus className="ml-2 font-bold text-xl" />{" "}
        </Button>
      </DialogTrigger>
    </div>
  );
}
