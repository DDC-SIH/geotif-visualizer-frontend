// import { Slider } from "../ui/slider";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Button } from "../ui/button";
// import React from "react";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { useGeoData } from "../../contexts/GeoDataProvider";
// import { DndProvider, useDrag, useDrop, DragSourceMonitor } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { X } from "lucide-react";

// interface DraggableItem {
//   id: string;
//   index: number;
//   type: string;
// }

// const ItemType = {
//   LAYER: "LAYER",
// };

// const getBandArithmeticExpressionAsString = (type: string): string => {
//   const expressionToString = (expression: any): string => {
//     if (typeof expression === "number" || typeof expression === "string") {
//       return expression.toString();
//     }

//     if (Array.isArray(expression)) {
//       const [operator, ...operands] = expression;

//       switch (operator) {
//         case "+":
//           return operands.map(expressionToString).join(" + ");
//         case "-":
//           return operands.map(expressionToString).join(" - ");
//         case "*":
//           return operands.map(expressionToString).join(" * ");
//         case "/":
//           return operands.map(expressionToString).join(" / ");
//         case "sqrt":
//           return `sqrt(${operands.map(expressionToString).join(", ")})`;
//         case "band":
//           return `B${operands[0]}`;
//         case "var":
//           return operands[0];
//         default:
//           return "";
//       }
//     }

//     return "";
//   };

//   const expressions: Record<string, any> = {
//     none: ["band", 1],
//     ndvi: [
//       "/",
//       ["-", ["band", 2], ["band", 1]],
//       ["+", ["band", 2], ["band", 1]],
//     ],
//     evi: [
//       "*",
//       2.5,
//       [
//         "/",
//         ["-", ["band", 3], ["band", 2]],
//         ["+", ["band", 3], ["*", 6, ["band", 2]], ["*", 7.5, ["band", 1]], 1],
//       ],
//     ],
//     savi: [
//       "*",
//       1.5,
//       [
//         "/",
//         ["-", ["band", 2], ["band", 1]],
//         ["+", ["band", 2], ["band", 1], 0.5],
//       ],
//     ],
//     nbr: [
//       "/",
//       ["-", ["band", 2], ["band", 1]],
//       ["+", ["band", 2], ["band", 1]],
//     ],
//     msavi: [
//       "*",
//       0.5,
//       [
//         "+",
//         2,
//         ["*", ["band", 3], 1],
//         [
//           "-",
//           [
//             "sqrt",
//             [
//               "-",
//               ["*", ["*", 2, ["band", 3]], 1],
//               ["*", 8, ["-", ["band", 3], ["band", 2]]],
//             ],
//           ],
//           1,
//         ],
//       ],
//     ],
//     ndwi: [
//       "/",
//       ["-", ["band", 2], ["band", 3]],
//       ["+", ["band", 2], ["band", 3]],
//     ],
//     hillshade: ["*", 255, ["var", "hillshade"]],
//   };

//   const selectedExpression = expressions[type] || ["band", 1];
//   return expressionToString(selectedExpression);
// };

// interface ColormapSettings {
//   type: string;
//   min: number;
//   max: number;
//   steps: number;
//   alpha: number;
//   reverse: boolean;
//   brightness: number;
//   contrast: number;
//   saturation: number;
//   exposure: number;
// }

// function Filters({
//   colormapSettings,
//   setColormapSettings,
//   selectedIndex,
//   setSelectedIndex,
// }: {
//   colormapSettings: ColormapSettings;
//   setColormapSettings: React.Dispatch<React.SetStateAction<ColormapSettings>>;
//   selectedIndex: string;
//   setSelectedIndex: (value: string) => void;
// }) {


//   const { setBoundingBox, tiffUrls, renderArray, setRenderArray } =
//     useGeoData();

//   const toggleLayer = (key: keyof typeof tiffUrls) => {
//     const newLayer = { id: generateUniqueId(), key };
//     setRenderArray((prev) => [...prev, newLayer]);
//   };

//   const removeLayer = (id: string) => {
//     setRenderArray((prev) => prev.filter((layer) => layer.id !== id));
//   };

//   const moveLayer = (dragIndex: number, hoverIndex: number) => {
//     const reordered = [...renderArray];
//     const [movedItem] = reordered.splice(dragIndex, 1);
//     reordered.splice(hoverIndex, 0, movedItem);
//     setRenderArray(reordered);
//   };

//   const availableLayers = Object.keys(tiffUrls) as (keyof typeof tiffUrls)[];

//   return (
//     <div className="space-y-6">
//       <h3 className="font-semibold mb-4">Filters</h3>

