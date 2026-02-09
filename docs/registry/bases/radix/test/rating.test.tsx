import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test } from "vitest";

import { Rating, RatingItem } from "@/registry/bases/radix/ui/rating";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

afterEach(cleanup);

describe("Rating Component", () => {
  describe("Auto-indexing", () => {
    test("should auto-index rating items when index prop is not provided", () => {
      render(
        <Rating defaultValue={3} data-testid="rating">
          <RatingItem data-testid="item-1" />
          <RatingItem data-testid="item-2" />
          <RatingItem data-testid="item-3" />
          <RatingItem data-testid="item-4" />
          <RatingItem data-testid="item-5" />
        </Rating>,
      );

      const items = screen.getAllByRole("radio");
      expect(items).toHaveLength(5);

      // Check that items have correct aria-posinset values (1-based)
      expect(items[0]).toHaveAttribute("aria-posinset", "1");
      expect(items[1]).toHaveAttribute("aria-posinset", "2");
      expect(items[2]).toHaveAttribute("aria-posinset", "3");
      expect(items[3]).toHaveAttribute("aria-posinset", "4");
      expect(items[4]).toHaveAttribute("aria-posinset", "5");

      // Check that the first 3 items are filled (defaultValue={3})
      expect(items[0]).toHaveAttribute("data-state", "full");
      expect(items[1]).toHaveAttribute("data-state", "full");
      expect(items[2]).toHaveAttribute("data-state", "full");
      expect(items[3]).toHaveAttribute("data-state", "empty");
      expect(items[4]).toHaveAttribute("data-state", "empty");
    });

    test("should work with manual index when provided", () => {
      render(
        <Rating defaultValue={2} data-testid="rating">
          <RatingItem index={0} data-testid="item-1" />
          <RatingItem index={1} data-testid="item-2" />
          <RatingItem index={2} data-testid="item-3" />
        </Rating>,
      );

      const items = screen.getAllByRole("radio");
      expect(items).toHaveLength(3);

      // Check that items have correct aria-posinset values (1-based)
      expect(items[0]).toHaveAttribute("aria-posinset", "1");
      expect(items[1]).toHaveAttribute("aria-posinset", "2");
      expect(items[2]).toHaveAttribute("aria-posinset", "3");

      // Check that the first 2 items are filled (defaultValue={2})
      expect(items[0]).toHaveAttribute("data-state", "full");
      expect(items[1]).toHaveAttribute("data-state", "full");
      expect(items[2]).toHaveAttribute("data-state", "empty");
    });

    test("should handle mixed manual and auto-indexing", () => {
      render(
        <Rating defaultValue={4} data-testid="rating">
          <RatingItem index={0} data-testid="manual-1" />
          <RatingItem data-testid="auto-1" />
          <RatingItem index={2} data-testid="manual-2" />
          <RatingItem data-testid="auto-2" />
          <RatingItem data-testid="auto-3" />
        </Rating>,
      );

      const items = screen.getAllByRole("radio");
      expect(items).toHaveLength(5);

      // Check the actual behavior: manual indices are used as-is, auto indices increment from 0
      // First item: index={0} -> aria-posinset="1"
      expect(items[0]).toHaveAttribute("aria-posinset", "1");
      // Second item: auto (gets index 0) -> aria-posinset="1"
      expect(items[1]).toHaveAttribute("aria-posinset", "1");
      // Third item: index={2} -> aria-posinset="3"
      expect(items[2]).toHaveAttribute("aria-posinset", "3");
      // Fourth item: auto (gets index 1) -> aria-posinset="2"
      expect(items[3]).toHaveAttribute("aria-posinset", "2");
      // Fifth item: auto (gets index 2) -> aria-posinset="3"
      expect(items[4]).toHaveAttribute("aria-posinset", "3");
    });

    test("should be interactive with auto-indexed items", async () => {
      const user = userEvent.setup();

      render(
        <Rating defaultValue={0} data-testid="rating">
          <RatingItem data-testid="item-1" />
          <RatingItem data-testid="item-2" />
          <RatingItem data-testid="item-3" />
        </Rating>,
      );

      const items = screen.getAllByRole("radio");

      // Click on the second item
      const secondItem = items[1];

      if (!secondItem) {
        throw new Error("Second item not found");
      }
      await user.click(secondItem);

      // First two items should be filled
      expect(items[0]).toHaveAttribute("data-state", "full");
      expect(items[1]).toHaveAttribute("data-state", "full");
      expect(items[2]).toHaveAttribute("data-state", "empty");
    });

    test("should maintain stable indices across re-renders (no flashing)", async () => {
      const user = userEvent.setup();

      render(
        <Rating defaultValue={0} data-testid="rating">
          <RatingItem data-testid="item-1" />
          <RatingItem data-testid="item-2" />
          <RatingItem data-testid="item-3" />
          <RatingItem data-testid="item-4" />
          <RatingItem data-testid="item-5" />
        </Rating>,
      );

      const items = screen.getAllByRole("radio");

      // Record initial aria-posinset values
      const initialPositions = items.map((item) =>
        item.getAttribute("aria-posinset"),
      );

      const fourthItem = items[3];

      if (!fourthItem) {
        throw new Error("Fourth item not found");
      }

      // Click on the fourth item to trigger a re-render
      await user.click(fourthItem);

      // Check that aria-posinset values remain the same (no index reassignment)
      const afterClickPositions = items.map((item) =>
        item.getAttribute("aria-posinset"),
      );

      expect(afterClickPositions).toEqual(initialPositions);
      expect(afterClickPositions).toEqual(["1", "2", "3", "4", "5"]);

      // Verify the rating state changed correctly
      expect(items[0]).toHaveAttribute("data-state", "full");
      expect(items[1]).toHaveAttribute("data-state", "full");
      expect(items[2]).toHaveAttribute("data-state", "full");
      expect(items[3]).toHaveAttribute("data-state", "full");
      expect(items[4]).toHaveAttribute("data-state", "empty");
    });
  });
});
