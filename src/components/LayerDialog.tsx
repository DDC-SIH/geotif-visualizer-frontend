import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CalendarIcon, Calendar } from "lucide-react";
// import { format } from 'date-fns'
import { Button } from "./ui/button";
import {
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { useState } from "react";
import { TimePicker, TimePickerProps } from "antd";

export default function LayerDialog() {
  const [startDate, setStartDate] = useState<Date>(new Date("04sep2024"));
  const [endDate, setEndDate] = useState<Date>(new Date("06SEP2024"));
  const [processingLevel, setProcessingLevelLayer] = useState<string>("L1C");

  const onStartTimeChange: TimePickerProps["onChange"] = (
    _time,
    timeString
  ) => {
    if (startDate) {
      const updatedDate = new Date(startDate);
      const [hours, minutes] = (timeString as string).split(":").map(Number);
      updatedDate.setHours(hours, minutes);
      setStartDate(updatedDate);
    }
  };
  const onEndTimeChange: TimePickerProps["onChange"] = (_time, timeString) => {
    if (endDate) {
      const updatedDate = new Date(endDate);
      const [hours, minutes] = (timeString as string).split(":").map(Number);
      updatedDate.setHours(hours, minutes);
      setEndDate(updatedDate);
    }
  };

  return (
    <DialogContent className="max-w-screen-lg">
      <DialogTitle>Add Layer</DialogTitle>
      <DialogDescription>
        Add Singleband, multiband or band arithmatic
      </DialogDescription>

      <div className="grid grid-cols-3 gap-2 my-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                " justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {/* {startDate ? (
          format(startDate, "PPP")
        ) : (
          <span>Pick start date</span>
        )} */}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 z-[9999]" align="start">
            <Calendar
              mode="single"
              // selected={startDate}
              // onSelect={setStartDate}
              // initialFocus
            />
            <TimePicker
              onChange={onStartTimeChange}
              // value={dayjs(
              //   startDate
              //     ? `${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`
              //     : "00:00:00",
              //   "HH:mm:ss"
              // )}
              // showSecond={false}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                " justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {/* {endDate ? format(endDate, "PPP") : <span>Pick end date</span>} */}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 z-[9999]" align="start">
            <Calendar
              mode="single"
              // selected={endDate}
              // onSelect={setEndDate}
              // initialFocus
            />
            <TimePicker
              onChange={onEndTimeChange}
              // value={}
              showSecond={false}
            />
          </PopoverContent>
        </Popover>

        <Select onValueChange={setProcessingLevelLayer} defaultValue="L1C">
          <SelectTrigger className="min-w-full">
            <SelectValue placeholder="Choose Processing Level" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="L1B">L1B</SelectItem>
            <SelectItem value="L1C">L1C</SelectItem>
            <SelectItem value="L2B">L2B</SelectItem>
            <SelectItem value="L2C">L2C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button>Add</Button>
      </DialogFooter>
    </DialogContent>
  );
}
