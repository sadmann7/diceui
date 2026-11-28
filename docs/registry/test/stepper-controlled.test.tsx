import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseStepper from "@/registry/bases/base/ui/stepper";
import * as RadixStepper from "@/registry/bases/radix/ui/stepper";

describe.each([
  ["radix", RadixStepper],
  ["base", BaseStepper],
])(
  "Stepper (%s) controlled",
  (
    _,
    {
      Stepper,
      StepperContent,
      StepperItem,
      StepperList,
      StepperNext,
      StepperTitle,
      StepperTrigger,
    },
  ) => {
    function renderStepper(value: string, onValueChange = vi.fn()) {
      function getStepper(nextValue: string) {
        return (
          <Stepper value={nextValue} onValueChange={onValueChange}>
            <StepperList>
              {["one", "two"].map((step) => (
                <StepperItem key={step} value={step}>
                  <StepperTrigger>
                    <StepperTitle>{step}</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
              ))}
            </StepperList>
            <StepperContent value="one">Content one</StepperContent>
            <StepperContent value="two">Content two</StepperContent>
            <StepperNext>Next</StepperNext>
          </Stepper>
        );
      }
      const result = render(getStepper(value));
      return {
        onValueChange,
        rerender: (nextValue: string) => result.rerender(getStepper(nextValue)),
      };
    }

    test("keeps the controlled value when the parent rejects a change", async () => {
      const { onValueChange } = renderStepper("one");

      fireEvent.click(screen.getByRole("tab", { name: "two" }));

      await waitFor(() =>
        expect(onValueChange).toHaveBeenCalledExactlyOnceWith("two"),
      );
      expect(screen.getByRole("tab", { name: "one" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByText("Content one")).toBeInTheDocument();
      expect(screen.queryByText("Content two")).not.toBeInTheDocument();
    });

    test("doesn't call onValueChange when the value prop changes", () => {
      const { onValueChange, rerender } = renderStepper("one");

      rerender("two");

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("tab", { name: "two" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    test("enables Next once the steps register", () => {
      renderStepper("one");

      expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    });
  },
);
