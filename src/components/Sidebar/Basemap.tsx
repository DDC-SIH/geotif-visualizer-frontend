import { baseMaps } from "@/constants/consts";
import { Button } from "../ui/button";
import { useGeoData } from "@/contexts/GeoDataProvider";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { useState } from "react";
import { Search, Map, Layers } from "lucide-react";

export default function Basemap() {
  const {
    updateBaseMap,
    selectedBasemap,
    layerTransparency,
    updateBaseMapOpacity,
    toggleOutlineLayer,
  } = useGeoData();

  const [searchText, setSearchText] = useState("");
  const [outLineVisible, setOutlineVisible] = useState(false);

  return (
    <div className="rounded-md bg-neutral-900/60 backdrop-blur-sm">
      <h3 className="font-semibold mb-4 text-primary-foreground flex items-center gap-2">
        <Map className="w-5 h-5" />
        Map Basemap
      </h3>

      <div className="space-y-4 max-h-[600px] overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            className="bg-neutral-800 text-white pl-9 border-neutral-700 focus:border-primary"
            placeholder="Search basemap..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value.toLowerCase())}
          />
          {searchText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchText("")}
            >
              ×
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 gap-2">
            {baseMaps
              .filter((src) => src.name.toLowerCase().includes(searchText))
              .map((source) => (
                <Button
                  key={source?.name}
                  className={cn(
                    "flex justify-start px-3 py-5 transition-all",
                    selectedBasemap === source
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-neutral-800 hover:bg-neutral-700 text-white"
                  )}
                  onClick={() => {
                    updateBaseMap(source);
                    setSearchText("");
                  }}
                >
                  <div className="text-left">
                    <h4 className="font-medium">{source?.name}</h4>
                  </div>
                </Button>
              ))}
          </div>
        </div>

        <div className="w-full h-[0.5px] bg-neutral-700 my-2"></div>

        <div className="flex items-center justify-between bg-neutral-800 p-3 rounded-md">
          <div className="font-medium text-primary-foreground flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Indian States
          </div>
          <Switch
            checked={outLineVisible}
            onCheckedChange={() => {
              setOutlineVisible((prev) => {
                const newState = !prev;
                toggleOutlineLayer(newState);
                return newState;
              });
            }}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="bg-neutral-800 p-3 rounded-md">
          <p className="font-medium text-primary-foreground mb-3 text-sm">
            Basemap Transparency
          </p>
          <Slider
            title="Transparency"
            value={[layerTransparency.baseMapLayer * 100]}
            step={5}
            min={0}
            max={100}
            className="my-2"
            onValueChange={(val) => {
              updateBaseMapOpacity(val[0] / 100);
            }}
          />

        </div>
      </div>
    </div>
  );
}
