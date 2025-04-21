import { useState, useEffect, useRef } from "react";
import { useGeoData } from "../../../contexts/GeoDataProvider";
import { Layers, } from "@/constants/consts";
import { Slider } from "../../ui/slider";
import { DualRangeSlider } from "../../ui/dual-range-slider";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../../ui/accordion";
import { Trash2Icon, Check, ChevronsUpDown, Calendar, Clock } from "lucide-react";
import { Button } from "../../ui/button";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../../ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../ui/popover";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { cn } from "@/lib/utils";
import ListItem from "../list-item";
import { Calendar as CalendarComponent } from "../../ui/calendar";
import { fetchAvailableTimes, fetchAvailableDates, fetchAllBands, fetchAvailableBandsWithDateTime } from "@/apis/req";
import { TZDate } from "react-day-picker";
import { convertFromTimestamp } from "@/utils/convertFromTimeStamp";
import { CogItem, BandData } from "@/types/cog";

export function MultiBandLayerItem({ Layers, index, onDragStart, onDragOver, onDrop }: {
    Layers: Layers,
    index: number,
    onDragStart: (e: React.DragEvent, index: number) => void,
    onDragOver: (e: React.DragEvent) => void,
    onDrop: (e: React.DragEvent, index: number) => void
}) {
    const { setLayers, Layers: allLayers, updateOpacity, updateMinMax, removeLayer, updateLayerFunc } = useGeoData();
    const [minMaxError, setMinMaxError] = useState(
        Layers.bandNames.map(() => ({ minError: "", maxError: "" }))
    );
    const [minMax, setMinMax] = useState(
        Layers.minMax.map((band) => ({
            min: band.min,
            max: band.max,
        }))
    );

    // Date and time state
    const [date, setDate] = useState<Date | undefined>(
        Layers.date
    );
    const [dateOpen, setDateOpen] = useState(false);

    const [time, setTime] = useState(Layers.time);
    const [timeOpen, setTimeOpen] = useState(false);
    const [allTimes, setAllTimes] = useState<string[]>([]);
    const [allBands, setAllBands] = useState<BandData[]>();
    const [selectedBands, setSelectedBands] = useState<string[]>(Layers.bandNames);
    const [availableDates, setAvailableDates] = useState<{ date: string; datetime: number }[]>([]);
    const firstLoad = useRef(true);

    useEffect(() => {
        console.log("MultiBandLayerItem mounted");
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
    }, []);

    function updateChanges(allBands: BandData[]) {
        console.log("Update changes called");

        // Create a copy of the current minMax values to update
        const newMinMax = [...Layers.minMax];

        // For each existing band, update its min/max limits from the allBands data if available
        Layers.bandIDs.forEach((bandId, index) => {
            const matchingBand = allBands.find(band => band.bands.bandId.toString() === bandId);
            if (matchingBand) {
                newMinMax[index] = {
                    min: matchingBand.bands.minimum,
                    max: matchingBand.bands.maximum,
                    minLim: matchingBand.bands.minimum,
                    maxLim: matchingBand.bands.maximum,
                };
            }
        });

        const thisBand = allBands[0]; // Default to the first band for date/time info
        if (!thisBand) return;

        const updatedLayerProp = {
            date: new TZDate(thisBand?.aquisition_datetime as number, "UTC"),
            time: convertFromTimestamp(thisBand?.aquisition_datetime as number),
            url: `${thisBand?.filepath || ""}/${thisBand?.filename || ""}`,
            minMax: newMinMax,
            processingLevel: thisBand?.processingLevel,
            productCode: thisBand?.productCode,
            satID: thisBand?.satelliteId,
            // Keep existing bandNames and bandIDs
        };

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
    }

    useEffect(() => {
        if (firstLoad.current) {
            console.log("First load, skipping effect");
            firstLoad.current = false;
            return;
        }

        // Fetch available times from the API
        fetchAvailableTimes(date as Date, Layers)
            .then((times) => {
                if (times) {
                    console.log({ times })
                    const convertedTimes = times.map((time) => convertFromTimestamp(time.aquisition_datetime));
                    console.log("Available times:", convertedTimes);
                    convertedTimes.find((time) => time === Layers.time) ? setTime(Layers.time) : setTime(convertedTimes[0]);
                    setAllTimes(convertedTimes);

                    fetchAvailableBandsWithDateTime(Layers.satID, Layers.processingLevel as string, date as Date, time)
                        .then((data) => {
                            if (data) {
                                console.log("Fetched all bands:", data);
                                setAllBands(data.bandData);
                                updateChanges(data.bandData);
                            }
                        })
                        .catch((error) => {
                            console.error("Error fetching all bands:", error);
                        });
                }
            })
            .catch((error) => {
                console.error("Error fetching available times:", error);
            });
    }, [date, time]);

    // Find the index of this layer in the context
    const layerIndex = allLayers?.findIndex((layer) => layer.id === Layers.id) ?? -1;

    // Update local state when layer properties change
    useEffect(() => {
        // Update minMax state
        setMinMax(Layers.minMax.map((band) => ({
            min: band.min,
            max: band.max,
        })));
    }, [Layers.minMax]);

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
            setLayers((prev) => {
                if (!prev) return null;
                return prev.map((layer, idx) => {
                    if (idx === layerIndex) {
                        return { ...layer, date: new TZDate(newDate, "UTC") };
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
                if (!prev) return null;
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
                    <span className="text-xs font-medium">
                        {`${date?.toISOString().split("T")[0] || ""} / ${time} / ${Layers.processingLevel} / ${Layers.productCode} / ${Layers.layerType === "Singleband" ? Layers.bandNames[0] : "RGB"
                            }`}
                    </span>

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
                                                timeZone="UTC"
                                                selected={date}
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
                                        allBands?.map((band) => (
                                            <ListItem
                                                className="hover:bg-neutral-400 bg-neutral-800"

                                                onClick={() => {
                                                    const bandName = band.bands.description;
                                                    const newSelectedBands = [...selectedBands];
                                                    newSelectedBands[idx] = bandName;
                                                    setSelectedBands(newSelectedBands);

                                                    const newBandIDs = [...Layers.bandIDs];
                                                    newBandIDs[idx] = band.bands.bandId.toString();

                                                    const newMinMax = [...Layers.minMax];
                                                    newMinMax[idx] = {
                                                        min: band.bands.minimum,
                                                        max: band.bands.maximum,
                                                        minLim: band.bands.minimum,
                                                        maxLim: band.bands.maximum,
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
                                                    band.bands.description
                                                }
                                            >
                                                {band.bands.description}
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
                                    if (!prev) return null;
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
