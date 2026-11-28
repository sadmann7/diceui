import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseSpeedDial from "@/registry/bases/base/ui/speed-dial";
import * as RadixSpeedDial from "@/registry/bases/radix/ui/speed-dial";

describe.each([
  ["radix", RadixSpeedDial],
  ["base", BaseSpeedDial],
])(
  "SpeedDial (%s) controlled",
  (
    _,
    {
      SpeedDial,
      SpeedDialAction,
      SpeedDialContent,
      SpeedDialItem,
      SpeedDialTrigger,
    },
  ) => {
    function renderSpeedDial(open: boolean, onOpenChange = vi.fn()) {
      function getSpeedDial(nextOpen: boolean) {
        return (
          <SpeedDial open={nextOpen} onOpenChange={onOpenChange}>
            <SpeedDialTrigger>Open</SpeedDialTrigger>
            <SpeedDialContent>
              <SpeedDialItem>
                <SpeedDialAction>Home</SpeedDialAction>
              </SpeedDialItem>
            </SpeedDialContent>
          </SpeedDial>
        );
      }
      const result = render(getSpeedDial(open));
      return {
        onOpenChange,
        rerender: (nextOpen: boolean) =>
          result.rerender(getSpeedDial(nextOpen)),
      };
    }

    test("stays closed when the parent rejects opening", () => {
      const { onOpenChange } = renderSpeedDial(false);

      fireEvent.click(screen.getByRole("button", { name: "Open" }));

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    test("doesn't call onOpenChange when the open prop changes", () => {
      const { onOpenChange, rerender } = renderSpeedDial(false);

      rerender(true);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
  },
);
