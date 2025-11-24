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
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/registry/default/ui/time-picker";

export default function TimePickerMinuteStepDemo() {
  const [value, setValue] = React.useState("10:00");

  return (
    <TimePicker
      className="w-[280px]"
      minuteStep={15}
      value={value}
      onValueChange={setValue}
    >
      <TimePickerLabel>Meeting Time (15 min intervals)</TimePickerLabel>
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
  );
}
