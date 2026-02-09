import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerLabel,
  TimePickerMinute,
  TimePickerSecond,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/registry/bases/radix/ui/time-picker";

export default function TimePickerStepDemo() {
  return (
    <TimePicker
      className="w-[280px]"
      defaultValue="10:00"
      minuteStep={15}
      secondStep={10}
    >
      <TimePickerLabel>Meeting Time (15 min intervals)</TimePickerLabel>
      <TimePickerInputGroup>
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        <TimePickerTrigger />
      </TimePickerInputGroup>
      <TimePickerContent>
        <TimePickerHour />
        <TimePickerMinute />
        <TimePickerSecond />
      </TimePickerContent>
    </TimePicker>
  );
}
