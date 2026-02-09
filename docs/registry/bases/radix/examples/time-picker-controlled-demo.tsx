"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerLabel,
  TimePickerMinute,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/registry/bases/radix/ui/time-picker";

export default function TimePickerControlledDemo() {
  const [value, setValue] = React.useState("14:30");

  return (
    <div className="flex flex-col gap-4">
      <TimePicker className="w-[280px]" value={value} onValueChange={setValue}>
        <TimePickerLabel>Controlled Time Picker</TimePickerLabel>
        <TimePickerInputGroup>
          <TimePickerInput segment="hour" />
          <TimePickerSeparator />
          <TimePickerInput segment="minute" />
          <TimePickerTrigger />
        </TimePickerInputGroup>
        <TimePickerContent>
          <TimePickerHour />
          <TimePickerMinute />
        </TimePickerContent>
      </TimePicker>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setValue("09:00")}>
          Set 9:00 AM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setValue("14:30")}>
          Set 2:30 PM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setValue("")}>
          Clear
        </Button>
      </div>
      <div className="text-muted-foreground text-sm">
        Selected time:{" "}
        <span className="font-mono font-semibold">{value || "None"}</span>
      </div>
    </div>
  );
}
