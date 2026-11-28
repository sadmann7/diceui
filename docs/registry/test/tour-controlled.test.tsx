import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseTour from "@/registry/bases/base/ui/tour";
import * as RadixTour from "@/registry/bases/radix/ui/tour";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe.each([
  ["radix", RadixTour],
  ["base", BaseTour],
])(
  "Tour (%s) controlled",
  (_, { Tour, TourNext, TourPortal, TourStep, TourTitle }) => {
    interface TourTestProps {
      open?: boolean;
      value?: number;
      onOpenChange?: (open: boolean) => void;
      onValueChange?: (value: number) => void;
    }

    function TourTest({ open = true, ...props }: TourTestProps) {
      return (
        <>
          <div id="first">First</div>
          <div id="second">Second</div>
          <Tour open={open} {...props}>
            <TourPortal>
              <TourStep target="#first">
                <TourTitle>First step</TourTitle>
                <TourNext />
              </TourStep>
              <TourStep target="#second">
                <TourTitle>Second step</TourTitle>
              </TourStep>
            </TourPortal>
          </Tour>
        </>
      );
    }

    test("keeps the controlled value when the parent rejects a change", async () => {
      const onValueChange = vi.fn();
      render(<TourTest value={0} onValueChange={onValueChange} />);
      expect(await screen.findByText("First step")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /next/i }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1);
      expect(screen.getByText("First step")).toBeInTheDocument();
      expect(screen.queryByText("Second step")).not.toBeInTheDocument();
    });

    test("doesn't call onValueChange when the value prop changes", async () => {
      const onValueChange = vi.fn();
      const { rerender } = render(
        <TourTest value={0} onValueChange={onValueChange} />,
      );
      expect(await screen.findByText("First step")).toBeInTheDocument();

      rerender(<TourTest value={1} onValueChange={onValueChange} />);

      expect(await screen.findByText("Second step")).toBeInTheDocument();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    test("stays open when the parent rejects closing", async () => {
      const onOpenChange = vi.fn();
      render(<TourTest open onOpenChange={onOpenChange} />);
      expect(await screen.findByText("First step")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(screen.getByText("First step")).toBeInTheDocument();
    });

    test("doesn't call onOpenChange when the open prop changes", async () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <TourTest open={false} onOpenChange={onOpenChange} />,
      );

      rerender(<TourTest open onOpenChange={onOpenChange} />);

      expect(await screen.findByText("First step")).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  },
);
