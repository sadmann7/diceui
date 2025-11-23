import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePicker12HourDemo() {
  return (
    <TimePicker.Root className="w-[280px] space-y-2" use12Hours>
      <TimePicker.Label>Select Time (12-hour)</TimePicker.Label>
      <TimePicker.Trigger />
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
