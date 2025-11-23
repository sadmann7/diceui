"use client";

import * as React from "react";
import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePickerStepDemo() {
  const [value, setValue] = React.useState("10:00");

  return (
    <TimePicker.Root
      className="w-[280px] space-y-2"
      minuteStep={15}
      value={value}
      onValueChange={setValue}
    >
      <TimePicker.Label>Meeting Time (15 min intervals)</TimePicker.Label>
      <TimePicker.InputGroup>
        <TimePicker.Input segment="hour" />
        <TimePicker.Separator />
        <TimePicker.Input segment="minute" />
        <TimePicker.Trigger />
      </TimePicker.InputGroup>
      <TimePicker.Content>
        <div className="flex gap-2">
          <TimePicker.Hour />
          <TimePicker.Minute />
        </div>
      </TimePicker.Content>
    </TimePicker.Root>
  );
}
