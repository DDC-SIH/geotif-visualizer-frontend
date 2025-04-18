import { Button } from "../ui/button";
import { useGeoData } from "../../contexts/GeoDataProvider";
import {
  fileFormats,
  GET_DOWNLOAD_URL,
  GET_FINAL_DOWNLOAD_URL,

} from "@/constants/consts";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import ListItem from "./list-item";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { FileFormat } from "types/geojson";
// import { Layers } from "@/constants/consts";

export default function Export() {
  const { bbox, bandExpression, Layers } = useGeoData();

  const [selectedFormat, setSelectedFormat] = useState(fileFormats[0]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle download
  const handleDownload = () => {
    // Get the array of selected layers
    const layersToDownload = getSelectedLayersData();
    console.log("Selected layers:", layersToDownload);
    if (layersToDownload.length === 0) {
      alert("Please select at least one layer to export");
      return;
    }

    console.log("Layers to download:", layersToDownload);
    const sendLayers = layersToDownload.map((layer) => {
      return {
        ...layer,
        directURL: GET_FINAL_DOWNLOAD_URL({
          url: layer.url,
          bands: layer.bandIDs.map((band) => parseInt(band)),
          minMax: layer.minMax.map(band => [band.min, band.max]),
          bandExpression: bandExpression,
          mode: layer.layerType,
          bbox: bbox,
          tileFormat: selectedFormat,
        })
      }

    })

    console.log("Layers to send:", sendLayers);
    // Here you would implement the actual download logic
    // This could be a call to a backend API or other process
    // depending on how your application processes downloads

    // For demonstration, we'll just log the data
    layersToDownload.forEach(layer => {
      // Example download URL for each layer
      const downloadURL = GET_DOWNLOAD_URL({
        url: layer.url,
        bands: layer.bandIDs.map(band => parseInt(band)),
        minMax: layer.minMax.map(band => [band.min, band.max]),
        bandExpression: bandExpression,
        mode: layer.layerType,
        bbox: bbox,
        tileFormat: selectedFormat,
      });

      console.log(`Download URL for ${layer.bandNames.join(',')}:`, downloadURL);
      // In a real implementation, you might trigger an actual download here
      // window.open(downloadURL);
    });
  };

  return (
    <div className="space-y-6 text-white">
      <h3 className="font-semibold mb-4">Export Options</h3>

      {/* Layers Selection Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Select Layers to Export</h4>

        {/* Select All Checkbox */}
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="text-sm font-medium">
            Select All Layers
          </Label>
        </div>

        {/* Layer Checkboxes */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {Layers && Layers.length > 0 ? (
            Layers.map(layer => (
              <div key={layer.id} className="flex items-center space-x-2 p-2 rounded hover:bg-neutral-700">
                <Checkbox
                  id={`layer-${layer.id}`}
                  checked={selectedLayers.includes(layer.id)}
                  onCheckedChange={(checked) => handleLayerSelect(layer.id, !!checked)}
                />
                <Label htmlFor={`layer-${layer.id}`} className="text-sm font-normal cursor-pointer flex-1">
                  {layer.date.toISOString().split("T")[0]}/{layer.processingLevel}/{layer.layerType === "Singleband" ? layer.bandNames[0] : "RGB"}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-400">No layers available for export</p>
          )}
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2">Export Format</label>
        <Select onValueChange={(val) => {
          setSelectedFormat(val as FileFormat);
        }} value={selectedFormat}>
          <SelectTrigger
            className={cn(
              " h-[35px] font-medium text-white"
            )}
            value={selectedFormat}
          >
            {selectedFormat}
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 text-white font-medium">
            <Input
              placeholder="Search formats..."
              value={searchInput}
              className="mb-2"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {fileFormats
              .filter((format) => format.toLowerCase().includes(searchInput.toLowerCase()))
              .map((format) => (
                <ListItem
                  key={format}
                  className="hover:bg-neutral-400 bg-neutral-800"
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

        {/* Download Button */}
        <Button
          className="mt-4"
          onClick={async () => {
            const layersToDownload = getSelectedLayersData();
            if (layersToDownload.length === 0) {
              alert("Please select at least one layer to export");
              return;
            }

            try {
              setIsLoading(true);

              const response = await fetch('http://74.226.242.56:5000/stack-layers', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                  layersToDownload.map(layer => {
                    const downloadURL = GET_DOWNLOAD_URL({
                      url: layer.url,
                      bands: layer.bandIDs.map(band => parseInt(band)),
                      minMax: layer.minMax.map(band => [band.min, band.max]),
                      bandExpression: bandExpression,
                      mode: layer.layerType,
                      bbox: bbox,
                      tileFormat: selectedFormat as FileFormat,
                    });
                    return {
                      transparency: layer.transparency,
                      directURL: downloadURL,
                      zIndex: layer.zIndex,
                    };
                  }),
                ),
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
              // alert('An error occurred while downloading the layers');
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
            "Download Selected Layers"
          )}
        </Button>

        {/* Layer count indicator */}
        <p className="text-xs mt-2 text-neutral-400">
          {selectedLayers.length} of {Layers?.length || 0} layers selected
        </p>
      </div>
    </div >
  );
}
