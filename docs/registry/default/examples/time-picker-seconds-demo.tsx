"use client";

import * as React from "react";
import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePickerSecondsDemo() {
  const [value, setValue] = React.useState("14:30:45");

  return (
    <TimePicker.Root
      className="w-[280px] space-y-2"
      showSeconds
      value={value}
      onValueChange={setValue}
    >
      <TimePicker.Label>Select Time with Seconds</TimePicker.Label>
      <TimePicker.InputGroup>
        <TimePicker.Input segment="hour" />
        <TimePicker.Separator />
        <TimePicker.Input segment="minute" />
        <TimePicker.Separator />
        <TimePicker.Input segment="second" />
        <TimePicker.Trigger />
      </TimePicker.InputGroup>
      <TimePicker.Content>
        <div className="flex gap-2">
          <TimePicker.Hour />
          <TimePicker.Minute />
          <TimePicker.Second />
        </div>
      </TimePicker.Content>
    </TimePicker.Root>
  );
}
