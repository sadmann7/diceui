import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePickerDemo() {
  return (
    <TimePicker.Root className="w-[280px] space-y-2">
      <TimePicker.Label>Select Time</TimePicker.Label>
      <TimePicker.Trigger />
      <TimePicker.Content>
        <div className="flex gap-2">
          <TimePicker.Hour />
          <TimePicker.Minute />
        </div>
      </TimePicker.Content>
    </TimePicker.Root>
  );
}
