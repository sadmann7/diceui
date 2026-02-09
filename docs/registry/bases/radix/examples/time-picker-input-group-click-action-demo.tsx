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

export default function TimePickerInputGroupClickActionDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <TimePicker className="w-[280px]">
          <TimePickerLabel>Click empty space to focus</TimePickerLabel>
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

      <div className="flex flex-col gap-4">
        <TimePicker className="w-[280px]" inputGroupClickAction="open">
          <TimePickerLabel>Click empty space to open popover</TimePickerLabel>
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
    </div>
  );
}
