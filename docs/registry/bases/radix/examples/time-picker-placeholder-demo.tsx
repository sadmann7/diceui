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

export default function TimePickerPlaceholderDemo() {
  return (
    <div className="flex flex-col gap-6">
      <TimePicker className="w-[280px]" segmentPlaceholder="--">
        <TimePickerLabel>Default (--)</TimePickerLabel>
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

      <TimePicker
        className="w-[280px]"
        segmentPlaceholder={{ hour: "hh", minute: "mm", period: "aa" }}
      >
        <TimePickerLabel>Custom (hh:mm aa)</TimePickerLabel>
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
    </div>
  );
}
