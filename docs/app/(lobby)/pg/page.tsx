import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TimePicker12HourDemo from "@/registry/default/examples/time-picker-12hour-demo";
import TimePickerControlledDemo from "@/registry/default/examples/time-picker-controlled-demo";
import TimePickerDemo from "@/registry/default/examples/time-picker-demo";
import TimePickerFormDemo from "@/registry/default/examples/time-picker-form-demo";
import TimePickerSecondsDemo from "@/registry/default/examples/time-picker-seconds-demo";
import TimePickerStepDemo from "@/registry/default/examples/time-picker-step-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <div className="flex flex-col gap-4">
          <input type="time" />
          <TimePickerDemo />
          <TimePickerSecondsDemo />
          <TimePicker12HourDemo />
          <TimePickerFormDemo />
          <TimePickerStepDemo />
          <TimePickerControlledDemo />
        </div>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
