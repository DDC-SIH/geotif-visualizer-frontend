import { useState, useEffect } from "react";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { Layers, } from "@/constants/consts";
import { availableColorMaps } from "@/constants/colormaps";
import { Slider } from "../ui/slider";
import { DualRangeSlider } from "../ui/dual-range-slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Plus, Trash2Icon, Check, ChevronsUpDown, Calendar, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { SatelliteBandDialog } from "../addLayer/satellite-band-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import ListItem from "./list-item";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";
import { CogItem } from "@/types/cog";
import { fetchAvailableTimes, fetchAllBands, fetchAvailableDates } from "@/apis/req";
export function convertFromTimestamp(ts: number) {
  let d = new Date(ts);
  let hours = String(d.getUTCHours()).padStart(2, "0");
  let mins = String(d.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${mins}`;
}
function SingleLayerItem({ Layers, index, onDragStart, onDragOver, onDrop }: {
  Layers: Layers,
  index: number,
  onDragStart: (e: React.DragEvent, index: number) => void,
  onDragOver: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent, index: number) => void
}) {
  const { setLayers, Layers: allLayers, updateOpacity, updateMinMax, removeLayer, updateColorMap, updateLayerFunc } = useGeoData();
  const [minMaxError, setMinMaxError] = useState(
    Layers.bandNames.map(() => ({ minError: "", maxError: "" }))
  );
  const [minMax, setMinMax] = useState(
    Layers.minMax.map((band) => ({
      min: band.min,
      max: band.max,
    }))
  );
  const [open, setOpen] = useState(false);
  const [colorMapValue, setColorMapValue] = useState<string>(Layers.colormap || "");
  // Date and time state
  const [date, setDate] = useState<Date | undefined>(
    Layers.date
  );
  const [dateOpen, setDateOpen] = useState(false);

  const [time, setTime] = useState(Layers.time);
  const [timeOpen, setTimeOpen] = useState(false);
  const [allTimes, setAllTimes] = useState<string[]>([]);
  const [allBands, setAllBands] = useState<CogItem>();
  const [selectedBands, setSelectedBands] = useState<string[]>(Layers.bandNames);
  const [availableDates, setAvailableDates] = useState<{ date: string; datetime: number }[]>([]);

  useEffect(() => {
    console.log("LayerItem mounted");
    // Fetch available dates from the API
    fetchAvailableDates(Layers)
      .then((dates) => {
        console.log("Available dates:", dates);
        if (dates) {
          const formattedDates = dates.availableDates.map(date => ({
            date: date.date,
            datetime: date.datetime
          }));
          setAvailableDates(formattedDates);
        }
      })
      .catch((error) => {
        console.error("Error fetching available dates:", error);
      });
  }, [dateOpen]);

  useEffect(() => {
    // Fetch available times from the API
    fetchAvailableTimes(date as Date, Layers)
      .then((times) => {
        if (times) {
          console.log({ times })
          const convertedTimes = times.map((time) => convertFromTimestamp(time.aquisition_datetime));
          console.log("Available times:", convertedTimes);
          convertedTimes.find((time) => time === Layers.time) ? setTime(Layers.time) : setTime(convertedTimes[0]);
          setAllTimes(convertedTimes);
        }
      })
      .catch((error) => {
        console.error("Error fetching available times:", error);
      });

    // if set time in all time do nothing else select [0]
    //set alltimes all times
    //update layers
    //update map
  }, [date])


  useEffect(() => {
    if (date && time) {
      fetchAllBands(date, time, Layers)
        .then((data) => {
          if (data) {
            console.log("Fetched all bands:", data);
            setAllBands(data.cog);
          }
        })
        .catch((error) => {
          console.error("Error fetching all bands:", error);
        });
    }
  }, [time])


  useEffect(() => {
    if (!allBands) return;

    // Instead of replacing band information, only update the URL and time-related properties
    // Create a copy of the current minMax values to update
    const newMinMax = [...Layers.minMax];

    // For each existing band, update its min/max limits from the allBands data if available
    Layers.bandIDs.forEach((bandId, index) => {
      const matchingBand = allBands.bands.find(band => band.bandId.toString() === bandId);
      if (matchingBand) {
        newMinMax[index] = {
          min: matchingBand.minimum,
          max: matchingBand.maximum,
          minLim: matchingBand.minimum,
          maxLim: matchingBand.maximum,
        };
      }
    });
    console.log("Bad Date", new Date(allBands?.aquisition_datetime))
    const updatedLayerProp = {
      date: new Date(allBands?.aquisition_datetime),
      time: convertFromTimestamp(allBands?.aquisition_datetime),
      url: `${allBands?.filepath || ""}/${allBands?.filename || ""}`,
      minMax: newMinMax,
      // Don't update bandNames or bandIDs to preserve the current selection
    }

    setLayers((prev) => {
      return (prev ?? []).map((layer, idx) => {
        if (idx === layerIndex) {
          return {
            ...layer,
            ...updatedLayerProp,
          };
        }
        return layer;
      });
    });

    updateLayerFunc(layerIndex, updatedLayerProp);

  }, [allBands]);



  // Find the index of this layer in the context
  const layerIndex = allLayers?.findIndex((layer) => layer.id === Layers.id) ?? -1;

  // Update local state when layer properties change
  useEffect(() => {
    // Update minMax state
    setMinMax(Layers.minMax.map((band) => ({
      min: band.min,
      max: band.max,
    })));

    // Update colormap state
    setColorMapValue(Layers.colormap || "");

    // Update date and time state
    if (Layers.date) {
      setDate(new Date(Layers.date));
    }
    setTime(Layers.time || "11:30");
  }, [Layers.minMax, Layers.colormap, Layers.date, Layers.time]);

  // Handle min/max changes for a specific band
  const handleMinMaxChange = (index: number, values: number[]) => {
    const [min, max] = values;
    const newMinMax = [...minMax];
    const newMinMaxError = [...minMaxError];

    // Validate min value
    if (min >= Layers.minMax[index].minLim && min <= max) {
      newMinMax[index].min = min;
      newMinMaxError[index].minError = "";
    } else {
      newMinMaxError[index].minError = "Invalid";
    }

    // Validate max value
    if (max <= Layers.minMax[index].maxLim && max >= min) {
      newMinMax[index].max = max;
      newMinMaxError[index].maxError = "";
    } else {
      newMinMaxError[index].maxError = "Invalid";
    }

    setMinMax(newMinMax);
    setMinMaxError(newMinMaxError);
  };

  // Check if any min/max has changed
  const hasMinMaxChanged = () => {
    return minMax.some((band, idx) =>
      band.min !== Layers.minMax[idx].min || band.max !== Layers.minMax[idx].max
    );
  };

  // Check if there are any validation errors
  const hasErrors = () => {
    return minMaxError.some(error => error.minError || error.maxError);
  };

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && layerIndex !== -1) {
      const formattedDate = format(newDate, "yyyy-MM-dd");
      setLayers((prev) => {
        return prev.map((layer, idx) => {
          if (idx === layerIndex) {
            return { ...layer, date: formattedDate };
          }
          return layer;
        });
      });
      setDateOpen(false);
    }
  };

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (layerIndex !== -1) {
      setLayers((prev) => {
        return prev.map((layer, idx) => {
          if (idx === layerIndex) {
            return { ...layer, time: newTime };
          }
          return layer;
        });
      });
    }
    setTimeOpen(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className=" "
    >
      <AccordionItem value={Layers.id.toString()} className="rounded-t-lg flex flex-col border-none min-w-full">

        <AccordionTrigger>
          <div className="cursor-grab active:cursor-grabbing flex items-center">
            <DotsVerticalIcon className="h-5 w-5" />
            <DotsVerticalIcon className="-ml-3 h-5 w-5" />
          </div>
          <span className="text-sm font-medium">{date.toISOString().split("T")[0] + "/" + Layers.processingLevel + "/" + (Layers.layerType === "Singleband" ? Layers.bandNames[0] : "RGB")}</span>

          {/* Delete button */}
          <div className="ml-auto mr-2" onClick={(e) => {
            e.stopPropagation(); // Prevent accordion toggle
            if (layerIndex !== -1) {
              removeLayer(layerIndex);
            }
          }}>
            <Trash2Icon className="h-4 w-4 text-red-500 hover:text-red-400" />
          </div>
        </AccordionTrigger>

        <AccordionContent>
          {/* Date and Time Selectors */}
          <div className="mb-4 flex gap-2 flex-col">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1 text-white">Date</p>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild className="text-white font-semibold">
                  <div
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? date.toISOString().split("T")[0] : <span>Pick a date</span>}
                  </div>
                </PopoverTrigger>
                {
                  availableDates.length > 0 && (
                    <PopoverContent className="w-auto" align="start">
                      <CalendarComponent
                        disabled={(date) =>
                          date > new Date() || date < new Date(new Date().setMonth(new Date().getMonth() - 3)) ||
                          !availableDates.some((availableDate) => new Date(availableDate.date).toDateString() === date.toDateString())
                        }
                        mode="single"
                        selected={new Date(date.getFullYear(), date.getMonth(), date.getDate())}
                        className="bg-neutral-800 text-white flex flex-col"
                        onSelect={handleDateChange}
                      />
                    </PopoverContent>
                  )
                }

              </Popover>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium mb-1 text-white">Time</p>
              <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                <PopoverTrigger asChild className="text-white font-semibold">
                  <div
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  >
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-neutral-800">
                  <Command className="text-white">
                    <CommandInput placeholder="Search time..." className="h-9" />
                    <CommandEmpty>No time found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {allTimes.map((timeOption) => (
                        <CommandItem
                          key={timeOption}
                          value={timeOption}
                          onSelect={handleTimeChange}
                          className="text-white font-semibold"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-white",
                              time === timeOption ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {timeOption}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {Layers.bandNames.map((bandName, idx) => (
            <div key={idx} className="mb-4">
              <Select>
                <SelectTrigger
                  className={cn(
                    "bg-transparent h-[27px] font-semibold text-white",
                    // Layers.bandNames.length === 3 && parseInt(Layers.bandIDs[idx]) === 1 && "text-red-600",
                    // Layers.bandNames.length === 3 && parseInt(Layers.bandIDs[idx]) === 2 && "text-green-600",
                    // Layers.bandNames.length === 3 && parseInt(Layers.bandIDs[idx]) === 3 && "text-blue-600"
                  )}
                >
                  <SelectValue
                    placeholder={bandName}
                  />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-background font-semibold">
                  {
                    allBands?.bands.map((band) => (
                      <ListItem
                        className="hover:bg-neutral-400 bg-neutral-800"

                        onClick={() => {
                          const bandName = band.description;
                          const newSelectedBands = [...selectedBands];
                          newSelectedBands[idx] = bandName;
                          setSelectedBands(newSelectedBands);

                          const newBandIDs = [...Layers.bandIDs];
                          newBandIDs[idx] = band.bandId.toString();

                          const newMinMax = [...Layers.minMax];
                          newMinMax[idx] = {
                            min: band.minimum,
                            max: band.maximum,
                            minLim: band.minimum,
                            maxLim: band.maximum,
                          };

                          setMinMax(newMinMax);

                          updateLayerFunc(layerIndex, {
                            bandNames: newSelectedBands,
                            bandIDs: newBandIDs,
                            minMax: newMinMax,
                          });

                          setLayers((prev) => {
                            return (prev ?? []).map((layer, id) => {
                              if (id === layerIndex) {
                                return {
                                  ...layer,
                                  bandNames: newSelectedBands,
                                  bandIDs: newBandIDs,
                                  minMax: newMinMax,
                                };
                              }
                              return layer;
                            });
                          })

                        }}
                        checked={
                          bandName ===
                          band.description
                        }
                      >
                        {band.description}
                      </ListItem>
                    )
                    )}
                </SelectContent>
              </Select>

              <div className="mb-2">

                <div className="flex justify-between text-background text-xs font-medium mb-1">
                  <div className="mt-1">
                    MinMax
                    {minMaxError[idx]?.minError && (
                      <span className="text-red-600 font-medium ml-1">
                        ({minMaxError[idx].minError})
                      </span>
                    )}
                  </div>
                  <div>
                    {minMaxError[idx]?.maxError && (
                      <span className="text-red-600 font-medium ml-1">
                        ({minMaxError[idx].maxError})
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative mt-2">
                  <DualRangeSlider
                    value={[minMax[idx].min, minMax[idx].max]}
                    min={Layers.minMax[idx].minLim}
                    max={Layers.minMax[idx].maxLim}
                    step={(Layers.minMax[idx].maxLim - Layers.minMax[idx].minLim) / 100}
                    minStepsBetweenThumbs={1}
                    className="mt-2"
                    onValueChange={(values) => handleMinMaxChange(idx, values)}
                  />
                </div>

                <div className="flex justify-between text-background text-xs mt-1">
                  <span>{Layers.minMax[idx].minLim}</span>
                  <span>{Layers.minMax[idx].maxLim}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="w-full flex items-start">
            {hasMinMaxChanged() && !hasErrors() && (
              <Button
                className="  mb-2 text-xs font-normal h-[30px]"
                onClick={() => {
                  Layers.minMax.forEach((_, idx) => {
                    updateMinMax(
                      layerIndex,
                      minMax[idx].min,
                      minMax[idx].max,
                      idx
                    );
                  });
                }}
              >
                Apply
              </Button>
            )}
          </div>
          {Layers.layerType === "Singleband" && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1 text-white">ColorMap</p>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild className="text-white font-semibold">
                  <div
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  >
                    {colorMapValue
                      ? colorMapValue
                      : "Select colormap..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-neutral-800">
                  <Command className="">
                    <CommandInput placeholder="Search colormap..." className="h-9" />
                    <CommandEmpty>No colormap found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {availableColorMaps.map((colorMap) => (
                        <CommandItem
                          key={colorMap}
                          value={colorMap}
                          className="text-white font-semibold"
                          onSelect={(currentValue) => {
                            setColorMapValue(currentValue);

                            if (layerIndex !== -1) {
                              updateColorMap(layerIndex, currentValue);
                            }

                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-white",
                              colorMapValue === colorMap ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {colorMap}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          <div>
            <p className="text-background text-xs font-medium mb-2">
              Layer Transparency
            </p>
            <Slider
              title={"Transparency"}
              value={[Layers.transparency * 100]}
              step={10}
              onValueChange={(val) => {
                const newOpacity = val[0] / 100;

                setLayers((prev) => {
                  return prev.map((layer) => {
                    if (layer.id === Layers.id) {
                      layer.transparency = newOpacity;
                    }
                    return layer;
                  });
                });

                if (layerIndex !== -1) {
                  updateOpacity(layerIndex, newOpacity);
                }
              }}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
function MultiBandLayerItem({ Layers, index, onDragStart, onDragOver, onDrop }: {
  Layers: Layers,
  index: number,
  onDragStart: (e: React.DragEvent, index: number) => void,
  onDragOver: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent, index: number) => void
}) {
  const { setLayers, Layers: allLayers, updateOpacity, updateMinMax, removeLayer, updateColorMap, updateLayerFunc } = useGeoData();
  const [minMaxError, setMinMaxError] = useState(
    Layers.bandNames.map(() => ({ minError: "", maxError: "" }))
  );
  const [minMax, setMinMax] = useState(
    Layers.minMax.map((band) => ({
      min: band.min,
      max: band.max,
    }))
  );
  const [open, setOpen] = useState(false);
  const [colorMapValue, setColorMapValue] = useState<string>(Layers.colormap || "");
  // Date and time state
  const [date, setDate] = useState<Date | undefined>(
    Layers.date
  );
  const [dateOpen, setDateOpen] = useState(false);

  const [time, setTime] = useState(Layers.time);
  const [timeOpen, setTimeOpen] = useState(false);
  const [allTimes, setAllTimes] = useState<string[]>([]);
  const [allBands, setAllBands] = useState<CogItem>();
  const [selectedBands, setSelectedBands] = useState<string[]>(Layers.bandNames);
  const [availableDates, setAvailableDates] = useState<{ date: string; datetime: number }[]>([]);

  useEffect(() => {
    console.log("LayerItem mounted");
    // Fetch available dates from the API
    fetchAvailableDates(Layers)
      .then((dates) => {
        console.log("Available dates:", dates);
        if (dates) {
          const formattedDates = dates.availableDates.map(date => ({
            date: date.date,
            datetime: date.datetime
          }));
          setAvailableDates(formattedDates);
        }
      })
      .catch((error) => {
        console.error("Error fetching available dates:", error);
      });
  }, [dateOpen]);

  useEffect(() => {
    // Fetch available times from the API
    fetchAvailableTimes(date as Date, Layers)
      .then((times) => {
        if (times) {
          console.log({ times })
          const convertedTimes = times.map((time) => convertFromTimestamp(time.aquisition_datetime));
          console.log("Available times:", convertedTimes);
          convertedTimes.find((time) => time === Layers.time) ? setTime(Layers.time) : setTime(convertedTimes[0]);
          setAllTimes(convertedTimes);
        }
      })
      .catch((error) => {
        console.error("Error fetching available times:", error);
      });

    // if set time in all time do nothing else select [0]
    //set alltimes all times
    //update layers
    //update map
  }, [date])


  useEffect(() => {
    if (date && time) {
      fetchAllBands(date, time, Layers)
        .then((data) => {
          if (data) {
            console.log("Fetched all bands:", data);
            setAllBands(data.cog);
          }
        })
        .catch((error) => {
          console.error("Error fetching all bands:", error);
        });
    }
  }, [time])


  useEffect(() => {
    if (!allBands) return;

    // Instead of replacing band information, only update the URL and time-related properties
    // Create a copy of the current minMax values to update
    const newMinMax = [...Layers.minMax];

    // For each existing band, update its min/max limits from the allBands data if available
    Layers.bandIDs.forEach((bandId, index) => {
      const matchingBand = allBands.bands.find(band => band.bandId.toString() === bandId);
      if (matchingBand) {
        newMinMax[index] = {
          min: matchingBand.minimum,
          max: matchingBand.maximum,
          minLim: matchingBand.minimum,
          maxLim: matchingBand.maximum,
        };
      }
    });
    console.log("Bad Date", new Date(allBands?.aquisition_datetime))
    const updatedLayerProp = {
      date: new Date(allBands?.aquisition_datetime),
      time: convertFromTimestamp(allBands?.aquisition_datetime),
      url: `${allBands?.filepath || ""}/${allBands?.filename || ""}`,
      minMax: newMinMax,
      // Don't update bandNames or bandIDs to preserve the current selection
    }

    setLayers((prev) => {
      return (prev ?? []).map((layer, idx) => {
        if (idx === layerIndex) {
          return {
            ...layer,
            ...updatedLayerProp,
          };
        }
        return layer;
      });
    });

    updateLayerFunc(layerIndex, updatedLayerProp);

  }, [allBands]);



  // Find the index of this layer in the context
  const layerIndex = allLayers?.findIndex((layer) => layer.id === Layers.id) ?? -1;

  // Update local state when layer properties change
  useEffect(() => {
    // Update minMax state
    setMinMax(Layers.minMax.map((band) => ({
      min: band.min,
      max: band.max,
    })));

    // Update colormap state
    setColorMapValue(Layers.colormap || "");

    // Update date and time state
    if (Layers.date) {
      setDate(new Date(Layers.date));
    }
    setTime(Layers.time || "11:30");
  }, [Layers.minMax, Layers.colormap, Layers.date, Layers.time]);

  // Handle min/max changes for a specific band
  const handleMinMaxChange = (index: number, values: number[]) => {
    const [min, max] = values;
    const newMinMax = [...minMax];
    const newMinMaxError = [...minMaxError];

    // Validate min value
    if (min >= Layers.minMax[index].minLim && min <= max) {
      newMinMax[index].min = min;
      newMinMaxError[index].minError = "";
    } else {
      newMinMaxError[index].minError = "Invalid";
    }

    // Validate max value
    if (max <= Layers.minMax[index].maxLim && max >= min) {
      newMinMax[index].max = max;
      newMinMaxError[index].maxError = "";
    } else {
      newMinMaxError[index].maxError = "Invalid";
    }

    setMinMax(newMinMax);
    setMinMaxError(newMinMaxError);
  };

  // Check if any min/max has changed
  const hasMinMaxChanged = () => {
    return minMax.some((band, idx) =>
      band.min !== Layers.minMax[idx].min || band.max !== Layers.minMax[idx].max
    );
  };

  // Check if there are any validation errors
  const hasErrors = () => {
    return minMaxError.some(error => error.minError || error.maxError);
  };

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && layerIndex !== -1) {
      const formattedDate = format(newDate, "yyyy-MM-dd");
      setLayers((prev) => {
        return prev.map((layer, idx) => {
          if (idx === layerIndex) {
            return { ...layer, date: formattedDate };
          }
          return layer;
        });
      });
      setDateOpen(false);
    }
  };

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (layerIndex !== -1) {
      setLayers((prev) => {
        return prev.map((layer, idx) => {
          if (idx === layerIndex) {
            return { ...layer, time: newTime };
          }
          return layer;
        });
      });
    }
    setTimeOpen(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className=" "
    >
      <AccordionItem value={Layers.id.toString()} className="rounded-t-lg flex flex-col border-none min-w-full">

        <AccordionTrigger>
          <div className="cursor-grab active:cursor-grabbing flex items-center">
            <DotsVerticalIcon className="h-5 w-5" />
            <DotsVerticalIcon className="-ml-3 h-5 w-5" />
          </div>
          <span className="text-sm font-medium">{date.toISOString().split("T")[0] + "/" + Layers.processingLevel + "/" + (Layers.layerType === "Singleband" ? Layers.bandNames[0] : "RGB")}</span>

          {/* Delete button */}
          <div className="ml-auto mr-2" onClick={(e) => {
            e.stopPropagation(); // Prevent accordion toggle
            if (layerIndex !== -1) {
              removeLayer(layerIndex);
            }
          }}>
            <Trash2Icon className="h-4 w-4 text-red-500 hover:text-red-400" />
          </div>
        </AccordionTrigger>

        <AccordionContent>
          {/* Date and Time Selectors */}
          <div className="mb-4 flex gap-2 flex-col">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1 text-white">Date</p>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild className="text-white font-semibold">
                  <div
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? date.toISOString().split("T")[0] : <span>Pick a date</span>}
                  </div>
                </PopoverTrigger>
                {
                  availableDates.length > 0 && (
                    <PopoverContent className="w-auto" align="start">
                      <CalendarComponent
                        disabled={(date) =>
                          date > new Date() || date < new Date(new Date().setMonth(new Date().getMonth() - 3)) ||
                          !availableDates.some((availableDate) => new Date(availableDate.date).toDateString() === date.toDateString())
                        }
                        mode="single"
                        selected={new Date(date.getFullYear(), date.getMonth(), date.getDate())}
                        className="bg-neutral-800 text-white flex flex-col"
                        onSelect={handleDateChange}
                      />
                    </PopoverContent>
                  )
                }

              </Popover>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium mb-1 text-white">Time</p>
              <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                <PopoverTrigger asChild className="text-white font-semibold">
                  <div
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  >
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-neutral-800">
                  <Command className="text-white">
                    <CommandInput placeholder="Search time..." className="h-9" />
                    <CommandEmpty>No time found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {allTimes.map((timeOption) => (
                        <CommandItem
                          key={timeOption}
                          value={timeOption}
                          onSelect={handleTimeChange}
                          className="text-white font-semibold"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-white",
                              time === timeOption ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {timeOption}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {Layers.bandNames.map((bandName, idx) => (
            <div key={idx} className="mb-4">
              <Select>
                <SelectTrigger
                  className={cn(
                    "bg-transparent h-[27px] font-semibold text-white",
                    // Layers.bandNames.length === 3 && parseInt(Layers.bandIDs[idx]) === 1 && "text-red-600",
                    // Layers.bandNames.length === 3 && parseInt(Layers.bandIDs[idx]) === 2 && "text-green-600",
                    // Layers.bandNames.length === 3 && parseInt(Layers.bandIDs[idx]) === 3 && "text-blue-600"
                  )}
                >
                  <SelectValue
                    placeholder={bandName}
                  />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-background font-semibold">
                  {
                    allBands?.bands.map((band) => (
                      <ListItem
                        className="hover:bg-neutral-400 bg-neutral-800"

                        onClick={() => {
                          const bandName = band.description;
                          const newSelectedBands = [...selectedBands];
                          newSelectedBands[idx] = bandName;
                          setSelectedBands(newSelectedBands);

                          const newBandIDs = [...Layers.bandIDs];
                          newBandIDs[idx] = band.bandId.toString();

                          const newMinMax = [...Layers.minMax];
                          newMinMax[idx] = {
                            min: band.minimum,
                            max: band.maximum,
                            minLim: band.minimum,
                            maxLim: band.maximum,
                          };

                          setMinMax(newMinMax);

                          updateLayerFunc(layerIndex, {
                            bandNames: newSelectedBands,
                            bandIDs: newBandIDs,
                            minMax: newMinMax,
                          });

                          setLayers((prev) => {
                            return (prev ?? []).map((layer, id) => {
                              if (id === layerIndex) {
                                return {
                                  ...layer,
                                  bandNames: newSelectedBands,
                                  bandIDs: newBandIDs,
                                  minMax: newMinMax,
                                };
                              }
                              return layer;
                            });
                          })

                        }}
                        checked={
                          bandName ===
                          band.description
                        }
                      >
                        {band.description}
                      </ListItem>
                    )
                    )}
                </SelectContent>
              </Select>

              <div className="mb-2">

                <div className="flex justify-between text-background text-xs font-medium mb-1">
                  <div className="mt-1">
                    MinMax
                    {minMaxError[idx]?.minError && (
                      <span className="text-red-600 font-medium ml-1">
                        ({minMaxError[idx].minError})
                      </span>
                    )}
                  </div>
                  <div>
                    {minMaxError[idx]?.maxError && (
                      <span className="text-red-600 font-medium ml-1">
                        ({minMaxError[idx].maxError})
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative mt-2">
                  <DualRangeSlider
                    value={[minMax[idx].min, minMax[idx].max]}
                    min={Layers.minMax[idx].minLim}
                    max={Layers.minMax[idx].maxLim}
                    step={(Layers.minMax[idx].maxLim - Layers.minMax[idx].minLim) / 100}
                    minStepsBetweenThumbs={1}
                    className="mt-2"
                    onValueChange={(values) => handleMinMaxChange(idx, values)}
                  />
                </div>

                <div className="flex justify-between text-background text-xs mt-1">
                  <span>{Layers.minMax[idx].minLim}</span>
                  <span>{Layers.minMax[idx].maxLim}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="w-full flex items-start">
            {hasMinMaxChanged() && !hasErrors() && (
              <Button
                className="  mb-2 text-xs font-normal h-[30px]"
                onClick={() => {
                  Layers.minMax.forEach((_, idx) => {
                    updateMinMax(
                      layerIndex,
                      minMax[idx].min,
                      minMax[idx].max,
                      idx
                    );
                  });
                }}
              >
                Apply
              </Button>
            )}
          </div>
          {Layers.layerType === "Singleband" && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1 text-white">ColorMap</p>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild className="text-white font-semibold">
                  <div
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  >
                    {colorMapValue
                      ? colorMapValue
                      : "Select colormap..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-neutral-800">
                  <Command className="">
                    <CommandInput placeholder="Search colormap..." className="h-9" />
                    <CommandEmpty>No colormap found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {availableColorMaps.map((colorMap) => (
                        <CommandItem
                          key={colorMap}
                          value={colorMap}
                          className="text-white font-semibold"
                          onSelect={(currentValue) => {
                            setColorMapValue(currentValue);

                            if (layerIndex !== -1) {
                              updateColorMap(layerIndex, currentValue);
                            }

                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-white",
                              colorMapValue === colorMap ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {colorMap}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          <div>
            <p className="text-background text-xs font-medium mb-2">
              Layer Transparency
            </p>
            <Slider
              title={"Transparency"}
              value={[Layers.transparency * 100]}
              step={10}
              onValueChange={(val) => {
                const newOpacity = val[0] / 100;

                setLayers((prev) => {
                  return prev.map((layer) => {
                    if (layer.id === Layers.id) {
                      layer.transparency = newOpacity;
                    }
                    return layer;
                  });
                });

                if (layerIndex !== -1) {
                  updateOpacity(layerIndex, newOpacity);
                }
              }}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

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
            layer.layerType === "RGB" && (
              <MultiBandLayerItem
                key={layer.id}
                Layers={layer}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            )
          ))}
        </Accordion>
      </div>

    </div>
  );
}
