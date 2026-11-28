import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import * as BaseResponsiveDialog from "@/registry/bases/base/ui/responsive-dialog";
import * as RadixResponsiveDialog from "@/registry/bases/radix/ui/responsive-dialog";

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

describe.each([
  ["radix", RadixResponsiveDialog],
  ["base", BaseResponsiveDialog],
])(
  "ResponsiveDialog (%s) controlled",
  (
    _,
    {
      ResponsiveDialog,
      ResponsiveDialogContent,
      ResponsiveDialogDescription,
      ResponsiveDialogTitle,
      ResponsiveDialogTrigger,
    },
  ) => {
    function renderDialog(open: boolean, onOpenChange = vi.fn()) {
      function getDialog(nextOpen: boolean) {
        return (
          <ResponsiveDialog open={nextOpen} onOpenChange={onOpenChange}>
            <ResponsiveDialogTrigger>Open</ResponsiveDialogTrigger>
            <ResponsiveDialogContent>
              <ResponsiveDialogTitle>Title</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Description
              </ResponsiveDialogDescription>
            </ResponsiveDialogContent>
          </ResponsiveDialog>
        );
      }
      const result = render(getDialog(open));
      return {
        onOpenChange,
        rerender: (nextOpen: boolean) => result.rerender(getDialog(nextOpen)),
      };
    }

    test("stays closed when the parent rejects opening", () => {
      const { onOpenChange } = renderDialog(false);

      fireEvent.click(screen.getByRole("button", { name: "Open" }));

      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("doesn't call onOpenChange when the open prop changes", () => {
      const { onOpenChange, rerender } = renderDialog(false);

      rerender(true);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  },
);
