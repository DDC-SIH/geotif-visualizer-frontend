/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface BandArithmeticTabProps {
  type: string;
  processingLevel: string;
  onAdd: (data: any) => void;
}

export function BandArithmeticTab({
  type,
  processingLevel,
  onAdd,
}: BandArithmeticTabProps) {
  const [expression, setExpression] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleAdd = () => {
    if (!expression || !name) return;

    onAdd({
      mode: "arithmetic",
      type,
      processingLevel,
      expression,
      name,
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Expression Name</label>
          <Input
            placeholder="Enter a name for this expression"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Band Arithmetic Expression
          </label>
          <Textarea
            placeholder="Example: (B4-B3)/(B4+B3) for NDVI"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="min-h-[100px] bg-white"
          />
          <p className="text-xs text-muted-foreground">
            Use band names like TIR1, TIR2, etc. with mathematical operators (+,
            -, *, /, etc.)
          </p>
        </div>

        <Button
          className="w-full mt-6"
          onClick={handleAdd}
          disabled={!expression || !name}
        >
          Add Expression
        </Button>
      </CardContent>
    </Card>
  );
}
