import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseStepper from "@/registry/bases/base/ui/stepper";
import * as RadixStepper from "@/registry/bases/radix/ui/stepper";

describe.each([
  ["radix", RadixStepper],
  ["base", BaseStepper],
])(
  "Stepper (%s) manual activation",
  (_, { Stepper, StepperItem, StepperList, StepperTitle, StepperTrigger }) => {
    test("moves focus without changing the step on arrow keys", async () => {
      const onValueChange = vi.fn();
      render(
        <Stepper
          defaultValue="one"
          activationMode="manual"
          onValueChange={onValueChange}
        >
          <StepperList>
            {["one", "two", "three"].map((step) => (
              <StepperItem key={step} value={step}>
                <StepperTrigger>
                  <StepperTitle>{step}</StepperTitle>
                </StepperTrigger>
              </StepperItem>
            ))}
          </StepperList>
        </Stepper>,
      );

      const [first, second] = screen.getAllByRole("tab");
      await act(async () => {
        first?.focus();
      });
      await act(async () => {
        fireEvent.keyDown(first as HTMLElement, { key: "ArrowRight" });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      expect(second).toHaveFocus();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(first).toHaveAttribute("aria-selected", "true");
    });
  },
);
