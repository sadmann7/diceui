"use client";

import * as React from "react";
import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePickerControlledDemo() {
  const [value, setValue] = React.useState("14:30");

  return (
    <div className="space-y-4">
      <TimePicker.Root
        className="w-[280px] space-y-2"
        value={value}
        onValueChange={setValue}
      >
        <TimePicker.Label>Controlled Time Picker</TimePicker.Label>
        <TimePicker.Trigger />
        <TimePicker.Content>
          <div className="flex gap-2">
            <TimePicker.Hour />
            <TimePicker.Minute />
          </div>
        </TimePicker.Content>
      </TimePicker.Root>
      <div className="text-muted-foreground text-sm">
        Selected time:{" "}
        <span className="font-mono font-semibold">{value || "None"}</span>
      </div>
    </div>
  );
}
