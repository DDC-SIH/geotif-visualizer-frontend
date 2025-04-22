/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { CogItem } from "@/types/cog";
import { Layers } from "@/constants/consts";
import { convertFromTimestamp } from "@/utils/convertFromTimeStamp";
import { useGeoData } from "@/contexts/GeoDataProvider";
import { fetchBands } from "@/apis/req";
import { TZDate } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BandArithmaticProps {
  product: string;
  processingLevel: string;
  satelliteId: string;
  onAdd: (data: any) => void;
  toggleOpen?: () => void;
}

export function BandArithmaticTab({
  product,
  processingLevel,
  satelliteId,
  toggleOpen,
}: BandArithmaticProps) {
  const [arithmeticExpression, setArithmeticExpression] = useState<string>("");
  const [expressionError, setExpressionError] = useState<string>("");
  const [allBands, setAllBands] = useState<CogItem>();
  const [isLoading, setIsLoading] = useState(false);
  const { addLayer } = useGeoData();

  useEffect(() => {
    if (satelliteId && processingLevel) {
      setIsLoading(true);
      fetchBands({ satID: satelliteId, processingLevel: processingLevel, productCode: product })
        .then((data) => {
          setAllBands(data?.cog);
          // Reset expression when data changes
          setArithmeticExpression("");
          setExpressionError("");
        })
        .catch(err => {
          console.error("Error fetching bands:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [processingLevel, satelliteId, product]);

  // Function to validate the expression and extract band IDs
  const validateExpression = (expression: string): { valid: boolean, error: string, usedBands: string[] } => {
    if (!expression.trim()) {
      return { valid: false, error: "Expression is empty", usedBands: [] };
    }

    if (!allBands || !allBands.bands.length) {
      return { valid: false, error: "No bands available", usedBands: [] };
    }

    const usedBands: string[] = [];
    const bandMap = new Map(allBands.bands.map(band => [band.bandId.toString(), band.description]));

    // Get all band IDs mentioned in the expression
    const bandIds = Array.from(bandMap.keys()).map(id => `b${id}`);
    const bandIdRegex = new RegExp(`\\b(${bandIds.join('|')})\\b`, 'g');
    const matches = expression.match(bandIdRegex);

    if (!matches) {
      return { valid: false, error: "No valid band IDs found in expression", usedBands: [] };
    }

    // Extract unique band IDs
    const uniqueBandIds = [...new Set(matches)];
    usedBands.push(...uniqueBandIds);

    // Basic syntax validation - check for allowed operators and balanced parentheses
    const operatorsRegex = /[^0-9b\s\+\-\*\/\(\)\.\^]/g;
    const invalidChars = expression.match(operatorsRegex);
    if (invalidChars) {
      return { valid: false, error: `Invalid characters in expression: ${invalidChars.join(', ')}`, usedBands };
    }

    // Check for balanced parentheses
    let parenthesesCount = 0;
    for (const char of expression) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) {
        return { valid: false, error: "Unbalanced parentheses", usedBands };
      }
    }

    if (parenthesesCount !== 0) {
      return { valid: false, error: "Unbalanced parentheses", usedBands };
    }

    return { valid: true, error: "", usedBands };
  };

  const handleAdd = () => {
    if (!allBands) return;

    // Validate expression
    const { valid, error, usedBands } = validateExpression(arithmeticExpression);

    if (!valid) {
      setExpressionError(error);
      return;
    }

    setExpressionError("");

    // Generate min/max values for each band used in expression
    const bandMinMaxes = usedBands.map(bandId => {
      const band = allBands.bands.find(b => b.bandId.toString() === bandId);
      if (!band) return { min: 0, max: 0, minLim: 0, maxLim: 0 };

      return {
        min: band.min,
        max: band.max,
        minLim: band.minimum,
        maxLim: band.maximum
      };
    });

    // Get band names from IDs
    const bandNames = usedBands.map(bandId => {
      const band = allBands.bands.find(b => b.bandId.toString() === bandId);
      return band ? band.description : bandId;
    });

    const layer: Layers = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${new TZDate(allBands?.aquisition_datetime as number, "UTC").toISOString().split("T")[0] || ""} / ${convertFromTimestamp(allBands?.aquisition_datetime as number)} / ${processingLevel} / ${product} /  Band Arithmetic`,
      layerType: "BandArithmatic",
      date: new TZDate(allBands?.aquisition_datetime as number, "UTC"),
      time: convertFromTimestamp(allBands?.aquisition_datetime as number),
      satID: satelliteId || "",
      bandNames: bandNames,
      bandIDs: usedBands,
      minMax: bandMinMaxes,
      url: `${allBands?.filepath || ""}/${allBands?.filename || ""}`,
      colormap: undefined,
      transparency: 1,
      processingLevel: allBands?.processingLevel,
      productCode: allBands?.productCode,
      layer: "",
      expression: arithmeticExpression
    };

    addLayer(layer);
    toggleOpen && toggleOpen();
  };

  // Helper function to insert band ID into expression
  const insertBandToExpression = (bandId: string) => {
    setArithmeticExpression(prev => {
      // Get current input field
      const inputElement = document.getElementById('arithmetic-expression') as HTMLInputElement | null;
      // Use cursor position if available, otherwise append to the end
      const cursorPosition = inputElement?.selectionStart ?? prev.length;
      const newExpression = prev.substring(0, cursorPosition) + bandId + prev.substring(cursorPosition);
      return newExpression;
    });

    // Focus back on input after inserting
    setTimeout(() => {
      const inputElement = document.getElementById('arithmetic-expression') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  };

  return (
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
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm font-medium text-primary-foreground">Band Arithmetic Expression</h3>
                  <div className="ml-2 h-4 w-4 text-neutral-400 cursor-help" title="Enter mathematical expressions using band IDs and operators (+, -, *, /, ^). Example: (B4-B3)/(B4+B3) for NDVI">ⓘ</div>
                </div>
                <Input
                  id="arithmetic-expression"
                  placeholder="e.g., (B4-B3)/(B4+B3)"
                  className="bg-neutral-900 border-neutral-700 text-primary-foreground"
                  value={arithmeticExpression}
                  onChange={(e) => setArithmeticExpression(e.target.value)}
                />
                {expressionError && (
                  <p className="mt-1 text-xs text-red-500">{expressionError}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center mb-2">
                  <h3 className="text-sm font-medium text-primary-foreground">Available Bands</h3>
                  <p className="ml-2 text-xs text-neutral-400">(Click to add to expression)</p>
                </div>
                <div className="max-h-60 overflow-y-auto rounded-md border border-neutral-700">
                  <Table>
                    <TableHeader className="sticky top-0 bg-neutral-900">
                      <TableRow>
                        <TableHead className="text-primary-foreground">Band ID</TableHead>
                        <TableHead className="text-primary-foreground">Description</TableHead>
                        {/* <TableHead className="text-primary-foreground text-right">Range</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allBands?.bands.map((band) => (
                        <TableRow
                          key={band.bandId}
                          className="cursor-pointer hover:bg-neutral-700/30"
                          onClick={() => insertBandToExpression("b" + band.bandId.toString())}
                        >
                          <TableCell className="font-medium text-primary-foreground">{"b" + band.bandId.toString()}</TableCell>
                          <TableCell>{band.description}</TableCell>
                          {/* <TableCell className="text-right">{band.minimum} - {band.maximum}</TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {allBands && (
              <div className="p-2 bg-neutral-900/50 rounded-md text-xs text-neutral-400">
                <p>Date: {new Date(allBands.aquisition_datetime).toLocaleDateString()}</p>
              </div>
            )}
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleAdd}
              disabled={!arithmeticExpression || !!expressionError || !allBands}
            >
              Add Band Arithmetic Layer
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
