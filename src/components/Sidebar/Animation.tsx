/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MultiBandTab } from "@/components/addLayer/multi-band-tab";
import { SingleBandTab } from "@/components/addLayer/single-band-tab";
// import { Separator } from "./ui/separator";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/singleselector";
import { Plus, Satellite, Layers, Box, LayersIcon, CalendarIcon, Download, Loader2 } from "lucide-react";
import { fetchAvailableBandNames, fetchAvailableProductCodes, fetchBands, fetchLatestAvailableBandsWithData, fetchProcessingLevels, fetchSatelites } from "@/apis/req";
import { BandData, CogItem } from "@/types/cog";
import { DEFAULT_SATELLITE } from "@/constants/addLayerConsts";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format, isAfter } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useGeoData } from "../../contexts/GeoDataProvider";

interface BandSelection {
    name: string;
    id: string;
    minMax: {
        min: number;
        max: number;
        minLim: number;
        maxLim: number;
    };
}
interface SatelliteBandDialogProps {
    trigger?: React.ReactNode;
}

export default function Animation() {
    const [redBand, setRedBand] = useState<BandSelection>({
        name: "",
        id: "",
        minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
    });
    const [greenBand, setGreenBand] = useState<BandSelection>({
        name: "",
        id: "",
        minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
    });
    const [blueBand, setBlueBand] = useState<BandSelection>({
        name: "",
        id: "",
        minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 }
    });
    const [allBands, setAllBands] = useState<CogItem>();
    const [isMultiLoading, setMultiIsLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"single" | "multi">("single");
    const [availableProducts, setAvailableProducts] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [allSatelites, setAllSatelites] = useState<string[]>([]);
    const [satellite, setSatellite] = useState('');
    const [allProcessingLevels, setAllProcessingLevels] = useState<string[]>([]);
    const [processingLevel, setProcessingLevel] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: undefined,
        to: undefined,
    });
    const [interval, setInterval] = useState<number>(1);
    const [isDownloading, setIsDownloading] = useState(false);
    const [colormap, setColormap] = useState<string>("viridis");
    const [sendBBOX, setSendBBOX] = useState(false);

    const { bbox } = useGeoData();

    const selectBand = (channel: 'red' | 'green' | 'blue', val: string) => {
        const selectedBand = allBands?.bands.find((band) => band.description === val);
        if (!selectedBand) return;

        const bandInfo = {
            name: selectedBand.description,
            id: selectedBand.bandId.toString(),
            minMax: {
                min: selectedBand.min,
                max: selectedBand.max,
                minLim: selectedBand.minimum,
                maxLim: selectedBand.maximum,
            }
        };

        if (channel === 'red') setRedBand(bandInfo);
        if (channel === 'green') setGreenBand(bandInfo);
        if (channel === 'blue') setBlueBand(bandInfo);
    };

    const [band, setBand] = useState<BandData | null>(null);
    const [allSingleBands, setAllSingleBands] = useState<BandData[]>([]);
    const [isSingleLoading, setIsSingleLoading] = useState(false);
    useEffect(() => {
        if (DEFAULT_SATELLITE && processingLevel && selectedProduct) {
            setIsSingleLoading(true);
            fetchLatestAvailableBandsWithData(DEFAULT_SATELLITE, processingLevel, selectedProduct)
                .then((data) => {
                    setAllSingleBands(data.bandData || []);
                    if (data.bandData && data.bandData.length > 0) {
                        setBand(data.bandData[0]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching band data:", err);
                })
                .finally(() => {
                    setIsSingleLoading(false);
                });
        }
    }, [processingLevel, selectedProduct, DEFAULT_SATELLITE]);
    useEffect(() => {
        if (satellite && processingLevel) {
            setIsLoading(true);
            fetchBands({ satID: satellite, processingLevel: processingLevel, productCode: selectedProduct })
                .then((data) => {
                    setAllBands(data?.cog);
                    setRedBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
                    setGreenBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
                    setBlueBand({ name: "", id: "", minMax: { min: 0, max: 0, minLim: 0, maxLim: 0 } });
                })
                .catch(err => {
                    console.error("Error fetching bands:", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [processingLevel, satellite, selectedProduct]);
    useEffect(() => {
        setIsLoading(true);
        fetchSatelites().then((data) => {
            const availableSatellites = data.satellites.map((sat) => sat.satelliteId);
            setAllSatelites(availableSatellites);
            setSatellite(availableSatellites[0]);

            fetchProcessingLevels(availableSatellites[0]).then((levels) => {
                const availableLevels = levels.processingLevels.map((level) => level);
                setAllProcessingLevels(availableLevels);
                setProcessingLevel(availableLevels[0]);

                fetchAvailableProductCodes(availableSatellites[0], availableLevels[0]).then((data) => {
                    const availableProducts = data.productCodes;
                    setAvailableProducts(availableProducts);
                    if (availableProducts.length > 0) {
                        setSelectedProduct(availableProducts[0]);
                    }
                    setIsLoading(false);
                });
            });
        }).catch(err => {
            console.error("Error fetching initial data:", err);
            setIsLoading(false);
        });
    }, [open]);

    useEffect(() => {
        if (satellite) {
            setIsLoading(true);
            fetchProcessingLevels(satellite).then((levels) => {
                const availableLevels = levels.processingLevels.map((level) => level);
                setAllProcessingLevels(availableLevels);
                setProcessingLevel(availableLevels[0]);
                setIsLoading(false);
            }).catch(err => {
                console.error("Error fetching processing levels:", err);
                setIsLoading(false);
            });
        }
    }, [satellite]);

    useEffect(() => {
        if (satellite && processingLevel) {
            setIsLoading(true);
            fetchAvailableProductCodes(satellite, processingLevel).then((data) => {
                const availableProducts = data.productCodes;
                setAvailableProducts(availableProducts);
                if (availableProducts.length > 0) {
                    setSelectedProduct(availableProducts[0]);
                }
                setIsLoading(false);
            }).catch(err => {
                console.error("Error fetching product codes:", err);
                setIsLoading(false);
            });
        }
    }, [satellite, processingLevel]);

    useEffect(() => {
        console.log(`Current active tab: ${activeTab}`);
    }, [activeTab]);

    const handleAdd = (data: any) => {
        const completeData = {
            ...data,
            satellite,
        };
        console.log("Selected data:", completeData);
        setOpen(false);
    };

    const handleDownloadGIF = async () => {
        if (!dateRange.from || !dateRange.to || !satellite || !processingLevel || !selectedProduct) {
            alert("Please fill in all required fields");
            return;
        }

        const selectedBand = activeTab === "single"
            ? band?.band
            : (redBand.id || greenBand.id || blueBand.id);

        if (!selectedBand) {
            alert("Please select at least one band");
            return;
        }

        try {
            setIsDownloading(true);

            const payload = {
                SatelliteId: satellite,
                processingLevel: processingLevel,
                productType: selectedProduct,
                bandName: activeTab === "single" ? band?.band : (redBand.name || greenBand.name || blueBand.name),
                startDateTime: dateRange.from.toISOString(),
                endDateTime: dateRange.to.toISOString(),
                interval: interval,
                colourmap: colormap,
                bbox: sendBBOX && bbox.active ? {
                    maxx: bbox.maxx,
                    maxy: bbox.maxy,
                    minx: bbox.minx,
                    miny: bbox.miny
                } : undefined
            };

            const baseUrl = 'http://74.226.242.56:5000';
            console.log("Payload for GIF generation:", payload);
            const response = await fetch(`${baseUrl}/generate-gif`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate GIF: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `animation_${satellite}_${processingLevel}_${selectedBand}.gif`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error generating GIF:', error);
            alert('An error occurred while generating the GIF');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <ScrollArea className="h-[calc(100vh-2rem)] pr-4">
            <div className="space-y-4 py-2 text-white">
                <Card className="bg-neutral-800 border-neutral-700 text-white">
                    <CardContent className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 gap-1">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Satellite className="h-4 w-4" /> Satellite
                                </label>
                                <Select value={satellite} onValueChange={setSatellite} disabled={isLoading}>
                                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                        <SelectValue placeholder="Select satellite" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                        {allSatelites.map((sat, index) => (
                                            <SelectItem key={index} value={sat}>
                                                {sat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Layers className="h-4 w-4" /> Processing Level
                                </label>
                                <Select value={processingLevel} onValueChange={setProcessingLevel} disabled={isLoading}>
                                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                        {allProcessingLevels.map((level, index) => (
                                            <SelectItem key={index} value={level}>
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Box className="h-4 w-4" /> Product
                                </label>
                                <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isLoading || availableProducts.length === 0}>
                                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                        <SelectValue placeholder="Select Product" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                        {availableProducts.map((product, index) => (
                                            <SelectItem key={index} value={product}>
                                                {product}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 mt-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" /> Date Range
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-neutral-900 border-neutral-700 text-primary-foreground hover:bg-neutral-800",
                                                !dateRange.from && !dateRange.to && "text-neutral-400"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Select date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-700" align="start">
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                            initialFocus
                                            className="bg-neutral-800 text-white"
                                            showOutsideDays={false}
                                            disabled={(date) => date > new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2 mt-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    Interval (days)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
                                    value={interval}
                                    onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                />
                            </div>

                            <div className="flex flex-col space-y-2 bg-neutral-800 p-3 rounded-md mt-2">
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
                        </div>
                    </CardContent>
                </Card>

                <Tabs
                    defaultValue="single"
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as "single" | "multi")}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
                        <TabsTrigger
                            value="single"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            Single Band
                        </TabsTrigger>
                        <TabsTrigger
                            value="multi"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            Multi Band
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        {isMultiLoading ? (
                            <div className="flex items-center justify-center p-8 text-neutral-400">
                                <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-white border-r-2 border-b-2 border-neutral-600 rounded-full"></div>
                                Loading data...
                            </div>
                        ) : (
                            <>
                                <TabsContent value="single">
                                    <Card className="bg-neutral-800 border-neutral-700">
                                        <CardContent className="space-y-4 pt-6">
                                            {isSingleLoading ? (
                                                <div className="flex items-center justify-center p-4 text-neutral-400">
                                                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white border-r-2 border-b-2 border-neutral-600 rounded-full"></div>
                                                    Loading bands...
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-primary-foreground flex items-center gap-1">
                                                            <LayersIcon className="h-4 w-4" /> Band Selection
                                                        </label>
                                                        <Select
                                                            value={band?.band || ''}
                                                            onValueChange={(value) => {
                                                                const selectedBand = allSingleBands.find((b) => b.band === value);
                                                                setBand(selectedBand || null);
                                                            }}
                                                            disabled={allSingleBands.length === 0}
                                                        >
                                                            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                                                <SelectValue placeholder="Select a band" />
                                                            </SelectTrigger>
                                                            <SelectContent
                                                                className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                                                                position="popper"
                                                                align="start"
                                                                sideOffset={5}
                                                            >
                                                                {allSingleBands.length > 0 ? allSingleBands.map((band, index) => (
                                                                    <SelectItem key={index} value={band.band} className="py-2.5">
                                                                        {band.band}
                                                                    </SelectItem>
                                                                )) : (
                                                                    <SelectItem value="none" disabled>No bands available</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-primary-foreground flex items-center gap-1">
                                                            Color Map
                                                        </label>
                                                        <Select
                                                            value={colormap}
                                                            onValueChange={setColormap}
                                                        >
                                                            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                                                <SelectValue placeholder="Select a colormap" />
                                                            </SelectTrigger>
                                                            <SelectContent
                                                                className="bg-neutral-900 border-neutral-700 text-primary-foreground"
                                                                position="popper"
                                                                align="start"
                                                                sideOffset={5}
                                                            >
                                                                {["viridis", "plasma", "inferno", "magma", "cividis", "turbo"].map((map) => (
                                                                    <SelectItem key={map} value={map} className="py-2.5">
                                                                        {map}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="multi">
                                    <Card className="bg-neutral-800 border-neutral-700">
                                        <CardContent className="space-y-4 pt-6">
                                            {isLoading ? (
                                                <div className="flex items-center justify-center p-4 text-neutral-400">
                                                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white border-r-2 border-b-2 border-neutral-600 rounded-full"></div>
                                                    Loading bands...
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-4">
                                                        {['Red', 'Green', 'Blue'].map((color, index) => {
                                                            const setBand = color === 'Red' ? (val: string) => selectBand('red', val) : color === 'Green' ? (val: string) => selectBand('green', val) : (val: string) => selectBand('blue', val);
                                                            const bgColor = color === 'Red' ? 'bg-red-500' : color === 'Green' ? 'bg-green-500' : 'bg-blue-500';

                                                            return (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <div className={`w-4 h-4 rounded-full ${bgColor}`}></div>
                                                                    <Select
                                                                        onValueChange={setBand}
                                                                        disabled={!allBands || allBands.bands.length === 0}
                                                                    >
                                                                        <SelectTrigger className="bg-neutral-900 border-neutral-700 text-primary-foreground">
                                                                            <SelectValue placeholder="Select band" />
                                                                        </SelectTrigger>
                                                                        <SelectContent
                                                                            className="bg-neutral-900 border-neutral-700 text-primary-foreground max-h-[35vh] overflow-y-auto"
                                                                            position="popper"
                                                                            align="start"
                                                                            sideOffset={5}
                                                                        >
                                                                            {allBands?.bands.map((option) => (
                                                                                <SelectItem key={option.bandId} value={option.description} className="py-2">
                                                                                    {option.description}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="arithmetic">
                                    <div className="bg-neutral-800 p-4 rounded-md text-center">
                                        <p className="text-neutral-400">Band arithmetic features coming soon</p>
                                    </div>
                                </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>

                <Button
                    variant="default"
                    className="w-full bg-primary hover:bg-primary/90 mt-4"
                    onClick={handleDownloadGIF}
                    disabled={
                        isDownloading ||
                        !dateRange.from ||
                        !dateRange.to ||
                        (activeTab === "single" ? !band : (!redBand.id && !greenBand.id && !blueBand.id))
                    }
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating GIF...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Generate & Download GIF
                        </>
                    )}
                </Button>
            </div>
        </ScrollArea>
    );
}
