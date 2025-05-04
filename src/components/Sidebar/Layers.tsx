import { useState, useEffect } from "react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { SatelliteBandDialog } from "../addLayer/satellite-band-dialog";
import { SingleLayerItem } from "./Layers/SingleLayerItem";
import { MultiBandLayerItem } from "./Layers/MultiBandLayerItem";
import { BandArithmaticLayerItem } from "./Layers/BandArithmaticLayerItem";
import { Button } from "../ui/button";
import { DOWNLOADER_BASE_URL, fileFormats, GET_FINAL_DOWNLOAD_URL } from "@/constants/consts";
import { Select, SelectContent, SelectTrigger } from "../ui/select";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import ListItem from "./list-item";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Loader2, Download, Search, ExternalLink } from "lucide-react";
import { FileFormat } from "types/geojson";

export default function LayersSection() {
  const { Layers, addLayer, reorderLayers, bbox } = useGeoData();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Export related states
  const [selectedFormat, setSelectedFormat] = useState(fileFormats[0]);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRawLoading, setIsRawLoading] = useState(false);
  const [sendBBOX, setSendBBOX] = useState(false);

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

  // Get the visible layers (we'll use all layers instead of selected ones)
  const getVisibleLayersData = () => {
    if (!Layers) return [];
    return Layers.filter(layer => layer.visible);
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
        className="no-scrollbar mb-4 overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
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

      {/* Export Accordion */}
      <div className="mt-auto rounded-md bg-neutral-900/60 backdrop-blur-sm">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="export" className="border-none">
            <AccordionTrigger className="py-2 px-3 text-primary-foreground hover:bg-neutral-800/50 rounded-md">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="font-semibold">Export Options</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-3 pt-2 space-y-3">
              {/* Export Format Selection */}
              <div className="bg-neutral-800 p-2 rounded-md">
                <label className="text-sm font-medium text-white mb-1 block">Export Format</label>
                <div className="relative">
                  <Select onValueChange={(val) => {
                    setSelectedFormat(val as FileFormat);
                  }} value={selectedFormat}>
                    <SelectTrigger
                      className={cn(
                        "h-[35px] font-medium text-white bg-neutral-700 border-neutral-600"
                      )}
                      value={selectedFormat}
                    >
                      {selectedFormat}
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white font-medium">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search formats..."
                          value={searchInput}
                          className="mb-2 bg-neutral-700 text-white pl-9 border-neutral-600"
                          onChange={(e) => setSearchInput(e.target.value)}
                        />
                      </div>
                      {fileFormats
                        .filter((format) => format.toLowerCase().includes(searchInput.toLowerCase()))
                        .map((format) => (
                          <ListItem
                            key={format}
                            className="hover:bg-neutral-700 bg-neutral-800"
                            onClick={() => {
                              setSelectedFormat(format);
                            }}
                            checked={selectedFormat === format}
                          >
                            {format}
                          </ListItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* BBOX Options */}
              <div className="flex flex-col space-y-1 bg-neutral-800 p-2 rounded-md">
                <div className="text-sm font-medium text-white">Bounding Box Options</div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-bbox"
                    checked={bbox.active && sendBBOX}
                    onCheckedChange={(checked) => {
                      setSendBBOX(!!checked);
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="include-bbox" className="text-sm font-medium text-white">
                    Include BBOX in export
                  </Label>
                </div>
                <div className="text-xs text-neutral-400 bg-neutral-700/50 p-2 rounded-md">
                  {bbox.active ?
                    `Current BBOX: ${bbox.maxx.toFixed(4)}, ${bbox.maxy.toFixed(4)}, ${bbox.minx.toFixed(4)}, ${bbox.miny.toFixed(4)}` :
                    "No BBOX selected"
                  }
                </div>
                <p className="text-xs text-neutral-400 italic">
                  Tip: Use <strong>Ctrl + Click</strong> to create a bounding box on the map
                </p>
              </div>

              {/* Visible layers info */}


              {/* Download Buttons */}
              <div className="space-y-2">
                {/* Download Button */}
                <Button
                  variant="default"
                  className="w-full bg-primary hover:bg-primary/90"
                  // disabled={Layers?.length === 0}
                  onClick={async () => {
                    const layersToDownload = Layers;
                    if (layersToDownload?.length === 0) {
                      alert("No visible layers to export. Please make at least one layer visible.");
                      return;
                    }

                    try {
                      setIsLoading(true);

                      // Prepare the request payload in the specified format
                      const payload = {
                        format: selectedFormat.toLowerCase(),
                        data: layersToDownload?.map(layer => {
                          const downloadURL = GET_FINAL_DOWNLOAD_URL({
                            url: layer.url,
                            bands: layer.bandIDs.map(band => parseInt(band)),
                            minMax: layer.minMax.map(band => [band.min, band.max]),
                            bandExpression: layer.expression,
                            mode: layer.layerType,
                            bbox: sendBBOX ? bbox : undefined,
                            colorMap: layer.colormap,
                            tileFormat: selectedFormat as FileFormat,
                          });

                          return {
                            transparency: layer.transparency,
                            directURL: downloadURL,
                            zIndex: layer.zIndex,
                          };
                        }),
                      };

                      // Send the request to the new endpoint
                      ;
                      const response = await fetch(`${DOWNLOADER_BASE_URL}/download/layered`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                      });

                      if (!response.ok) {
                        throw new Error(`Failed to download layers: ${response.statusText}`);
                      }

                      // Get the filename from the Content-Disposition header, fallback to default name if not present
                      const contentDisposition = response.headers.get('Content-Disposition');
                      let filename = `stacked_layers.${selectedFormat.toLowerCase()}`;
                      if (contentDisposition) {
                        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                        if (matches != null && matches[1]) {
                          filename = matches[1].replace(/['"]/g, '');
                        }
                      }

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      a.remove();
                    } catch (error) {
                      console.error('Error downloading layers:', error);
                      alert('An error occurred while downloading the layers');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Stacked Layers
                    </>
                  )}
                </Button>

                {/* Download Raw Files Button */}
                <Button
                  variant="outline"
                  className="w-full bg-neutral-700 hover:bg-neutral-700/80 text-white border-neutral-600"
                  // disabled={Layers?.length === 2}
                  onClick={async () => {
                    const layersToDownload = Layers;
                    if (layersToDownload?.length === 0) {
                      alert("No visible layers to export. Please make at least one layer visible.");
                      return;
                    }

                    try {
                      setIsRawLoading(true);

                      // Create an array of download URLs for raw files
                      const downloadUrls = layersToDownload?.map(layer =>
                        GET_FINAL_DOWNLOAD_URL({
                          url: layer.url,
                          bands: layer.bandIDs.map(band => parseInt(band)),
                          minMax: layer.minMax.map(band => [band.min, band.max]),
                          bandExpression: layer.expression,
                          mode: layer.layerType,
                          bbox: sendBBOX ? bbox : undefined,
                          tileFormat: selectedFormat as FileFormat,
                        })
                      );

                      // Send the request to download raw files - just an array of URLs
                      ;
                      const response = await fetch(`${DOWNLOADER_BASE_URL}/download/raw`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(downloadUrls),
                      });

                      if (!response.ok) {
                        throw new Error(`Failed to download raw files: ${response.statusText}`);
                      }

                      // Get the filename from the Content-Disposition header
                      const contentDisposition = response.headers.get('Content-Disposition');
                      let filename = `raw_layers.zip`;
                      if (contentDisposition) {
                        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                        if (matches != null && matches[1]) {
                          filename = matches[1].replace(/['"]/g, '');
                        }
                      }

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      a.remove();
                    } catch (error) {
                      console.error('Error downloading raw files:', error);
                      alert('An error occurred while downloading the raw files');
                    } finally {
                      setIsRawLoading(false);
                    }
                  }}
                >
                  {isRawLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading Raw Files...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Download Raw Files
                    </>
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
