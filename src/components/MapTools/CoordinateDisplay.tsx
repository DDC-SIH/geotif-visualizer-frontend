import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface CoordinateDisplayProps {
  mousePosition: [number, number] | null;
  showCoords: boolean;
  setShowCoords: (show: boolean) => void;
}

export function CoordinateDisplay({ 
  mousePosition, 
  showCoords, 
  setShowCoords 
}: CoordinateDisplayProps) {
  if (!mousePosition && !showCoords) return null;
  
  if (mousePosition && showCoords) {
    return (
      <div className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur-sm p-2 rounded-md text-sm font-mono text-primary-foreground z-[1001] flex items-center gap-2 border border-neutral-800">
        <span>Lon: {mousePosition[0]}, Lat: {mousePosition[1]}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-1 text-neutral-400 hover:text-white"
          onClick={() => setShowCoords(false)}
        >
          <EyeOff size={14} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="absolute top-4 right-4 z-[1001] bg-neutral-900/80 backdrop-blur-sm border border-neutral-800"
      size="sm"
      variant="ghost"
      onClick={() => setShowCoords(true)}
    >
      <Eye size={14} className="mr-1" /> Show Coordinates
    </Button>
  );
}