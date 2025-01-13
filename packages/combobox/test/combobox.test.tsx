import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import * as Combobox from "../src/index";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

// Mock pointer capture methods
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe("Combobox", () => {
  function renderCombobox(props: Combobox.ComboboxRootProps = {}) {
    return render(
      <div dir={props.dir}>
        <Combobox.Root {...props}>
          <Combobox.Label>Favorite tricks</Combobox.Label>
          <Combobox.Anchor data-testid="anchor">
            <Combobox.Input placeholder="Select a trick..." />
            <Combobox.Trigger data-testid="trigger">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Combobox.Trigger>
          </Combobox.Anchor>
          <Combobox.Portal data-testid="portal">
            <Combobox.Content data-testid="content">
              <Combobox.Item value="kickflip">Kickflip</Combobox.Item>
              <Combobox.Item value="heelflip">Heelflip</Combobox.Item>
              <Combobox.Item value="fs-540">FS 540</Combobox.Item>
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
      </div>,
    );
  }

  test("handles controlled state", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();

    renderCombobox({
      defaultValue: "kickflip",
      onOpenChange,
      onValueChange,
      onInputValueChange,
    });

    const trigger = screen.getByTestId("trigger");
    const input = screen.getByPlaceholderText("Select a trick...");

    // Test initial state
    expect(input).toHaveValue("kickflip");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Test open state
    await waitFor(() => {
      fireEvent.click(trigger);
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Test selected item state
    const kickflip = screen.getByRole("option", { name: "Kickflip" });
    expect(kickflip).toHaveAttribute("aria-selected", "true");

    // Test selecting a new item
    const heelflip = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflip);
    });
    expect(onValueChange).toHaveBeenCalledWith("heelflip");
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Test input typing
    fireEvent.change(input, { target: { value: "fs" } });
    await waitFor(() => {
      expect(onInputValueChange).toHaveBeenCalledWith("fs");
    });
    const fs540 = screen.getByRole("option", { name: "FS 540" });
    expect(fs540).toBeInTheDocument();
    expect(kickflip).not.toBeInTheDocument();
    expect(heelflip).not.toBeInTheDocument();

    // Navigate to the filtered option
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(fs540).toHaveAttribute("data-highlighted", "");
    });

    // Select the highlighted option
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("fs-540");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("handles keyboard navigation", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();

    renderCombobox({
      onOpenChange,
      onValueChange,
    });

    const input = screen.getByPlaceholderText("Select a trick...");
    const trigger = screen.getByTestId("trigger");

    // Open the combobox
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Focus the input
    fireEvent.focus(input);
    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    // Test keyboard navigation
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const option = screen.getByRole("option", { name: "Kickflip" });
      expect(option).toHaveAttribute("data-highlighted", "");
    });

    // Test selection
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("kickflip");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("renders without crashing", () => {
    renderCombobox();
    expect(screen.getByText("Favorite tricks")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Select a trick..."),
    ).toBeInTheDocument();
  });

  test("handles disabled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({ disabled: true, onValueChange });

    const input = screen.getByPlaceholderText("Select a trick...");
    expect(input).toBeDisabled();

    await user.click(input);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles readOnly state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({
      readOnly: true,
      defaultValue: "kickflip",
      onValueChange,
    });

    const input = screen.getByPlaceholderText("Select a trick...");
    expect(input).toHaveAttribute("readonly");

    await user.type(input, "new value");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("supports RTL direction", async () => {
    renderCombobox({ dir: "rtl" });
    const root = screen.getByRole("combobox").closest("div[dir]");
    expect(root).toHaveAttribute("dir", "rtl");
  });

  test("supports accessibility features", () => {
    renderCombobox();

    const input = screen.getByPlaceholderText("Select a trick...");
    expect(input).toHaveAttribute("role", "combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
