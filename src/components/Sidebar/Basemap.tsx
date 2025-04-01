import { baseMaps } from "@/constants/consts";
import { Button } from "../ui/button";
import { useGeoData } from "@/contexts/GeoDataProvider";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { useState } from "react";

export default function Basemap() {
  const {
    updateBaseMap,
    selectedBasemap,
    setShapeActive,
    shapeActive,
    layerTransparency,
    setLayerTransparency,
  } = useGeoData();

  const [searchText, setSearchText] = useState("");
  return (
    <div>
      <h3 className="font-semibold mb-4 text-primary-foreground">
        Map Basemap
      </h3>

      <div className="space-y-2 grid grid-cols-1 max-h-[600px] overflow-y-auto p-2">
        <Input
          className="bg-neutral-800 text-white font-semibold"
          placeholder="Search Basemap"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <div className="max-h-[500px] flex flex-col gap-2">
          {baseMaps
            .filter((src) => {
              return src.name.toLowerCase().includes(searchText);
            })
            .map((source) => (
              <Button
                key={source?.name}
                // variant={"secondary"}
                className={cn(
                  "mb-1",
                  // "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors",
                  selectedBasemap === source
                    ? "bg-primary text-primary-foreground hover:bg-primary "
                    : ""
                )}
                onClick={() => {
                  console.log(source);
                  // setSelectedMap(source.name);
                  updateBaseMap(source);
                  setSearchText("");
                }}
              >
                {/* <img
            src={source.previewUrl}
            alt={source.name}
            className="w-16 h-16 object-cover rounded"
            /> */}
                <div>
                  <h4 className="font-medium">{source?.name}</h4>
                  {/* <p className="text-sm text-gray-500">{source.type}</p> */}
                </div>
              </Button>
            ))}
        </div>
        <div className="w-full h-[0.5px] bg-muted-foreground"></div>

        <div className="my-5 flex justify-between pb-2">
          <div className="font-semibold text-primary-foreground">
            Indian States
          </div>
          <Switch
            checked={shapeActive}
            onCheckedChange={() => setShapeActive((prev) => !prev)}
          />
        </div>
        <div className="mt-4">
          <p className="font-semibold text-primary-foreground mb-2 text-sm">
            Basemap Transparency
          </p>
          <Slider
            title={"Transparency"}
            value={[layerTransparency.baseMapLayer * 100]}
            step={10}
            onValueChange={(val) => {
              console.log(val[0]);
              setLayerTransparency({
                ...layerTransparency,
                baseMapLayer: val[0] / 100,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
