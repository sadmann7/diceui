import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import * as BaseColorPicker from "@/registry/bases/base/ui/color-picker";
import * as RadixColorPicker from "@/registry/bases/radix/ui/color-picker";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe.each([
  ["radix", RadixColorPicker],
  ["base", BaseColorPicker],
])(
  "ColorPicker (%s) controlled",
  (
    _,
    { ColorPicker, ColorPickerContent, ColorPickerInput, ColorPickerTrigger },
  ) => {
    function renderColorPicker(value: string, onValueChange = vi.fn()) {
      function getColorPicker(nextValue: string) {
        return (
          <ColorPicker inline value={nextValue} onValueChange={onValueChange}>
            <ColorPickerInput withoutAlpha />
          </ColorPicker>
        );
      }
      const result = render(getColorPicker(value));
      return {
        onValueChange,
        rerender: (nextValue: string) =>
          result.rerender(getColorPicker(nextValue)),
      };
    }

    function getHexInput() {
      return screen.getByRole("textbox", { name: "Hex color value" });
    }

    test("keeps the controlled value when the parent rejects a change", () => {
      const { onValueChange } = renderColorPicker("#ff0000");

      fireEvent.change(getHexInput(), { target: { value: "#00ff00" } });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("#00ff00");
      expect(getHexInput()).toHaveValue("#ff0000");
    });

    test("doesn't call onValueChange when the value prop changes", () => {
      const { onValueChange, rerender } = renderColorPicker("#ff0000");

      rerender("#0000ff");

      expect(onValueChange).not.toHaveBeenCalled();
      expect(getHexInput()).toHaveValue("#0000ff");
    });

    test("keeps an alpha change the hex value can't carry", () => {
      function Demo() {
        const [value, setValue] = React.useState("#ff0000");
        return (
          <ColorPicker inline value={value} onValueChange={setValue}>
            <ColorPickerInput />
          </ColorPicker>
        );
      }
      render(<Demo />);
      const alphaInput = screen.getByLabelText("Alpha transparency percentage");

      fireEvent.change(alphaInput, { target: { value: "50" } });

      expect(alphaInput).toHaveValue("50");
      expect(getHexInput()).toHaveValue("#ff0000");
    });

    test("follows the format prop without calling onFormatChange", () => {
      const onFormatChange = vi.fn();
      function getColorPicker(format: "hex" | "rgb") {
        return (
          <ColorPicker inline format={format} onFormatChange={onFormatChange}>
            <ColorPickerInput withoutAlpha />
          </ColorPicker>
        );
      }
      const { rerender } = render(getColorPicker("hex"));

      rerender(getColorPicker("rgb"));

      expect(onFormatChange).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("textbox", { name: "Hex color value" }),
      ).not.toBeInTheDocument();
    });

    test("doesn't call onOpenChange when the open prop changes", () => {
      const onOpenChange = vi.fn();
      function getColorPicker(open: boolean) {
        return (
          <ColorPicker open={open} onOpenChange={onOpenChange}>
            <ColorPickerTrigger>Pick</ColorPickerTrigger>
            <ColorPickerContent>
              <ColorPickerInput withoutAlpha />
            </ColorPickerContent>
          </ColorPicker>
        );
      }
      const { rerender } = render(getColorPicker(false));

      rerender(getColorPicker(true));

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getHexInput()).toBeInTheDocument();
    });
  },
);
