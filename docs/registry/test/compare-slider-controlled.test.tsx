import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseCompareSlider from "@/registry/bases/base/ui/compare-slider";
import * as RadixCompareSlider from "@/registry/bases/radix/ui/compare-slider";

describe.each([
  ["radix", RadixCompareSlider],
  ["base", BaseCompareSlider],
])(
  "CompareSlider (%s) controlled",
  (_, { CompareSlider, CompareSliderAfter, CompareSliderBefore }) => {
    function renderCompareSlider(value: number, onValueChange = vi.fn()) {
      function getCompareSlider(nextValue: number) {
        return (
          <CompareSlider value={nextValue} onValueChange={onValueChange}>
            <CompareSliderBefore>Before</CompareSliderBefore>
            <CompareSliderAfter>After</CompareSliderAfter>
          </CompareSlider>
        );
      }
      const result = render(getCompareSlider(value));
      return {
        onValueChange,
        rerender: (nextValue: number) =>
          result.rerender(getCompareSlider(nextValue)),
      };
    }

    test("keeps the controlled value when the parent rejects a change", () => {
      const { onValueChange } = renderCompareSlider(50);

      fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(51);
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
    });

    test("doesn't call onValueChange when the value prop changes", () => {
      const { onValueChange, rerender } = renderCompareSlider(50);

      rerender(70);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "70");
    });
  },
);
