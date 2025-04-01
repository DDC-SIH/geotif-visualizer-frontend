import DragBox from "ol/interaction/DragBox";
import { platformModifierKeyOnly } from "ol/events/condition";
import { Map } from "ol";
import { transform } from "ol/proj";
import { bbox } from "@/contexts/GeoDataProvider";

export const addDragBoxInteraction = (
  map: Map,
  mapRef: React.RefObject<HTMLDivElement>,
  isModifierKeyPressed: boolean,
  setBBOX: React.Dispatch<React.SetStateAction<bbox>>
  //   setIsModifierKeyPressed: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const dragBox = new DragBox({
    condition: platformModifierKeyOnly,
    className: "dragbox-style", // Add this line
  });

  dragBox.on("boxstart", () => {
    if (mapRef.current) {
      mapRef.current.style.cursor = "crosshair";
    }
  });

  dragBox.on("boxend", () => {
    if (mapRef.current) {
      mapRef.current.style.cursor = isModifierKeyPressed
        ? "crosshair"
        : "default";
    }

    const extent = dragBox.getGeometry().getExtent();
    const bottomLeft = transform(
      [extent[0], extent[1]],
      map.getView().getProjection(),
      "EPSG:4326"
    );
    const topRight = transform(
      [extent[2], extent[3]],
      map.getView().getProjection(),
      "EPSG:4326"
    );

    const bbox = [
      Number(bottomLeft[0].toFixed(4)),
      Number(bottomLeft[1].toFixed(4)),
      Number(topRight[0].toFixed(4)),
      Number(topRight[1].toFixed(4)),
    ];
    setBBOX({
      active: true,
      minx: bbox[0],
      miny: bbox[1],
      maxx: bbox[2],
      maxy: bbox[3],
    });
    // setBoundingBox(bbox);

    console.log(bbox);
  });

  map.addInteraction(dragBox);
};
