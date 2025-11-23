"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePickerFormDemo() {
  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const time = formData.get("appointment-time");
      toast.success(`Appointment scheduled for: ${time}`);
    },
    [],
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TimePicker.Root
        className="w-[280px] space-y-2"
        name="appointment-time"
        required
        defaultValue="09:00"
      >
        <TimePicker.Label>Appointment Time</TimePicker.Label>
        <TimePicker.InputGroup>
          <TimePicker.Input segment="hour" />
          <TimePicker.Separator />
          <TimePicker.Input segment="minute" />
          <TimePicker.Trigger />
        </TimePicker.InputGroup>
        <TimePicker.Content>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <TimePicker.Hour />
              <TimePicker.Minute />
            </div>
            <TimePicker.Clear className="w-full px-3 py-2" />
          </div>
        </TimePicker.Content>
      </TimePicker.Root>
      <Button type="submit">Schedule Appointment</Button>
    </form>
  );
}
