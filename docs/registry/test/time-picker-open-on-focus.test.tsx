import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseTimePicker from "@/registry/bases/base/ui/time-picker";
import * as RadixTimePicker from "@/registry/bases/radix/ui/time-picker";

Element.prototype.scrollIntoView = vi.fn();

describe.each([
  ["radix", RadixTimePicker],
  ["base", BaseTimePicker],
])(
  "TimePicker (%s) openOnFocus",
  (
    _,
    {
      TimePicker,
      TimePickerContent,
      TimePickerHour,
      TimePickerInput,
      TimePickerInputGroup,
    },
  ) => {
    test("stays open when another segment is pressed", async () => {
      const onOpenChange = vi.fn();
      render(
        <TimePicker locale="en-GB" openOnFocus onOpenChange={onOpenChange}>
          <TimePickerInputGroup>
            <TimePickerInput segment="hour" aria-label="Hour" />
            <TimePickerInput segment="minute" aria-label="Minute" />
          </TimePickerInputGroup>
          <TimePickerContent>
            <TimePickerHour />
          </TimePickerContent>
        </TimePicker>,
      );

      await act(async () => {
        screen.getByLabelText("Hour").focus();
      });
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      const minute = screen.getByLabelText("Minute");
      await act(async () => {
        fireEvent.pointerDown(minute);
        fireEvent.mouseDown(minute);
        fireEvent.pointerUp(minute);
        fireEvent.mouseUp(minute);
        fireEvent.click(minute);
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  },
);
