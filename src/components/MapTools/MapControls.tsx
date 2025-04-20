import { Button } from "@/components/ui/button";
import { Search, ZoomIn, ZoomOut, Maximize, Eye, EyeOff } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleSearch: () => void;
  showCoords: boolean;
  setShowCoords: (show: boolean) => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleSearch,
  showCoords,
  setShowCoords,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-[1000]">
      <Button
        onClick={() => setShowCoords(!showCoords)}
        className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
        title="Search"
        variant="outline"
      >{
          showCoords ? <EyeOff size={16} className="text-white" /> : <Eye size={16} className="text-white" />
        }
      </Button>
      <Button
        onClick={onZoomIn}
        className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
        title="Zoom In"
        variant="outline"
      >
        <ZoomIn size={18} className="text-white" />
      </Button>

      <Button
        onClick={onZoomOut}
        className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
        title="Zoom Out"
        variant="outline"
      >
        <ZoomOut size={18} className="text-white" />
      </Button>

      <Button
        onClick={onFitView}
        className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
        title="Fit to Default View"
        variant="outline"
      >
        <Maximize size={16} className="text-white" />
      </Button>

      <Button
        onClick={onToggleSearch}
        className="w-10 h-10 p-0 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
        title="Search"
        variant="outline"
      >
        <Search size={16} className="text-white" />
      </Button>
      


    </div>
  );
}