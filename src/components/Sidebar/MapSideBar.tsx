import {
  Sparkles,
  MapIcon,
  DownloadCloud,
  Layers,
  // LayoutTemplate,
  Settings2,
  BoxSelectIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Export from "./Export";
import ProcessingTemplates from "./processingTemplates";
import { useGeoData } from "@/contexts/GeoDataProvider";
import Basemap from "./Basemap";
import LayersSection from "./Singleband";
import MultibandSection from "./Multiband";

function MapSideBar() {
  const { mode, setMode } = useGeoData();
  const [activeSidebar, setActiveSidebar] = useState<string | null>(mode);

  return (
    
    <div className="fixed left-0 top-0 flex h-full pointer-events-auto z-[2] bg-neutral-900 ">
      {/* Icons Bar */}
      <div className=" flex flex-col justify-between  z-[2]">
        <div className="flex flex-col ">
          <Button
            size="icon"
            className={`rounded-none bg-foreground p-8 active:border-0 active:outline-none focus:border-0 focus:outline-none ${
              activeSidebar === "singleband" ? "bg-neutral-500" : ""
            } ${
              activeSidebar === "singleband"
                ? "hover:bg-neutral-400"
                : "hover:bg-neutral-800"
            }`}
            onClick={() => {
              setActiveSidebar(
                activeSidebar === "singleband" ? null : "singleband"
              );
              setMode("singleband");
            }}
          >
            <BoxSelectIcon
              className={`h-8 w-8 ${
                activeSidebar === "singleband"
                  ? "text-primary-foreground"
                  : "text-white"
              }`}
            />
          </Button>
          <Button
            size="icon"
            className={`rounded-none bg-foreground p-8 active:border-0 active:outline-none focus:border-0 focus:outline-none ${
              activeSidebar === "multiband" ? "bg-neutral-500" : ""
            } ${
              activeSidebar === "multiband"
                ? "hover:bg-neutral-400"
                : "hover:bg-neutral-800"
            }`}
            onClick={() => {
              setActiveSidebar(
                activeSidebar === "multiband" ? null : "multiband"
              );
              setMode("multiband");
            }}
          >
            <Layers
              className={`h-8 w-8 ${
                activeSidebar === "singleband"
                  ? "text-primary-foreground"
                  : "text-white"
              }`}
            />
          </Button>
          <Button
            size="icon"
            className={`rounded-none bg-foreground p-8 active:border-0 active:outline-none focus:border-0 focus:outline-none ${
              activeSidebar === "basemap" ? "bg-neutral-500" : ""
            } ${
              activeSidebar === "basemap"
                ? "hover:bg-neutral-400"
                : "hover:bg-neutral-800"
            }`}
            onClick={() =>
              setActiveSidebar(activeSidebar === "basemap" ? null : "basemap")
            }
          >
            <MapIcon
              className={`h-8 w-8 ${
                activeSidebar === "basemap"
                  ? "text-primary-foreground"
                  : "text-white"
              }`}
            />
          </Button>
          <Button
            size="icon"
            // variant={activeSidebar === "effects" ? "secondary" : "destructive"}
            className={`rounded-none bg-foreground p-8 active:border-0 active:outline-none focus:border-0 focus:outline-none ${
              activeSidebar === "effects" ? "bg-neutral-500" : ""
            } ${
              activeSidebar === "effects"
                ? "hover:bg-neutral-400"
                : "hover:bg-neutral-800"
            }`}
            onClick={() =>
              setActiveSidebar(activeSidebar === "effects" ? null : "effects")
            }
          >
            <Sparkles
              className={`h-8 w-8 ${
                activeSidebar === "effects"
                  ? "text-primary-foreground"
                  : "text-white"
              }`}
            />
          </Button>
          <Button
            size="icon"
            className={`rounded-none bg-foreground p-8 active:border-0 active:outline-none focus:border-0 focus:outline-none ${
              activeSidebar === "maptools" ? "bg-neutral-500" : ""
            } ${
              activeSidebar === "maptools"
                ? "hover:bg-neutral-400"
                : "hover:bg-neutral-800"
            }`}
            onClick={() =>
              setActiveSidebar(activeSidebar === "maptools" ? null : "maptools")
            }
          >
            <Settings2
              className={`h-8 w-8 ${
                activeSidebar === "maptools"
                  ? "text-primary-foreground"
                  : "text-white"
              }`}
            />
          </Button>

          <Button
            size="icon"
            className={`rounded-none bg-foreground p-8 active:border-0 active:outline-none focus:border-0 focus:outline-none ${
              activeSidebar === "export" ? "bg-neutral-500" : ""
            } ${
              activeSidebar === "export"
                ? "hover:bg-neutral-400"
                : "hover:bg-neutral-800"
            }`}
            onClick={() =>
              setActiveSidebar(activeSidebar === "export" ? null : "export")
            }
          >
            <DownloadCloud
              className={`h-8 w-8 ${
                activeSidebar === "export"
                  ? "text-primary-foreground"
                  : "text-white"
              }`}
            />
          </Button>
        </div>
        {/* <MapUserPopup isLoggedIn={isLoggedIn} /> */}
      </div>

      {/* Expandable Section */}
      <div
        className={cn(
          "h-full   transition-all duration-200 ease-out z-[9998]",
          activeSidebar ? "w-[300px]" : "w-0 overflow-hidden"
        )}
      >
        <div
          className={cn(
            "w-[300px] h-full p-4",
            activeSidebar
              ? "opacity-100 transition-opacity duration-200 delay-150"
              : "opacity-0"
          )}
        >
          {activeSidebar === "ProcessingTemplates" && <ProcessingTemplates />}
          {activeSidebar === "basemap" && <Basemap />}
          {activeSidebar === "singleband" && <LayersSection />}
          {activeSidebar === "export" && <Export />}
          {activeSidebar === "multiband" && <MultibandSection />}
        </div>
      </div>
    </div>
  );
}

export default MapSideBar;
