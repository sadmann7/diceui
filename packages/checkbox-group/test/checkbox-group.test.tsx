import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import * as CheckboxGroup from "../src/index";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserverMock;

describe("CheckboxGroup", () => {
  function renderCheckboxGroup(
    props: CheckboxGroup.CheckboxGroupRootProps = {},
  ) {
    return render(
      <CheckboxGroup.Root {...props}>
        <CheckboxGroup.Label>Favorite tricks</CheckboxGroup.Label>
        <CheckboxGroup.Description>
          Select your favorite tricks
        </CheckboxGroup.Description>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="kickflip">
            <CheckboxGroup.Indicator />
            Kickflip
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="heelflip">
            <CheckboxGroup.Indicator />
            Heelflip
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="fs-540">
            <CheckboxGroup.Indicator />
            FS 540
          </CheckboxGroup.Item>
        </CheckboxGroup.List>
        <CheckboxGroup.Message />
      </CheckboxGroup.Root>,
    );
  }

  test("renders without crashing", () => {
    renderCheckboxGroup();
    expect(screen.getByText("Favorite tricks")).toBeInTheDocument();
    expect(screen.getByText("Select your favorite tricks")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Favorite tricks" }),
    ).toBeInTheDocument();
  });

  test("handles controlled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <CheckboxGroup.Root value={["kickflip"]} onValueChange={onValueChange}>
        <CheckboxGroup.List>
          <CheckboxGroup.Item value="kickflip">
            <CheckboxGroup.Indicator />
            Kickflip
          </CheckboxGroup.Item>
          <CheckboxGroup.Item value="heelflip">
            <CheckboxGroup.Indicator />
            Heelflip
          </CheckboxGroup.Item>
        </CheckboxGroup.List>
      </CheckboxGroup.Root>,
    );

    const kickflipCheckbox = screen.getByRole("checkbox", { name: "Kickflip" });
    const heelflipCheckbox = screen.getByRole("checkbox", { name: "Heelflip" });

    expect(kickflipCheckbox).toHaveAttribute("aria-checked", "true");
    expect(heelflipCheckbox).toHaveAttribute("aria-checked", "false");

    await user.click(heelflipCheckbox);
    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);

    await user.click(kickflipCheckbox);
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  test("handles uncontrolled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCheckboxGroup({ defaultValue: ["kickflip"], onValueChange });

    const kickflipCheckbox = screen.getByRole("checkbox", { name: "Kickflip" });
    const heelflipCheckbox = screen.getByRole("checkbox", { name: "Heelflip" });

    expect(kickflipCheckbox).toHaveAttribute("aria-checked", "true");
    expect(heelflipCheckbox).toHaveAttribute("aria-checked", "false");

    await user.click(heelflipCheckbox);
    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);
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
          <CheckboxGroup.Item value="kickflip">Kickflip</CheckboxGroup.Item>
          <CheckboxGroup.Item value="heelflip">Heelflip</CheckboxGroup.Item>
          <CheckboxGroup.Item value="fs-540">FS 540</CheckboxGroup.Item>
        </CheckboxGroup.List>
        <CheckboxGroup.Message />
      </CheckboxGroup.Root>,
    );

    // Select first two items
    await user.click(screen.getByRole("checkbox", { name: "Kickflip" }));
    await user.click(screen.getByRole("checkbox", { name: "Heelflip" }));
    expect(onValidate).toHaveBeenCalledWith(["kickflip", "heelflip"]);
    expect(
      screen.queryByText("Maximum 2 items allowed"),
    ).not.toBeInTheDocument();

    // Try to select third item
    await user.click(screen.getByRole("checkbox", { name: "FS 540" }));
    expect(onValidate).toHaveBeenCalledWith(["kickflip", "heelflip", "fs-540"]);
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
      checkboxes[0] ?? screen.getByRole("checkbox", { name: "Kickflip" }),
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles read only state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCheckboxGroup({
      readOnly: true,
      defaultValue: ["kickflip"],
      onValueChange,
    });

    const kickflipCheckbox = screen.getByRole("checkbox", { name: "Kickflip" });
    expect(kickflipCheckbox).toHaveAttribute("aria-checked", "true");

    await user.click(kickflipCheckbox);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles required field validation", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    });

    render(
      <form onSubmit={onSubmit} data-testid="form">
        <CheckboxGroup.Root name="tricks" required>
          <CheckboxGroup.List>
            <CheckboxGroup.Item value="kickflip">Kickflip</CheckboxGroup.Item>
            <CheckboxGroup.Item value="heelflip">Heelflip</CheckboxGroup.Item>
          </CheckboxGroup.List>
        </CheckboxGroup.Root>
        <button type="submit">Submit</button>
      </form>,
    );

    const submitButton = screen.getByText("Submit");

    // Try submitting without selection
    await user.click(submitButton);
    expect(onSubmit).not.toHaveBeenCalled();

    // Select an item and submit
    await user.click(screen.getByRole("checkbox", { name: "Kickflip" }));
    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
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
    const group = screen.getByRole("group", { name: "Favorite tricks" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveAttribute("aria-orientation", "horizontal");
  });

  test("supports RTL direction", () => {
    renderCheckboxGroup({ dir: "rtl" });
    const group = screen.getByRole("group", { name: "Favorite tricks" });
    expect(group).toHaveAttribute("dir", "rtl");
  });

  test("supports accessibility features", () => {
    const { unmount } = renderCheckboxGroup();

    // Test group role and ARIA attributes
    const group = screen.getByRole("group", { name: "Favorite tricks" });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-labelledby");
    expect(group).toHaveAttribute("aria-describedby");
    expect(group).toHaveAttribute("aria-orientation", "vertical");

    // Test label and description
    expect(screen.getByText("Favorite tricks")).toBeInTheDocument();
    expect(screen.getByText("Select your favorite tricks")).toBeInTheDocument();

    // Test checkbox roles and states
    const kickflipCheckbox = screen.getByRole("checkbox", { name: "Kickflip" });
    const heelflipCheckbox = screen.getByRole("checkbox", { name: "Heelflip" });
    const fs540Checkbox = screen.getByRole("checkbox", { name: "FS 540" });

    // Test checkbox attributes
    const checkboxes = [kickflipCheckbox, heelflipCheckbox, fs540Checkbox];
    for (const checkbox of checkboxes) {
      expect(checkbox).toHaveAttribute("type", "button");
      expect(checkbox).toHaveAttribute("aria-checked", "false");
      expect(checkbox).toHaveAttribute("aria-disabled", "false");
    }

    // Clean up previous render
    unmount();

    // Test disabled state in a new render
    renderCheckboxGroup({ disabled: true });
    const disabledCheckbox = screen.getByRole("checkbox", { name: "Kickflip" });
    expect(disabledCheckbox).toHaveAttribute("aria-disabled", "true");
  });
});
