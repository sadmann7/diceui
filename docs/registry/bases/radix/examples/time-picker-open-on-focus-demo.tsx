import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerLabel,
  TimePickerMinute,
  TimePickerPeriod,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/registry/bases/radix/ui/time-picker";

export default function TimePickerOpenOnFocusDemo() {
  return (
    <TimePicker className="w-[280px]" openOnFocus>
      <TimePickerLabel>Meeting Time</TimePickerLabel>
      <TimePickerInputGroup>
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        <TimePickerInput segment="period" />
        <TimePickerTrigger />
      </TimePickerInputGroup>
      <TimePickerContent>
        <TimePickerHour />
        <TimePickerMinute />
        <TimePickerPeriod />
      </TimePickerContent>
    </TimePicker>
  );
}
