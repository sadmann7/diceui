import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseSwap from "@/registry/bases/base/ui/swap";
import * as RadixSwap from "@/registry/bases/radix/ui/swap";

describe.each([
  ["radix", RadixSwap],
  ["base", BaseSwap],
])("Swap (%s) controlled", (_, { Swap, SwapOff, SwapOn }) => {
  function renderSwap(swapped: boolean, onSwappedChange = vi.fn()) {
    function getSwap(nextSwapped: boolean) {
      return (
        <Swap swapped={nextSwapped} onSwappedChange={onSwappedChange}>
          <SwapOn>On</SwapOn>
          <SwapOff>Off</SwapOff>
        </Swap>
      );
    }
    const result = render(getSwap(swapped));
    return {
      onSwappedChange,
      rerender: (nextSwapped: boolean) => result.rerender(getSwap(nextSwapped)),
    };
  }

  test("keeps the controlled state when the parent rejects a change", () => {
    const { onSwappedChange } = renderSwap(false);

    fireEvent.click(screen.getByRole("button"));

    expect(onSwappedChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "off");
  });

  test("doesn't call onSwappedChange when the swapped prop changes", () => {
    const { onSwappedChange, rerender } = renderSwap(false);

    rerender(true);

    expect(onSwappedChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "on");
    expect(screen.getByText("On")).toHaveAttribute("data-state", "on");
  });
});
