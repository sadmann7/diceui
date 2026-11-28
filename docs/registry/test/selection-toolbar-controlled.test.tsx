import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

    test("doesn't call onOpenChange when the open prop changes", () => {
      const { onOpenChange, rerender } = renderToolbar(false);

      rerender(true);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });
  },
);
