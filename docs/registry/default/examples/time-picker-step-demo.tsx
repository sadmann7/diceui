import * as TimePicker from "@/registry/default/ui/time-picker";

export default function TimePickerStepDemo() {
  return (
    <TimePicker.Root
      className="w-[280px] space-y-2"
      minuteStep={15}
      placeholder="Select time (15 min intervals)"
    >
      <TimePicker.Label>Meeting Time</TimePicker.Label>
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
