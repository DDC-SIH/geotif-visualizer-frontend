import { Switch } from "../ui/switch";
function MapTools({
  showCoordinates,
  setShowCoordinates,
  basemapCoordinates,
  setBasemapCoordinates,
  showIndianBorders,
  setShowIndianBorders,
}: {
  showCoordinates: boolean;
  setShowCoordinates: (value: boolean) => void;
  basemapCoordinates: boolean;
  setBasemapCoordinates: (value: boolean) => void;
  showIndianBorders: boolean;
  setShowIndianBorders: (value: boolean) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold mb-4">Map Tools</h3>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex w-full justify-between text-base">
          <label>
            Show Basemap
          </label>
            <Switch
              id="switch"
              checked={showCoordinates}
              onCheckedChange={() => {
                setShowCoordinates(!showCoordinates);
              }}
            />
        </div>
        <div className="flex justify-between text-base">
          <label>
            Show Coordinates
          </label>
            <Switch
              id="switch"
              checked={basemapCoordinates}
              onCheckedChange={() => {
                setBasemapCoordinates(!basemapCoordinates);
              }}
            />
        </div>
        <div className="flex justify-between text-base">
          <label>
            Show Indian Borders
          </label>
            <Switch
              id="switch"
              checked={showIndianBorders}
              onCheckedChange={() => {
                setShowIndianBorders(!showIndianBorders);
              }}
            />
        </div>
      </div>

      
    </div>
  );
}

export default MapTools;
