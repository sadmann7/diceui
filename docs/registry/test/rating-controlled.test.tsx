import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseRating from "@/registry/bases/base/ui/rating";
import * as RadixRating from "@/registry/bases/radix/ui/rating";

describe.each([
  ["radix", RadixRating],
  ["base", BaseRating],
])("Rating (%s) controlled", (_, { Rating, RatingItem }) => {
  function renderRating(value: number, onValueChange = vi.fn()) {
    const items = Array.from({ length: 5 }, (_, index) => (
      <RatingItem key={index} />
    ));
    const result = render(
      <Rating value={value} onValueChange={onValueChange}>
        {items}
      </Rating>,
    );
    function rerender(nextValue: number) {
      result.rerender(
        <Rating value={nextValue} onValueChange={onValueChange}>
          {items}
        </Rating>,
      );
    }
    return { onValueChange, rerender };
  }

  test("keeps the controlled value when the parent rejects a change", () => {
    const { onValueChange } = renderRating(2);

    fireEvent.click(screen.getAllByRole("radio")[3] as HTMLElement);

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(4);
    expect(screen.getAllByRole("radio")[3]).toHaveAttribute(
      "data-state",
      "empty",
    );
  });

  test("doesn't call onValueChange when the value prop changes", () => {
    const { onValueChange, rerender } = renderRating(2);

    rerender(4);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole("radio")[3]).toHaveAttribute(
      "data-state",
      "full",
    );
  });
});
