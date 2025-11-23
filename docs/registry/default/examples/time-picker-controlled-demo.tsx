"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
