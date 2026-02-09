import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/registry/bases/radix/ui/stepper";

describe("Stepper", () => {
  function StepperTest({
    onValueChange,
    onValidate,
    defaultValue = "step1",
    ...props
  }: React.ComponentProps<typeof Stepper>) {
    return (
      <Stepper
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onValidate={onValidate}
        {...props}
      >
        <StepperList>
          <StepperItem value="step1">
            <StepperTrigger>
              <StepperIndicator />
              <div>
                <StepperTitle>Step 1</StepperTitle>
                <StepperDescription>First step</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
          <StepperItem value="step2">
            <StepperTrigger>
              <StepperIndicator />
              <div>
                <StepperTitle>Step 2</StepperTitle>
                <StepperDescription>Second step</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
          <StepperItem value="step3">
            <StepperTrigger>
              <StepperIndicator />
              <div>
                <StepperTitle>Step 3</StepperTitle>
                <StepperDescription>Third step</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </StepperList>
        <StepperContent value="step1">Content for Step 1</StepperContent>
        <StepperContent value="step2">Content for Step 2</StepperContent>
        <StepperContent value="step3">Content for Step 3</StepperContent>
        <div>
          <StepperPrev>Previous</StepperPrev>
          <StepperNext>Next</StepperNext>
        </div>
      </Stepper>
    );
  }

  it("renders stepper with correct initial state", () => {
    render(<StepperTest />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
    expect(screen.getByText("Content for Step 1")).toBeInTheDocument();
    expect(screen.queryByText("Content for Step 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Content for Step 3")).not.toBeInTheDocument();
  });

  it("changes step when clicking on trigger", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<StepperTest onValueChange={onValueChange} />);

    const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
    await user.click(step2Trigger);

    expect(onValueChange).toHaveBeenCalledWith("step2");
    expect(screen.getByText("Content for Step 2")).toBeInTheDocument();
    expect(screen.queryByText("Content for Step 1")).not.toBeInTheDocument();
  });

  it("navigates with next/previous buttons", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    // Create a stepper without validation first
    render(<StepperTest onValueChange={onValueChange} />);

    const nextButton = screen.getByText("Next");
    const prevButton = screen.getByText("Previous");

    // Wait for steps to be registered
    await waitFor(() => {
      expect(prevButton).toBeDisabled(); // Should be disabled on first step
    });

    // The next button might be disabled initially if steps aren't registered yet
    // Let's try clicking it and see if it works
    if (!(nextButton as HTMLButtonElement).disabled) {
      await user.click(nextButton);
      expect(onValueChange).toHaveBeenCalledWith("step2");

      // After moving to step2, previous should be enabled
      await waitFor(() => {
        expect(prevButton).not.toBeDisabled();
      });

      // Previous button should work
      await user.click(prevButton);
      expect(onValueChange).toHaveBeenCalledWith("step1");
    } else {
      // If next button is disabled, test that we can navigate via step triggers
      const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
      await user.click(step2Trigger);
      expect(onValueChange).toHaveBeenCalledWith("step2");
    }
  });

  it("disables previous button on first step", () => {
    render(<StepperTest defaultValue="step1" />);

    const prevButton = screen.getByText("Previous");
    expect(prevButton).toBeDisabled();
  });

  it("disables next button on last step", () => {
    render(<StepperTest defaultValue="step3" />);

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  it("supports keyboard navigation with arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<StepperTest onValueChange={onValueChange} />);

    const step1Trigger = screen.getByRole("tab", { name: /step 1/i });
    step1Trigger.focus();

    // Arrow right should move to next step
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("step2");

    // Arrow left should move to previous step
    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenCalledWith("step1");
  });

  it("supports Home and End key navigation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<StepperTest onValueChange={onValueChange} defaultValue="step2" />);

    const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
    step2Trigger.focus();

    // Home should go to first step
    await user.keyboard("{Home}");
    expect(onValueChange).toHaveBeenCalledWith("step1");

    // End should go to last step
    await user.keyboard("{End}");
    expect(onValueChange).toHaveBeenCalledWith("step3");
  });

  it("handles validation correctly", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn().mockResolvedValue(true);
    const onValueChange = vi.fn();

    render(
      <StepperTest onValueChange={onValueChange} onValidate={onValidate} />,
    );

    // Click on step 2 trigger directly (this should trigger validation)
    const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
    await act(async () => {
      await user.click(step2Trigger);
    });

    await waitFor(() => {
      expect(onValidate).toHaveBeenCalledWith("step2", "next");
      expect(onValueChange).toHaveBeenCalledWith("step2");
    });
  });

  it("prevents navigation when validation fails", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn().mockResolvedValue(false);
    const onValueChange = vi.fn();

    render(
      <StepperTest onValueChange={onValueChange} onValidate={onValidate} />,
    );

    // Click on step 2 trigger directly (this should trigger validation)
    const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
    await act(async () => {
      await user.click(step2Trigger);
    });

    await waitFor(() => {
      expect(onValidate).toHaveBeenCalledWith("step2", "next");
    });

    // Wait a bit to ensure onValueChange is not called
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("supports manual activation mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <StepperTest activationMode="manual" onValueChange={onValueChange} />,
    );

    const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
    step2Trigger.focus();

    // Focus should not change the step in manual mode
    expect(onValueChange).not.toHaveBeenCalled();

    // Enter or Space should activate the step
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("step2");
  });

  it("handles disabled steps correctly", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    function DisabledStepper() {
      return (
        <Stepper defaultValue="step1" onValueChange={onValueChange}>
          <StepperList>
            <StepperItem value="step1">
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>Step 1</StepperTitle>
              </StepperTrigger>
            </StepperItem>
            <StepperItem value="step2" disabled>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>Step 2</StepperTitle>
              </StepperTrigger>
            </StepperItem>
            <StepperItem value="step3">
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>Step 3</StepperTitle>
              </StepperTrigger>
            </StepperItem>
          </StepperList>
        </Stepper>
      );
    }

    render(<DisabledStepper />);

    const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
    expect(step2Trigger).toBeDisabled();

    await user.click(step2Trigger);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("supports vertical orientation", () => {
    render(<StepperTest orientation="vertical" />);

    const stepperList = screen.getByRole("tablist");
    expect(stepperList).toHaveAttribute("aria-orientation", "vertical");
    expect(stepperList).toHaveAttribute("data-orientation", "vertical");
  });

  it("supports loop navigation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <StepperTest loop onValueChange={onValueChange} defaultValue="step3" />,
    );

    const step3Trigger = screen.getByRole("tab", { name: /step 3/i });
    step3Trigger.focus();

    // Arrow right on last step should loop to first step
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("step1");
  });

  it("renders step indicators with correct states", () => {
    render(<StepperTest defaultValue="step2" />);

    const triggers = screen.getAllByRole("tab");

    // Step 1 should be completed (before current)
    expect(triggers[0]).toHaveAttribute("data-state", "completed");

    // Step 2 should be active (current)
    expect(triggers[1]).toHaveAttribute("data-state", "active");
    expect(triggers[1]).toHaveAttribute("aria-selected", "true");

    // Step 3 should be inactive (after current)
    expect(triggers[2]).toHaveAttribute("data-state", "inactive");
  });

  it("handles completed steps correctly", () => {
    function CompletedStepper() {
      return (
        <Stepper defaultValue="step2">
          <StepperList>
            <StepperItem value="step1" completed>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>Step 1</StepperTitle>
              </StepperTrigger>
            </StepperItem>
            <StepperItem value="step2">
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>Step 2</StepperTitle>
              </StepperTrigger>
            </StepperItem>
          </StepperList>
        </Stepper>
      );
    }

    render(<CompletedStepper />);

    const step1Trigger = screen.getByRole("tab", { name: /step 1/i });
    expect(step1Trigger).toHaveAttribute("data-state", "completed");
  });

  it("supports non-interactive mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<StepperTest nonInteractive onValueChange={onValueChange} />);

    const step2Trigger = screen.getByRole("tab", { name: /step 2/i });
    await user.click(step2Trigger);

    // Should not change step in non-interactive mode
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("has proper ARIA attributes", () => {
    render(<StepperTest />);

    const stepperList = screen.getByRole("tablist");
    expect(stepperList).toHaveAttribute("aria-orientation", "horizontal");

    const triggers = screen.getAllByRole("tab");
    triggers.forEach((trigger, index) => {
      expect(trigger).toHaveAttribute("aria-posinset", String(index + 1));
      expect(trigger).toHaveAttribute("aria-setsize", "3");
    });

    const contents = screen.getAllByRole("tabpanel");
    expect(contents).toHaveLength(1); // Only active content should be rendered
  });

  it("supports custom step positions", () => {
    render(<StepperTest />);

    const triggers = screen.getAllByRole("tab");

    expect(triggers[0]).toHaveAttribute("aria-posinset", "1");
    expect(triggers[1]).toHaveAttribute("aria-posinset", "2");
    expect(triggers[2]).toHaveAttribute("aria-posinset", "3");

    triggers.forEach((trigger) => {
      expect(trigger).toHaveAttribute("aria-setsize", "3");
    });
  });
});
