import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseActionBar from "@/registry/bases/base/ui/action-bar";
import * as RadixActionBar from "@/registry/bases/radix/ui/action-bar";

describe.each([
  ["radix", RadixActionBar],
  ["base", BaseActionBar],
])("ActionBar (%s) controlled", (_, { ActionBar, ActionBarClose }) => {
  function renderActionBar(open: boolean, onOpenChange = vi.fn()) {
    function getActionBar(nextOpen: boolean) {
      return (
        <ActionBar open={nextOpen} onOpenChange={onOpenChange}>
          <ActionBarClose aria-label="Close" />
        </ActionBar>
      );
    }
    const result = render(getActionBar(open));
    return {
      onOpenChange,
      rerender: (nextOpen: boolean) => result.rerender(getActionBar(nextOpen)),
    };
  }

  test("stays open when the parent rejects closing", () => {
    const { onOpenChange } = renderActionBar(true);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).toHaveBeenNthCalledWith(1, false);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  test("doesn't call onOpenChange when the open prop changes", () => {
    const { onOpenChange, rerender } = renderActionBar(true);

    rerender(false);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
});
