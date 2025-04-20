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
}: CoordinateDisplayProps) {
  if (!mousePosition && !showCoords) return null;

  if (mousePosition && showCoords) {
    return (
      <div className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur-sm p-2 rounded-md text-sm font-mono text-primary-foreground z-[5] flex items-center gap-2 border border-neutral-800">
        <span>Lon: {mousePosition[0]}, Lat: {mousePosition[1]}</span>
      </div>
    );
  }

}