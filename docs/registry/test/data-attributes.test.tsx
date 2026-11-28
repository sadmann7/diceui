import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import * as BaseRating from "@/registry/bases/base/ui/rating";
import * as BaseSwap from "@/registry/bases/base/ui/swap";
import * as RadixRating from "@/registry/bases/radix/ui/rating";
import * as RadixSwap from "@/registry/bases/radix/ui/swap";

describe.each([
  ["radix", RadixSwap, RadixRating],
  ["base", BaseSwap, BaseRating],
])("Boolean data attributes (%s)", (_, { Swap, SwapOff, SwapOn }, rating) => {
  test("renders data-disabled on a disabled swap", () => {
    render(
      <Swap disabled>
        <SwapOn>On</SwapOn>
        <SwapOff>Off</SwapOff>
      </Swap>,
    );

    expect(screen.getByRole("button")).toHaveAttribute("data-disabled", "");
  });

  test("renders data-disabled and data-readonly on a rating", () => {
    render(
      <rating.Rating disabled readOnly>
        <rating.RatingItem />
      </rating.Rating>,
    );

    const root = screen.getByRole("radiogroup");
    expect(root).toHaveAttribute("data-disabled", "");
    expect(root).toHaveAttribute("data-readonly", "");
    expect(screen.getByRole("radio")).toHaveAttribute("data-disabled", "");
  });

  test("leaves data-disabled off when enabled", () => {
    render(
      <Swap>
        <SwapOn>On</SwapOn>
        <SwapOff>Off</SwapOff>
      </Swap>,
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("data-disabled");
  });
});
