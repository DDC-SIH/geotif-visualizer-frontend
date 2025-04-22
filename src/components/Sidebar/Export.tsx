import { Button } from "../ui/button";
import { useGeoData } from "../../contexts/GeoDataProvider";
import {
  fileFormats,
  GET_FINAL_DOWNLOAD_URL,
} from "@/constants/consts";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import ListItem from "./list-item";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Loader2, Download, Layers as LayersLogo, Search } from "lucide-react";
import { FileFormat } from "types/geojson";

export default function Export() {
  const { bbox, bandExpression, Layers } = useGeoData();

  const [selectedFormat, setSelectedFormat] = useState(fileFormats[0]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRawLoading, setIsRawLoading] = useState(false);
  const [sendBBOX, setSendBBOX] = useState(false);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && Layers) {
      // Select all layers
      setSelectedLayers(Layers.map(layer => layer.id));
    } else {
      // Deselect all layers
      setSelectedLayers([]);
    }
  };

  // Handle individual layer checkbox
  const handleLayerSelect = (layerId: string, checked: boolean) => {
    if (checked) {
      // Add to selected layers
      setSelectedLayers(prev => [...prev, layerId]);
    } else {
      // Remove from selected layers
      setSelectedLayers(prev => prev.filter(id => id !== layerId));
    }
  };

  // Update selectAll state when individual selections change
  useMemo(() => {
    if (!Layers) return;

    if (selectedLayers.length === Layers.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedLayers, Layers]);

  // Get the selected layers data
  const getSelectedLayersData = () => {
    if (!Layers) return [];

    return Layers.filter(layer => selectedLayers.includes(layer.id));
  };

  return (
    <div className="rounded-md bg-neutral-900/60 backdrop-blur-sm">
      <h3 className="font-semibold mb-4 text-primary-foreground flex items-center gap-2">
        <Download className="w-5 h-5" />
        Export Options
      </h3>

      {/* Layers Selection Section */}
      <div className="space-y-4">
        <div className="bg-neutral-800 p-3 rounded-md">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <LayersLogo className="w-4 h-4" />
            Select Layers to Export
          </h4>

          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2 mb-3 bg-neutral-700/50 p-2 rounded-md">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer text-white">
              Select All Layers
            </Label>
          </div>

          {/* Layer Checkboxes */}
          <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {Layers && Layers.length > 0 ? (
              Layers.map(layer => (
                <div key={layer.id} className="flex items-center space-x-2 p-2 rounded hover:bg-neutral-700">
                  <Checkbox
                    id={`layer-${layer.id}`}
                    checked={selectedLayers.includes(layer.id)}
                    onCheckedChange={(checked) => handleLayerSelect(layer.id, !!checked)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor={`layer-${layer.id}`} className="text-sm font-normal cursor-pointer flex-1 text-white">
                    {layer.date.toISOString().split("T")[0]}/{layer.processingLevel}/{layer.layerType === "Singleband" ? layer.bandNames[0] : "RGB"}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400 p-2">No layers available for export</p>
            )}
          </div>

          {/* Layer count indicator */}
          <p className="text-xs mt-2 text-neutral-400">
            {selectedLayers.length} of {Layers?.length || 0} layers selected
          </p>
        </div>

        {/* Export Format Selection */}
        <div className="bg-neutral-800 p-3 rounded-md">
          <label className="text-sm font-medium text-white mb-2 block">Export Format</label>
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
        <div className="flex flex-col space-y-2 bg-neutral-800 p-3 rounded-md">
          <div className="text-sm font-medium text-white">Bounding Box Options</div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-bbox"
              checked={bbox.active && sendBBOX}
              onCheckedChange={(checked) => {
                setSendBBOX((prev) => {
                  if (checked) {
                    return true;
                  } else {
                    return false;
                  }
                });
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

        {/* Download Buttons */}
        <div className="space-y-3">
          {/* Download Button */}
          <Button
            variant="default"
            className="w-full bg-primary hover:bg-primary/90"
            onClick={async () => {
              const layersToDownload = getSelectedLayersData();
              if (layersToDownload.length === 0) {
                alert("Please select at least one layer to export");
                return;
              }

              try {
                setIsLoading(true);

                // Prepare the request payload in the specified format
                const payload = {
                  format: selectedFormat.toLowerCase(),
                  data: layersToDownload.map(layer => {
                    const downloadURL = GET_FINAL_DOWNLOAD_URL({
                      url: layer.url,
                      bands: layer.bandIDs.map(band => parseInt(band)),
                      minMax: layer.minMax.map(band => [band.min, band.max]),
                      bandExpression: bandExpression,
                      mode: layer.layerType,
                      bbox: bbox,
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
                const baseUrl = 'http://74.226.242.56:5000';
                const response = await fetch(`${baseUrl}/download/layered`, {
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
            disabled={selectedLayers.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Selected Layers
              </>
            )}
          </Button>

          {/* Download Raw Files Button */}
          <Button
            variant="outline"
            className="w-full bg-neutral-700 hover:bg-neutral-700/80 text-white border-neutral-600"
            onClick={async () => {
              const layersToDownload = getSelectedLayersData();
              if (layersToDownload.length === 0) {
                alert("Please select at least one layer to export");
                return;
              }

              try {
                setIsRawLoading(true);

                // Create an array of download URLs for raw files
                const downloadUrls = layersToDownload.map(layer =>
                  GET_FINAL_DOWNLOAD_URL({
                    url: layer.url,
                    bands: layer.bandIDs.map(band => parseInt(band)),
                    minMax: layer.minMax.map(band => [band.min, band.max]),
                    bandExpression: bandExpression,
                    mode: layer.layerType,
                    bbox: bbox,
                    tileFormat: selectedFormat as FileFormat,
                  })
                );

                // Send the request to download raw files - just an array of URLs
                const baseUrl = 'http://74.226.242.56:5000';
                const response = await fetch(`${baseUrl}/download/raw`, {
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
            disabled={selectedLayers.length === 0 || isRawLoading}
          >
            {isRawLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading Raw Files...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Raw Files
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