//       <div className="space-y-4">
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Band Arithmetic Presets</label>
//           <Select onValueChange={setSelectedIndex} value={selectedIndex}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Index" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="none">{`Expression 1`} </SelectItem>
//               <SelectItem value="ndvi">{`Expression 2`}</SelectItem>
//               <SelectItem value="evi">{`Expression 3`}</SelectItem>
//               <SelectItem value="savi">{`Expression 4`}</SelectItem>
//               <SelectItem value="nbr">{`Expression 5`}</SelectItem>
//               <SelectItem value="msavi">{`Expression 6`}</SelectItem>
//               <SelectItem value="ndwi">{`Expression 7`}</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="space-y-2">
//           <Label>Current Expression</Label>
//           <Input
//             readOnly
//             value={getBandArithmeticExpressionAsString(selectedIndex)}
//           />
//         </div>
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Colormap Type</label>
//           <Select
//             value={colormapSettings.type}
//             onValueChange={(value) => {
//               setColormapSettings((prev) => ({
//                 ...prev,
//                 type: value,
//               }));
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select colormap" />
//             </SelectTrigger>
//             <SelectContent>
//               {[
//                 "viridis",
//                 "jet",
//                 "rainbow",
//                 "portland",
//                 "bone",
//                 "plasma",
//                 "magma",
//                 "inferno",
//               ].map((type) => (
//                 <SelectItem key={type} value={type}>
//                   {type.charAt(0).toUpperCase() + type.slice(1)}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Min Value</label> <span>{colormapSettings.min}</span>
//           </span>
//           <Slider
//             value={[colormapSettings.min]}
//             min={-1}
//             max={1}
//             step={0.1}
//             onValueChange={([value]) =>
//               setColormapSettings((prev) => ({
//                 ...prev,
//                 min: Math.min(value, colormapSettings.max),
//               }))
//             }
//           />
//           <div className="flex justify-between text-xs">
//             <span>-1</span>
//             <span>1</span>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Max Value</label> <span>{colormapSettings.max}</span>
//           </span>{" "}
//           <Slider
//             value={[colormapSettings.max]}
//             min={-1}
//             max={1}
//             step={0.1}
//             onValueChange={([value]) =>
//               setColormapSettings((prev) => ({
//                 ...prev,
//                 max: Math.max(value, colormapSettings.min),
//               }))
//             }
//           />
//           <div className="flex justify-between text-xs">
//             <span>-1</span>
//             <span>1</span>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Steps</label> <span>{colormapSettings.steps}</span>
//           </span>{" "}
//           <Slider
//             value={[colormapSettings.steps]}
//             min={10}
//             max={20}
//             step={1}
//             onValueChange={([value]) =>
//               setColormapSettings((prev) => ({
//                 ...prev,
//                 steps: value,
//               }))
//             }
//           />
//           <div className="flex justify-between text-xs">
//             <span>10</span>
//             <span>20</span>
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             onClick={() =>
//               setColormapSettings((prev) => ({
//                 ...prev,
//                 reverse: !prev.reverse,
//               }))
//             }
//           >
//             {colormapSettings.reverse
//               ? "Reverse Colors: On"
//               : "Reverse Colors: Off"}
//           </Button>
//         </div>
//       </div>
//       {/* Active Layers List */}
//       <DndProvider backend={HTML5Backend}>
//         <div>
//           <Label>Selected Bands</Label>
//           {renderArray.map((layer, index) => (
//             <DraggableLayer
//               key={layer.id}
//               layer={layer}
//               index={index}
//               moveLayer={moveLayer}
//               removeLayer={removeLayer}
              
//             />
//           ))}
//         </div>
//       </DndProvider>
//     </div>
//   );
// }

// export default Filters;

// // Draggable Layer Component
// function DraggableLayer({
//   layer,
//   index,
//   moveLayer,
//   removeLayer,
// }: {
//   layer: { id: string; key: string };
//   index: number;
//   moveLayer: (dragIndex: number, hoverIndex: number) => void;
//   removeLayer: (id: string) => void;
// }) {
//   const ref = React.useRef<HTMLDivElement>(null);

//   const [, drop] = useDrop<DraggableItem>({
//     accept: ItemType.LAYER,
//     hover(item: DraggableItem, monitor) {
//       if (!ref.current) return;

//       const dragIndex = item.index;
//       const hoverIndex = index;

//       if (dragIndex === hoverIndex) return;

//       const hoverBoundingRect = ref.current.getBoundingClientRect();
//       const hoverMiddleY =
//         (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
//       const clientOffset = monitor.getClientOffset();
//       const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

//       if (
//         (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
//         (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
//       ) {
//         return;
//       }

//       moveLayer(dragIndex, hoverIndex);
//       item.index = hoverIndex;
//     },
//   });

//   const [{ isDragging }, drag] = useDrag({
//     type: ItemType.LAYER,
//     item: { id: layer.id, index },
//     collect: (monitor: DragSourceMonitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   });

//   drag(drop(ref));

//   return (
//     <div
//       ref={ref}
//       className={`flex items-center justify-between p-2 text-sm px-4 my-2 bg-gray-100 rounded relative ${
//         isDragging ? "opacity-50" : "opacity-100"
//       }`}
//     >
//       {index === 0 && (
//         <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
//       )}
//       {index === 1 && (
//         <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
//       )}
//       {index === 2 && (
//         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
//       )}
//       <p><span className="font-bold">
//         {layer.key}</span> {`(Band ${index+1})`}
//       {index === 0 && (
//         <p className=" text-xs text-red-500">{`Red Band`}</p>
//       )}
//       {index === 1 && (
//         <p className=" text-xs text-green-500">{`Green Band`}</p>
//       )}
//       {index === 2 && (
//         <p className=" text-xs text-blue-500">{`Blue Band`}</p>
//       )}
//       </p>
//       <Button
//         onClick={() => removeLayer(layer.id)}
//       >
//         <X/>
//       </Button>
//     </div>
//   );
// }

// // Utility function to generate unique IDs
// const generateUniqueId = () =>
//   `layer-${Math.random().toString(36).substr(2, 9)}`;
