"use client";

import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerLabel,
  TimePickerMinute,
  TimePickerSecond,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/registry/bases/radix/ui/time-picker";

export default function TimePickerSecondsDemo() {
  return (
    <TimePicker defaultValue="14:30:45" className="w-[280px]" showSeconds>
      <TimePickerLabel>Select Time with Seconds</TimePickerLabel>
      <TimePickerInputGroup>
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        <TimePickerSeparator />
        <TimePickerInput segment="second" />
        <TimePickerTrigger />
      </TimePickerInputGroup>
      <TimePickerContent>
        <TimePickerHour />
        <TimePickerMinute />
        <TimePickerSecond />
      </TimePickerContent>
    </TimePicker>
  );
}
