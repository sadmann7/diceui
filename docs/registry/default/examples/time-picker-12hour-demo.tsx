"use client";

import * as React from "react";
import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerLabel,
  TimePickerMinute,
  TimePickerPeriod,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/registry/default/ui/time-picker";

export default function TimePicker12HourDemo() {
  return (
    <TimePicker defaultValue="09:30" className="w-[280px]" use12Hours>
      <TimePickerLabel>Select Time (12-hour)</TimePickerLabel>
      <TimePickerInputGroup>
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        <span className="mx-1" />
        <TimePickerInput segment="period" />
        <TimePickerTrigger />
      </TimePickerInputGroup>
      <TimePickerContent>
        <TimePickerHour />
        <TimePickerMinute />
        <TimePickerPeriod />
        <TimePickerPeriod />
      </TimePickerContent>
    </TimePicker>
  );
}
