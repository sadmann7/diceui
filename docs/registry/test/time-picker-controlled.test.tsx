import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseTimePicker from "@/registry/bases/base/ui/time-picker";
import * as RadixTimePicker from "@/registry/bases/radix/ui/time-picker";

Element.prototype.scrollIntoView = vi.fn();

describe.each([
  ["radix", RadixTimePicker],
  ["base", BaseTimePicker],
])(
  "TimePicker (%s) controlled",
  (
    _,
    {
      TimePicker,
      TimePickerClear,
      TimePickerContent,
      TimePickerHour,
      TimePickerInput,
      TimePickerInputGroup,
      TimePickerTrigger,
    },
  ) => {
    function renderTimePicker(value: string, onValueChange = vi.fn()) {
      function getTimePicker(nextValue: string) {
        return (
          <TimePicker
            locale="en-GB"
            value={nextValue}
            onValueChange={onValueChange}
          >
            <TimePickerInputGroup>
              <TimePickerInput segment="hour" aria-label="Hour" />
              <TimePickerInput segment="minute" aria-label="Minute" />
            </TimePickerInputGroup>
            <TimePickerClear />
          </TimePicker>
        );
      }
      const result = render(getTimePicker(value));
      return {
        onValueChange,
        rerender: (nextValue: string) =>
          result.rerender(getTimePicker(nextValue)),
      };
    }

    test("keeps the controlled value when the parent rejects a change", () => {
      const { onValueChange } = renderTimePicker("14:30");

      fireEvent.click(screen.getByRole("button", { name: "Clear" }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("");
      expect(screen.getByLabelText("Hour")).toHaveValue("14");
    });

    test("doesn't call onValueChange when the value prop changes", () => {
      const { onValueChange, rerender } = renderTimePicker("14:30");

      rerender("09:15");

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByLabelText("Hour")).toHaveValue("09");
    });

    function renderOpenTimePicker(open: boolean, onOpenChange = vi.fn()) {
      function getTimePicker(nextOpen: boolean) {
        return (
          <TimePicker
            locale="en-GB"
            open={nextOpen}
            onOpenChange={onOpenChange}
          >
            <TimePickerInputGroup>
              <TimePickerInput segment="hour" aria-label="Hour" />
              <TimePickerTrigger aria-label="Open" />
            </TimePickerInputGroup>
            <TimePickerContent>
              <TimePickerHour />
            </TimePickerContent>
          </TimePicker>
        );
      }
      const result = render(getTimePicker(open));
      return {
        onOpenChange,
        rerender: (nextOpen: boolean) =>
          result.rerender(getTimePicker(nextOpen)),
      };
    }

    test("stays closed when the parent rejects opening", () => {
      const { onOpenChange } = renderOpenTimePicker(false);

      fireEvent.click(screen.getByRole("button", { name: "Open" }));

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    test("doesn't call onOpenChange when the open prop changes", () => {
      const { onOpenChange, rerender } = renderOpenTimePicker(false);

      rerender(true);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
  },
);
