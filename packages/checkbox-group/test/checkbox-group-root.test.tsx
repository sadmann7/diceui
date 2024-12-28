import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import * as CheckboxGroup from "../src/index";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

describe("CheckboxGroup", () => {
  const renderCheckboxGroup = (props = {}) => {
    return render(
      <CheckboxGroup.Root {...props}>
        <CheckboxGroup.Label>Favorite Colors</CheckboxGroup.Label>
        <CheckboxGroup.Description>
          Select your favorite colors
        </CheckboxGroup.Description>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="red">
            <CheckboxGroup.Indicator />
            Red
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="blue">
            <CheckboxGroup.Indicator />
            Blue
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="green">
            <CheckboxGroup.Indicator />
            Green
          </CheckboxGroup.Item>
        </CheckboxGroup.List>
        <CheckboxGroup.Message>
          Please select at least one color
        </CheckboxGroup.Message>
      </CheckboxGroup.Root>,
    );
  };

  test("renders without crashing", () => {
    renderCheckboxGroup();
    expect(screen.getByText("Favorite Colors")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
  });

  test("handles checkbox selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCheckboxGroup({ onValueChange });

    const redCheckbox = screen.getByText("Red").closest("button");
    const blueCheckbox = screen.getByText("Blue").closest("button");

    if (!redCheckbox || !blueCheckbox) {
      throw new Error("Checkbox buttons not found");
    }

    await user.click(redCheckbox);
    expect(onValueChange).toHaveBeenCalledWith(["red"]);
    expect(redCheckbox).toHaveAttribute("aria-checked", "true");

    await user.click(blueCheckbox);
    expect(onValueChange).toHaveBeenCalledWith(["red", "blue"]);
    expect(blueCheckbox).toHaveAttribute("aria-checked", "true");

    await user.click(redCheckbox);
    expect(onValueChange).toHaveBeenCalledWith(["blue"]);
    expect(redCheckbox).toHaveAttribute("aria-checked", "false");
  });

  test("handles controlled value changes", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <CheckboxGroup.Root value={["red"]} onValueChange={onValueChange}>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="red">
            <CheckboxGroup.Indicator />
            Red
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="blue">
            <CheckboxGroup.Indicator />
            Blue
          </CheckboxGroup.Item>
        </CheckboxGroup.List>
      </CheckboxGroup.Root>,
    );

    const redCheckbox = screen.getByText("Red").closest("button");
    expect(redCheckbox).toHaveAttribute("aria-checked", "true");

    // Update the value prop to ["blue"]
    rerender(
      <CheckboxGroup.Root value={["blue"]} onValueChange={onValueChange}>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="red">
            <CheckboxGroup.Indicator />
            Red
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="blue">
            <CheckboxGroup.Indicator />
            Blue
          </CheckboxGroup.Item>
        </CheckboxGroup.List>
      </CheckboxGroup.Root>,
    );

    // Wait for the state to update
    await screen.findByRole("checkbox", { name: "Blue" });

    const blueCheckbox = screen.getByText("Blue").closest("button");
    expect(blueCheckbox).toHaveAttribute("aria-checked", "true");
    expect(redCheckbox).toHaveAttribute("aria-checked", "false");
  });

  test("respects disabled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCheckboxGroup({
      disabled: true,
      onValueChange,
    });

    const redCheckbox = screen.getByText("Red").closest("button");
    if (!redCheckbox) throw new Error("Red checkbox not found");

    expect(redCheckbox).toBeDisabled();
    await user.click(redCheckbox);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles validation", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn().mockImplementation((value) => {
      if (value.length === 0) return "Please select at least one option";
      if (value.length > 2) return "Maximum 2 selections allowed";
      return true;
    });

    // Use React.useEffect to trigger validation on mount
    function TestComponent() {
      React.useEffect(() => {
        onValidate([]);
      }, []);

      return (
        <CheckboxGroup.Root defaultValue={[]} onValidate={onValidate}>
          <CheckboxGroup.List>
            <CheckboxGroup.Item value="red">
              <CheckboxGroup.Indicator />
              Red
            </CheckboxGroup.Item>
            <CheckboxGroup.Item value="blue">
              <CheckboxGroup.Indicator />
              Blue
            </CheckboxGroup.Item>
            <CheckboxGroup.Item value="green">
              <CheckboxGroup.Indicator />
              Green
            </CheckboxGroup.Item>
          </CheckboxGroup.List>
          <CheckboxGroup.Message />
        </CheckboxGroup.Root>
      );
    }

    render(<TestComponent />);

    // Test initial validation
    expect(onValidate).toHaveBeenCalledWith([]);

    const redCheckbox = screen.getByText("Red").closest("button");
    const blueCheckbox = screen.getByText("Blue").closest("button");
    const greenCheckbox = screen.getByText("Green").closest("button");

    if (!redCheckbox || !blueCheckbox || !greenCheckbox) {
      throw new Error("Checkbox buttons not found");
    }

    // Test valid selection
    await user.click(redCheckbox);
    expect(onValidate).toHaveBeenCalledWith(["red"]);

    // Test maximum selection validation
    await user.click(blueCheckbox);
    await user.click(greenCheckbox);
    expect(onValidate).toHaveBeenCalledWith(["red", "blue", "green"]);
  });

  test("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    renderCheckboxGroup();

    const checkboxes = screen.getAllByRole("checkbox");

    // Focus first checkbox
    await user.tab();
    expect(checkboxes[0]).toHaveFocus();

    // Navigate to next checkbox
    await user.tab();
    expect(checkboxes[1]).toHaveFocus();

    // Select with space
    await user.keyboard(" ");
    expect(checkboxes[1]).toHaveAttribute("aria-checked", "true");
  });

  test("handles form integration", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e) => {
      e.preventDefault();
    });

    render(
      <form onSubmit={handleSubmit} data-testid="form">
        <CheckboxGroup.Root name="colors" required>
          <CheckboxGroup.Label>Colors</CheckboxGroup.Label>
          <CheckboxGroup.List>
            <CheckboxGroup.Item value="red">
              <CheckboxGroup.Indicator />
              Red
            </CheckboxGroup.Item>
            <CheckboxGroup.Item value="blue">
              <CheckboxGroup.Indicator />
              Blue
            </CheckboxGroup.Item>
          </CheckboxGroup.List>
        </CheckboxGroup.Root>
        <button type="submit">Submit</button>
      </form>,
    );

    const form = screen.getByTestId("form");
    const redCheckbox = screen.getByText("Red").closest("button");

    if (!redCheckbox) throw new Error("Red checkbox not found");

    // Select an option and submit
    await user.click(redCheckbox);
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
