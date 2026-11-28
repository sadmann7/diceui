import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseAngleSlider from "@/registry/bases/base/ui/angle-slider";
import * as RadixAngleSlider from "@/registry/bases/radix/ui/angle-slider";

describe.each([
  ["radix", RadixAngleSlider],
  ["base", BaseAngleSlider],
])("AngleSlider (%s) controlled", (_, { AngleSlider, AngleSliderThumb }) => {
  function renderAngleSlider(value: number[], onValueChange = vi.fn()) {
    function getAngleSlider(nextValue: number[]) {
      return (
        <AngleSlider value={nextValue} onValueChange={onValueChange}>
          <AngleSliderThumb />
        </AngleSlider>
      );
    }
    const result = render(getAngleSlider(value));
    return {
      onValueChange,
      rerender: (nextValue: number[]) =>
        result.rerender(getAngleSlider(nextValue)),
    };
  }

  test("keeps the controlled value when the parent rejects a change", () => {
    const { onValueChange } = renderAngleSlider([30]);

    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith([31]);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "30");
  });

  test("doesn't call onValueChange when the value prop changes", () => {
    const { onValueChange, rerender } = renderAngleSlider([30]);

    rerender([50]);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  });
});
