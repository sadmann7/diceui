import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePickerSecondsDemo() {
  return (
    <TimePicker.Root className="w-[280px] space-y-2" showSeconds>
      <TimePicker.Label>Select Time with Seconds</TimePicker.Label>
      <TimePicker.Trigger />
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
