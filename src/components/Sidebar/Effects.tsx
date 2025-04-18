// import { useState } from "react";
// import { Slider } from "../ui/slider";
// import { ColorWheel, ColorWheelTrack, ColorThumb } from "react-aria-components";

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
//   hueshift: number;
// }

// function Effects({
//   colormapSettings,
//   setColormapSettings,
// }: {
//   colormapSettings: ColormapSettings;
//   setColormapSettings: any;
// }) {
//   const transparencyOptions = [0, 0.25, 0.5, 0.75, 1]; // Transparency values
//   const [hueshiftkey, setHueshiftkey] = useState(0);
//   const handleColourWheelChange = (color: any) => {
//     setColormapSettings((prev: any) => ({
//       ...prev,
//       hueshift: color.hue,
//     }));
//   };

//   return (
//     <div>
//       <h3 className="font-semibold mb-4">Effects</h3>
//       <div className="space-y-2">
//         <span className="text-sm font-medium flex justify-between w-full">
//           <label>Transparency</label>
//           <span>{Math.round(colormapSettings.alpha * 100)}%</span>
//         </span>

//         {/* Slider */}
//         <Slider
//           value={[colormapSettings.alpha]}
//           min={0}
//           max={1}
//           step={0.01}
//           onValueChange={([value]) =>
//             setColormapSettings((prev: any) => ({
//               ...prev,
//               alpha: value,
//             }))
//           }
//         />

//         {/* Transparency Options */}
//         <div className="flex justify-between text-xs pt-2 mt-2.5">
//           {transparencyOptions.map((value, index) => (
//             <button
//               key={index}
//               onClick={() =>
//                 setColormapSettings((prev: any) => ({
//                   ...prev,
//                   alpha: value,
//                 }))
//               }
//               className={`px-2 py-1 rounded-full ${
//                 colormapSettings.alpha === value
//                   ? "bg-black text-white font-bold"
//                   : "bg-transparent text-gray-600 hover:text-black"
//               }`}
//             >
//               {Math.round(value * 100)}%
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-4 mt-4">
//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Brightness</label>
//             <span>
//               {colormapSettings.brightness !== 0 && (
//                 <span
//                   className="mr-2 cursor-pointer hover:underline"
//                   onClick={() =>
//                     setColormapSettings((prev: any) => ({
//                       ...prev,
//                       brightness: 0,
//                     }))
//                   }
//                 >
//                   Reset
//                 </span>
//               )}
//               {Math.round(colormapSettings.brightness * 100)}%
//             </span>
//           </span>
//           <Slider
//             value={[colormapSettings.brightness]}
//             min={-1}
//             max={1}
//             step={0.01}
//             onValueChange={([value]) =>
//               setColormapSettings((prev: any) => ({
//                 ...prev,
//                 brightness: value,
//               }))
//             }
//           />
//         </div>

//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Contrast</label>
//             <span>
//               {colormapSettings.contrast !== 0.5 && (
//                 <span
//                   className="mr-2 cursor-pointer hover:underline"
//                   onClick={() =>
//                     setColormapSettings((prev: any) => ({
//                       ...prev,
//                       contrast: 0.5,
//                     }))
//                   }
//                 >
//                   Reset
//                 </span>
//               )}
//               {Math.round(colormapSettings.contrast * 200 - 100)}%
//             </span>
//           </span>
//           <Slider
//             value={[colormapSettings.contrast]}
//             min={0}
//             max={1}
//             step={0.01}
//             onValueChange={([value]) =>
//               setColormapSettings((prev: any) => ({
//                 ...prev,
//                 contrast: value,
//               }))
//             }
//           />
//         </div>

//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Saturation</label>
//             <span>
//               {colormapSettings.saturation !== 0.5 && (
//                 <span
//                   className="mr-2 cursor-pointer hover:underline"
//                   onClick={() =>
//                     setColormapSettings((prev: any) => ({
//                       ...prev,
//                       saturation: 0.5,
//                     }))
//                   }
//                 >
//                   Reset
//                 </span>
//               )}
//               {Math.round(colormapSettings.saturation * 200 - 100)}%
//             </span>
//           </span>
//           <Slider
//             value={[colormapSettings.saturation]}
//             min={0}
//             max={1}
//             step={0.01}
//             onValueChange={([value]) =>
//               setColormapSettings((prev: any) => ({
//                 ...prev,
//                 saturation: value,
//               }))
//             }
//           />
//         </div>

//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Exposure</label>
//             <span>
//               {colormapSettings.exposure !== 0.5 && (
//                 <span
//                   className="mr-2 cursor-pointer hover:underline"
//                   onClick={() =>
//                     setColormapSettings((prev: any) => ({
//                       ...prev,
//                       exposure: 0.5,
//                     }))
//                   }
//                 >
//                   Reset
//                 </span>
//               )}
//               {Math.round(colormapSettings.exposure * 200 - 100)}%
//             </span>
//           </span>
//           <Slider
//             value={[colormapSettings.exposure]}
//             min={0}
//             max={1}
//             step={0.01}
//             onValueChange={([value]) =>
//               setColormapSettings((prev: any) => ({
//                 ...prev,
//                 exposure: value,
//               }))
//             }
//           />
//         </div>

//         <div className="space-y-2">
//           <span className="text-sm font-medium flex justify-between w-full">
//             <label>Hue Shift</label>
//             {colormapSettings.hueshift !== 0 && (
//               <span
//                 className="mr-2 cursor-pointer hover:underline"
//                 onClick={() =>{
//                   setColormapSettings((prev: any) => ({
//                     ...prev,
//                     hueshift: 0,
//                   }));
//                 setHueshiftkey((prev) => prev + 1);}
//                 }
//               >
//                 Reset
//               </span>
//             )}
//           </span>
//           <ColorWheel
//             outerRadius={75}
//             innerRadius={50}
//             onChange={handleColourWheelChange}
//             key={hueshiftkey}
//           >
//             <ColorThumb
//               className={"h-6 w-6 rounded-full z-[100] border-4 border-white"}
//             />
//             <ColorWheelTrack />
//           </ColorWheel>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Effects;
