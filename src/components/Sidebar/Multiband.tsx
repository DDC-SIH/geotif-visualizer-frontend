import { useState } from "react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  // SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import {
//   getAllProcessingLevel,
//   getBandsByLevel,
//   getThreeBandsByLevel,
// } from "@/constants/consts";
// import { Search } from "lucide-react";
import ListItem from "./list-item";
import { Slider } from "../ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

// import { set } from "ol/transform";

const PROCESSING_LEVEL = getAllProcessingLevel();
type isBandArithmaticValid = {
  valid: boolean;
  error: string | null;
};
const isBandArithmaticValid = (expression: string) => {
  console.log(expression);
  return { valid: true, error: null };
};
export default function MultibandSection() {
  const {
    processingLevelAndBands,
    setProcessingLevelAndBands,
    layerTransparency,
    setLayerTransparency,
    bandExpression,
    setBandExpression,
    setMode,
  } = useGeoData();

  const [bandArithmatic, setBandArithmatic] = useState(bandExpression);
  const [bandArithmaticError, setBandArithmaticError] = useState<string | null>(
    null
  );
  const getFilteredBands = (searchInput: string) => {
    return getBandsByLevel(processingLevelAndBands.processingLevel).filter(
      (band) => {
        return band.value.includes(searchInput);
      }
    );
  };

  function BandSelector({ bandNo }: { bandNo: number }) {
    const [searchInput, setSearchInput] = useState("");
    const [minMaxError, setMinMaxEror] = useState({
      minError: "",
      maxError: "",
    });
    const [minMax, setMinMax] = useState({
      ...processingLevelAndBands.bands[bandNo - 1],
    });
    return (
      <div className="mb-1 flex flex-col py-3">
        <p className="text-background text-xs font-medium flex flex-row justify-between">
          Band {bandNo}
          {/* {bandNo === 1 && <div className="text-red-600">(R)</div>}
          {bandNo === 2 && <div className="text-green-600">(G)</div>}
          {bandNo === 3 && <div className="text-blue-600">(B)</div>} */}
        </p>

        <Select>
          <SelectTrigger
            className={cn(
              "bg-transparent h-[27px] font-semibold",
              bandNo === 1 && "text-red-600",
              bandNo === 2 && "text-green-600",
              bandNo === 3 && "text-blue-600"
            )}
          >
            <SelectValue
              placeholder={processingLevelAndBands.bands[bandNo - 1].label}
            />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 text-background font-semibold">
            <Input
              placeholder="Search Bands..."
              value={searchInput}
              className="mb-1"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {getFilteredBands(searchInput).map((band) => {
              return (
                <ListItem
                  className="hover:bg-neutral-400 bg-neutral-800"
                  onClick={() => {
                    const updatedBands = processingLevelAndBands.bands;
                    updatedBands[bandNo - 1] = band;
                    setProcessingLevelAndBands({
                      ...processingLevelAndBands,
                      bands: updatedBands,
                    });
                    setSearchInput("");
                  }}
                  checked={
                    processingLevelAndBands.bands[bandNo - 1].value ===
                    band.value
                  }
                >
                  {band.label}
                </ListItem>
              );
            })}
          </SelectContent>
        </Select>
        {/* <PanelsTopLeft/>
        < */}

        <div className="grid grid-cols-2 text-background text-xs font-medium gap-x-8 mt-2">
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
              className="h-[25px] "
              // value={processingLevelAndBands.bands[bandNo-1].min}

              onChange={(e) => {
                const val = minMax;
                const evnt = parseInt(e.target.value);
                if (evnt >= val.minLim && evnt <= minMax.max) {
                  // setProcessingLevelAndBands({
                  //   ...processingLevelAndBands,
                  //   bands: bands,
                  // });
                  setMinMax({
                    ...minMax,
                    min: evnt,
                  });
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
              className="h-[25px] "
              defaultValue={minMax.max}
              // value={processingLevelAndBands.bands[bandNo-1].max}
              onChange={(e) => {
                const val = minMax;
                const evnt = parseInt(e.target.value);
                if (evnt >= minMax.min && evnt <= val.maxLim) {
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
            {(minMax.min !== processingLevelAndBands.bands[bandNo - 1].min ||
              minMax.max !== processingLevelAndBands.bands[bandNo - 1].max) &&
              !minMaxError.minError &&
              !minMaxError.maxError && (
                <Button
                  className="mt-2 py-[0.5] px-2 text-xs font-normal h-[30px]"
                  onClick={() => {
                    const bands = processingLevelAndBands.bands;
                    bands[bandNo - 1].min = minMax.min;
                    bands[bandNo - 1].max = minMax.max;

                    setProcessingLevelAndBands({
                      ...processingLevelAndBands,
                      bands: bands,
                    });
                  }}
                >
                  Apply
                </Button>
              )}
          </div>
        </div>
        {/* <div className="w-full h-[0.5px] bg-slate-300 mt-5"></div> */}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <h3 className="font-semibold mb-4 text-primary-foreground">
        Map Layers (Multi Band)
      </h3>
      <div className="space-y-2 grid grid-cols-1  overflow-y-auto p-2">
        <Tabs
          className="min-w-full flex flex-col justify-between"
          defaultValue="multiband"
        >
          <TabsList className="flex justify-around bg-foreground">
            <TabsTrigger
              className="text-sm bg-accent-foreground data-[state=active]:bg-primary"
              value="multiband"
              onClick={() => {
                setMode("multiband");
              }}
            >
              Composite
            </TabsTrigger>
            <TabsTrigger
              className="text-sm bg-accent-foreground data-[state=active]:bg-primary"
              value="bandarithmatic"
              onClick={() => {
                setMode("bandarithmatic");
              }}
            >
              Band Arithmatic
            </TabsTrigger>
          </TabsList>
          <TabsContent value="multiband" className="flex flex-col ">
            <div className="mb-1">
              <p className="text-background text-xs font-medium">
                Processing Level
              </p>
              <Select>
                <SelectTrigger className="bg-transparent font-semibold text-background h-[27px]">
                  <SelectValue
                    placeholder={processingLevelAndBands.processingLevel}
                  />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-background">
                  {PROCESSING_LEVEL.map((level) => {
                    return (
                      <ListItem
                        className="hover:bg-neutral-400 font-semibold"
                        onClick={() => {
                          setProcessingLevelAndBands({
                            processingLevel: level.label,
                            bands: getThreeBandsByLevel(level.label),
                          });
                        }}
                        checked={
                          processingLevelAndBands.processingLevel ===
                          level.value
                        }
                      >
                        {level.label}
                      </ListItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <BandSelector bandNo={1} />
            <BandSelector bandNo={2} />
            <BandSelector bandNo={3} />

            <div className="mb-2">
              <p className="text-background text-xs font-medium mb-2">
                Layer Transparency
              </p>

              <Slider
                title={"Transparency"}
                value={[layerTransparency.singleBandCOGLayer * 100]}
                step={10}
                onValueChange={(val) => {
                  console.log(val[0]);
                  setLayerTransparency({
                    ...layerTransparency,
                    singleBandCOGLayer: val[0] / 100,
                  });
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="bandarithmatic">
            <div className="space-y-2 grid grid-cols-1 max-h-[600px] overflow-y-auto p-2 text-background text-xs font-medium">
              <p className="text-background text-xs font-medium flex flex-row justify-between">
                Band Arithmatic
              </p>
              <Input
                placeholder="b1/b2"
                value={bandArithmatic}
                onChange={(e) => {
                  setBandArithmatic(e.target.value);
                }}
              />
              {/* <div className="">djfsahas</div> */}
              <div className="flex justify-between">
                {bandArithmaticError && (
                  <div className="text-sm text-red-50">
                    {bandArithmaticError}
                  </div>
                )}
                <Button
                  // disabled
                  onClick={() => {
                    const isValid = isBandArithmaticValid(bandArithmatic);

                    if (isValid.valid) {
                      setBandExpression(bandArithmatic);
                    } else {
                      setBandArithmaticError(isValid?.error);
                    }
                  }}
                  className="py-[0.5] px-2 text-xs font-normal h-[30px]"
                >
                  Apply
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
