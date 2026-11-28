import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseSelectionToolbar from "@/registry/bases/base/ui/selection-toolbar";
import * as RadixSelectionToolbar from "@/registry/bases/radix/ui/selection-toolbar";

describe.each([
  ["radix", RadixSelectionToolbar],
  ["base", BaseSelectionToolbar],
])(
  "SelectionToolbar (%s) controlled",
  (_, { SelectionToolbar, SelectionToolbarItem }) => {
    function renderToolbar(open: boolean, onOpenChange = vi.fn()) {
      function getToolbar(nextOpen: boolean) {
        return (
          <SelectionToolbar open={nextOpen} onOpenChange={onOpenChange}>
            <SelectionToolbarItem aria-label="Bold">B</SelectionToolbarItem>
          </SelectionToolbar>
        );
      }
      const result = render(getToolbar(open));
      return {
        onOpenChange,
        rerender: (nextOpen: boolean) => result.rerender(getToolbar(nextOpen)),
      };
    }

    test("stays open when the parent rejects closing", () => {
      const { onOpenChange } = renderToolbar(true);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    test("asks to open once while the parent keeps it closed", async () => {
      const onOpenChange = vi.fn();
      vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
        setTimeout(() => callback(performance.now()), 0),
      );
      let top = 10;
      Range.prototype.getBoundingClientRect = () =>
        DOMRect.fromRect({ x: 0, y: top, width: 40, height: 16 });
      render(
        <>
          <p>Some selectable text</p>
          <SelectionToolbar open={false} onOpenChange={onOpenChange}>
            <SelectionToolbarItem aria-label="Bold">B</SelectionToolbarItem>
          </SelectionToolbar>
        </>,
      );
      window
        .getSelection()
        ?.selectAllChildren(screen.getByText("Some selectable text"));

      for (const nextTop of [10, 20, 30]) {
        top = nextTop;
        fireEvent.mouseUp(document);
        await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
      }

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    test("doesn't call onOpenChange when the open prop changes", () => {
      const { onOpenChange, rerender } = renderToolbar(false);

      rerender(true);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });
  },
);
