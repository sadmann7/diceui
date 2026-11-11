import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Tour,
  TourNext,
  TourPortal,
  TourStep,
  TourTitle,
} from "@/registry/bases/radix/ui/tour";

// Mock window.matchMedia for getDefaultScrollBehavior.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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

const FirstStep = React.memo(function FirstStep() {
  return (
    <TourStep target="#first">
      <TourTitle>First step</TourTitle>
      <TourNext />
    </TourStep>
  );
});

const ThirdStep = React.memo(function ThirdStep() {
  return (
    <TourStep target="#third">
      <TourTitle>Third step</TourTitle>
    </TourStep>
  );
});

function TourTest({
  sideOffset,
  value,
  onStepEnter,
}: {
  sideOffset: number;
  value?: number;
  onStepEnter?: () => void;
}) {
  return (
    <>
      <div id="first">First</div>
      <div id="second">Second</div>
      <div id="third">Third</div>
      <Tour open value={value}>
        <TourPortal>
          <FirstStep />
          <TourStep
            target="#second"
            sideOffset={sideOffset}
            onStepEnter={onStepEnter}
          >
            <TourTitle>Second step</TourTitle>
          </TourStep>
          <ThirdStep />
        </TourPortal>
      </Tour>
    </>
  );
}

describe("Tour", () => {
  it("keeps step order when one step's options change", async () => {
    const { rerender } = render(<TourTest sideOffset={8} value={1} />);
    expect(await screen.findByText("Second step")).toBeInTheDocument();

    rerender(<TourTest sideOffset={16} value={1} />);

    expect(await screen.findByText("Second step")).toBeInTheDocument();
    expect(screen.queryByText("Third step")).not.toBeInTheDocument();
  });

  it("calls the latest onStepEnter without re-registering the step", async () => {
    const user = userEvent.setup();
    const onStepEnter = vi.fn();
    const nextOnStepEnter = vi.fn();
    const { rerender } = render(
      <TourTest sideOffset={8} onStepEnter={onStepEnter} />,
    );
    expect(await screen.findByText("First step")).toBeInTheDocument();

    rerender(<TourTest sideOffset={8} onStepEnter={nextOnStepEnter} />);
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText("Second step")).toBeInTheDocument();
    expect(onStepEnter).not.toHaveBeenCalled();
    expect(nextOnStepEnter).toHaveBeenCalledTimes(1);
  });
});
