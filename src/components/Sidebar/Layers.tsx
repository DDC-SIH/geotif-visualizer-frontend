import { useState, useEffect } from "react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import {
  Accordion,
} from "../ui/accordion";
import { SatelliteBandDialog } from "../addLayer/satellite-band-dialog";
import { SingleLayerItem } from "./Layers/SingleLayerItem";
import { MultiBandLayerItem } from "./Layers/MultiBandLayerItem";
import { BandArithmaticLayerItem } from "./Layers/BandArithmaticLayerItem";


export default function LayersSection() {
  const { Layers, addLayer, reorderLayers } = useGeoData();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    if (e.currentTarget instanceof HTMLElement) {
      setTimeout(() => {
        e.currentTarget.classList.add('opacity-50');
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('opacity-50');
    }

    if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
      reorderLayers(draggedItemIndex, targetIndex);
      setDraggedItemIndex(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('opacity-50');
    }
    setDraggedItemIndex(null);
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold mb-4 text-primary-foreground flex items-center justify-between">
        <div>
          Map Layers
        </div>
        <SatelliteBandDialog />
      </h3>

      <div
        className="no-scrollbar mb-4 overflow-y-auto max-h-[calc(100vh)] pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Accordion
          type="single"
          collapsible
          className="space-y-0"
        >
          {Layers?.map((layer, index) => (
            layer.layerType === "RGB" ? (
              <MultiBandLayerItem
                key={layer.id}
                Layers={layer}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ) : layer.layerType === "Singleband" ? (
              <SingleLayerItem
                key={layer.id}
                Layers={layer}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ) : layer.layerType === "BandArithmatic" ? (
              <BandArithmaticLayerItem
                key={layer.id}
                Layers={layer}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ) : null
          ))}
        </Accordion>
      </div>

    </div>
  );
}
