"use client";

import * as React from "react";
import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePicker12HourDemo() {
  const [value, setValue] = React.useState("09:30");

  return (
    <TimePicker.Root
      className="w-[280px] space-y-2"
      use12Hours
      value={value}
      onValueChange={setValue}
    >
      <TimePicker.Label>Select Time (12-hour)</TimePicker.Label>
      <TimePicker.InputGroup>
        <TimePicker.Input segment="hour" />
        <TimePicker.Separator />
        <TimePicker.Input segment="minute" />
        <span className="mx-1" />
        <TimePicker.Input segment="period" />
        <TimePicker.Trigger />
      </TimePicker.InputGroup>
      <TimePicker.Content>
        <div className="flex gap-2">
          <TimePicker.Hour />
          <TimePicker.Minute />
          <TimePicker.Period />
        </div>
      </TimePicker.Content>
    </TimePicker.Root>
  );
}
