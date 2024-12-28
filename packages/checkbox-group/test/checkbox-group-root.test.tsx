import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// biome-ignore lint/style/useImportType: <explanation>
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import * as CheckboxGroup from "../src/index";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

describe("CheckboxGroup", () => {
  const renderCheckboxGroup = (props = {}) => {
    return render(
      <CheckboxGroup.Root {...props}>
        <CheckboxGroup.Label>Favorite Fruits</CheckboxGroup.Label>
        <CheckboxGroup.Description>
          Select your favorite fruits
        </CheckboxGroup.Description>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="apple">
            <CheckboxGroup.Indicator />
            Apple
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="banana">
            <CheckboxGroup.Indicator />
            Banana
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="orange">
            <CheckboxGroup.Indicator />
            Orange
          </CheckboxGroup.Item>
        </CheckboxGroup.List>
        <CheckboxGroup.Message />
      </CheckboxGroup.Root>,
    );
  };

  test("renders without crashing", () => {
    renderCheckboxGroup();
    expect(screen.getByText("Favorite Fruits")).toBeInTheDocument();
    expect(screen.getByText("Select your favorite fruits")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Favorite Fruits" }),
    ).toBeInTheDocument();
  });

  test("handles controlled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <CheckboxGroup.Root value={["apple"]} onValueChange={onValueChange}>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="apple">
            <CheckboxGroup.Indicator />
            Apple
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="banana">
            <CheckboxGroup.Indicator />
            Banana
          </CheckboxGroup.Item>
        </CheckboxGroup.List>
      </CheckboxGroup.Root>,
    );

    const appleCheckbox = screen.getByRole("checkbox", { name: "Apple" });
    const bananaCheckbox = screen.getByRole("checkbox", { name: "Banana" });

    expect(appleCheckbox).toHaveAttribute("aria-checked", "true");
    expect(bananaCheckbox).toHaveAttribute("aria-checked", "false");

    await user.click(bananaCheckbox);
    expect(onValueChange).toHaveBeenCalledWith(["apple", "banana"]);

    await user.click(appleCheckbox);
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  test("handles uncontrolled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCheckboxGroup({ defaultValue: ["apple"], onValueChange });

    const appleCheckbox = screen.getByRole("checkbox", { name: "Apple" });
    const bananaCheckbox = screen.getByRole("checkbox", { name: "Banana" });

    expect(appleCheckbox).toHaveAttribute("aria-checked", "true");
    expect(bananaCheckbox).toHaveAttribute("aria-checked", "false");

    await user.click(bananaCheckbox);
    expect(onValueChange).toHaveBeenCalledWith(["apple", "banana"]);
  });

  test("handles validation", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn((value: string[]) => {
      if (value.length > 2) return "Maximum 2 items allowed";
      return true;
    });

    render(
      <CheckboxGroup.Root onValidate={onValidate}>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="apple">Apple</CheckboxGroup.Item>
          <CheckboxGroup.Item value="banana">Banana</CheckboxGroup.Item>
          <CheckboxGroup.Item value="orange">Orange</CheckboxGroup.Item>
        </CheckboxGroup.List>
        <CheckboxGroup.Message />
      </CheckboxGroup.Root>,
    );

    // Select first two items
    await user.click(screen.getByRole("checkbox", { name: "Apple" }));
    await user.click(screen.getByRole("checkbox", { name: "Banana" }));
    expect(onValidate).toHaveBeenCalledWith(["apple", "banana"]);
    expect(
      screen.queryByText("Maximum 2 items allowed"),
    ).not.toBeInTheDocument();

    // Try to select third item
    await user.click(screen.getByRole("checkbox", { name: "Orange" }));
    expect(onValidate).toHaveBeenCalledWith(["apple", "banana", "orange"]);
    expect(screen.getByText("Maximum 2 items allowed")).toBeInTheDocument();
  });

  test("handles disabled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCheckboxGroup({ disabled: true, onValueChange });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toHaveAttribute("disabled");
    expect(checkboxes[1]).toHaveAttribute("disabled");
    expect(checkboxes[2]).toHaveAttribute("disabled");

    await user.click(
      checkboxes[0] ?? screen.getByRole("checkbox", { name: "Apple" }),
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles read-only state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCheckboxGroup({
      readOnly: true,
      defaultValue: ["apple"],
      onValueChange,
    });

    const appleCheckbox = screen.getByRole("checkbox", { name: "Apple" });
    expect(appleCheckbox).toHaveAttribute("aria-checked", "true");

    await user.click(appleCheckbox);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles required field validation", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    });

    render(
      <form onSubmit={handleSubmit} data-testid="form">
        <CheckboxGroup.Root name="fruits" required>
          <CheckboxGroup.List>
            <CheckboxGroup.Item value="apple">Apple</CheckboxGroup.Item>
            <CheckboxGroup.Item value="banana">Banana</CheckboxGroup.Item>
          </CheckboxGroup.List>
        </CheckboxGroup.Root>
        <button type="submit">Submit</button>
      </form>,
    );

    const form = screen.getByTestId("form");
    const submitButton = screen.getByText("Submit");

    // Try submitting without selection
    await user.click(submitButton);
    expect(handleSubmit).not.toHaveBeenCalled();

    // Select an item and submit
    await user.click(screen.getByRole("checkbox", { name: "Apple" }));
    await user.click(submitButton);

    // Use fireEvent to ensure form submission
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    renderCheckboxGroup();

    const checkboxes = screen.getAllByRole("checkbox");

    // Tab to first checkbox
    await user.tab();
    expect(checkboxes[0]).toHaveFocus();

    // Space to select
    await user.keyboard(" ");
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "true");

    // Tab to next checkbox
    await user.tab();
    expect(checkboxes[1]).toHaveFocus();

    // Space to select
    await user.keyboard(" ");
    expect(checkboxes[1]).toHaveAttribute("aria-checked", "true");
  });

  test("supports horizontal orientation", () => {
    renderCheckboxGroup({ orientation: "horizontal" });
    const group = screen.getByRole("group", { name: "Favorite Fruits" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveAttribute("aria-orientation", "horizontal");
  });

  test("supports RTL direction", () => {
    renderCheckboxGroup({ dir: "rtl" });
    const group = screen.getByRole("group", { name: "Favorite Fruits" });
    expect(group).toHaveAttribute("dir", "rtl");
  });

  test("supports accessibility features", () => {
    const { unmount } = renderCheckboxGroup();

    // Test group role and ARIA attributes
    const group = screen.getByRole("group", { name: "Favorite Fruits" });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-labelledby");
    expect(group).toHaveAttribute("aria-describedby");
    expect(group).toHaveAttribute("aria-orientation", "vertical");

    // Test label and description
    expect(screen.getByText("Favorite Fruits")).toBeInTheDocument();
    expect(screen.getByText("Select your favorite fruits")).toBeInTheDocument();

    // Test checkbox roles and states
    const appleCheckbox = screen.getByRole("checkbox", { name: "Apple" });
    const bananaCheckbox = screen.getByRole("checkbox", { name: "Banana" });
    const orangeCheckbox = screen.getByRole("checkbox", { name: "Orange" });

    // Test checkbox attributes
    const checkboxes = [appleCheckbox, bananaCheckbox, orangeCheckbox];
    for (const checkbox of checkboxes) {
      expect(checkbox).toHaveAttribute("type", "button");
      expect(checkbox).toHaveAttribute("aria-checked", "false");
      expect(checkbox).toHaveAttribute("aria-disabled", "false");
    }

    // Clean up previous render
    unmount();

    // Test disabled state in a new render
    renderCheckboxGroup({ disabled: true });
    const disabledCheckbox = screen.getByRole("checkbox", { name: "Apple" });
    expect(disabledCheckbox).toHaveAttribute("aria-disabled", "true");
  });
});
