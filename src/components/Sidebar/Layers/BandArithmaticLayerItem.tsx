import { useState, useEffect, useRef } from "react";
import { useGeoData } from "../../../contexts/GeoDataProvider";
import { Layers } from "@/constants/consts";
import { Slider } from "../../ui/slider";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../../ui/accordion";
import { Trash2Icon, Check, ChevronsUpDown, Calendar, Clock, CodeIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "../../ui/calendar";
import { fetchAvailableTimes, fetchAvailableDates, fetchAvailableBandsWithDateTime } from "@/apis/req";
import { TZDate } from "react-day-picker";
import { convertFromTimestamp } from "@/utils/convertFromTimeStamp";
import { BandData } from "@/types/cog";
import { Input } from "@/components/ui/input";

export function BandArithmaticLayerItem({ Layers, index, onDragStart, onDragOver, onDrop }: {
    Layers: Layers,
    index: number,
    onDragStart: (e: React.DragEvent, index: number) => void,
    onDragOver: (e: React.DragEvent) => void,
    onDrop: (e: React.DragEvent, index: number) => void
}) {
    const { setLayers, Layers: allLayers, updateOpacity, removeLayer, updateLayerFunc } = useGeoData();
    const [expression, setExpression] = useState<string>(Layers.expression || "");

    // Date and time state
    const [date, setDate] = useState<Date | undefined>(Layers.date);
    const [dateOpen, setDateOpen] = useState(false);
    const [time, setTime] = useState(Layers.time);
    const [timeOpen, setTimeOpen] = useState(false);
    const [allTimes, setAllTimes] = useState<string[]>([]);
    const [allBands, setAllBands] = useState<BandData[]>();
    const [availableDates, setAvailableDates] = useState<{ date: string; datetime: number }[]>([]);
    const firstLoad = useRef(true);

    useEffect(() => {
        console.log("BandArithmaticLayerItem mounted");
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

        const thisBand = allBands[0]; // Default to the first band for date/time info
        if (!thisBand) return;

        const updatedLayerProp = {
            date: new TZDate(thisBand?.aquisition_datetime as number, "UTC"),
            time: convertFromTimestamp(thisBand?.aquisition_datetime as number),
            url: `${thisBand?.filepath || ""}/${thisBand?.filename || ""}`,
            processingLevel: thisBand?.processingLevel,
            productCode: thisBand?.productCode,
            satID: thisBand?.satelliteId,
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

    // Handle expression update
    const handleExpressionUpdate = () => {
        if (expression !== Layers.expression && layerIndex !== -1) {
            updateLayerFunc(layerIndex, { expression });

            setLayers((prev) => {
                if (!prev) return null;
                return prev.map((layer, idx) => {
                    if (idx === layerIndex) {
                        return { ...layer, expression };
                    }
                    return layer;
                });
            });
        }
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
                      {Layers.name}
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

                    {/* Band Arithmetic Expression */}
                    <div className="mb-4">
                        <p className="text-sm font-medium mb-1 text-white flex items-center">
                            <CodeIcon className="mr-2 h-4 w-4" />
                            Band Arithmetic Expression
                        </p>
                        <div className="flex">
                            <Input
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                className="bg-neutral-900 border-neutral-700 text-primary-foreground"
                                placeholder="e.g., (B4-B3)/(B4+B3)"
                            />
                            <Button
                                className="ml-2 h-9"
                                onClick={handleExpressionUpdate}
                                disabled={expression === Layers.expression}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>

                    {/* Used Bands Display */}
                    {Layers.bandIDs && Layers.bandIDs.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-1 text-white">Used Bands</p>
                            <div className="bg-neutral-900 rounded-md p-2 text-sm text-primary-foreground">
                                {Layers.bandIDs.map((bandId, idx) => (
                                    <div key={idx} className="mb-1 flex justify-between">
                                        <span>{bandId}</span>
                                        <span className="text-neutral-400">{Layers.bandNames[idx]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Layer Transparency */}
                    <div>
                        <p className="text-white text-xs font-medium mb-2">
                            Layer Transparency
                        </p>
                        <Slider
                            title="Transparency"
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