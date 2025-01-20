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

function getInputPlaceholder(multiple?: boolean) {
  return multiple ? "Select tricks..." : "Select a trick...";
}

describe("Combobox", () => {
  function renderCombobox<T extends boolean>(
    props: Combobox.ComboboxRootProps<T> = {},
  ) {
    const { value, multiple, ...comboboxProps } = props;

    return render(
      <Combobox.Root value={value} multiple={multiple} {...comboboxProps}>
        <Combobox.Label>Favorite tricks</Combobox.Label>
        <Combobox.Anchor data-testid="anchor">
          {multiple ? (
            <Combobox.BadgeList>
              {Array.isArray(value) &&
                value.map((value) => (
                  <Combobox.BadgeItem key={value} value={value}>
                    {value}
                    <Combobox.BadgeItemDelete />
                  </Combobox.BadgeItem>
                ))}
            </Combobox.BadgeList>
          ) : null}
          <Combobox.Input placeholder={getInputPlaceholder(multiple)} />
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
      </Combobox.Root>,
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
    const input = screen.getByPlaceholderText(getInputPlaceholder());

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
    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    expect(kickflipOption).toHaveAttribute("aria-selected", "true");

    // Test selecting a new item
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflipOption);
    });
    expect(onValueChange).toHaveBeenCalledWith("heelflip");
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Test input typing
    fireEvent.change(input, { target: { value: "fs" } });
    await waitFor(() => {
      expect(onInputValueChange).toHaveBeenCalledWith("fs");
    });
    const fs540Option = screen.getByRole("option", { name: "FS 540" });
    expect(fs540Option).toBeInTheDocument();
    expect(kickflipOption).not.toBeInTheDocument();
    expect(heelflipOption).not.toBeInTheDocument();

    // Navigate to the filtered option
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(fs540Option).toHaveAttribute("data-highlighted", "");
      expect(input).toHaveAttribute("aria-activedescendant", fs540Option.id);
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

    const input = screen.getByPlaceholderText(getInputPlaceholder());
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
      const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
      expect(kickflipOption).toHaveAttribute("data-highlighted", "");
      expect(input).toHaveAttribute("aria-activedescendant", kickflipOption.id);
    });

    // Test selection
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("kickflip");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("handles multiple selection", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();

    renderCombobox({
      onValueChange,
      onOpenChange,
      value: ["kickflip"],
      multiple: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));
    const trigger = screen.getByTestId("trigger");

    // Open the combobox
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    // Select another item
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflipOption);
    });

    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);
    expect(input).toHaveValue("");

    // Delete a badge using keyboard navigation
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "kickflip" })).toHaveAttribute(
        "data-highlighted",
        "",
      );
    });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(onValueChange).toHaveBeenLastCalledWith([]);
    });
  });

  test("handles badge keyboard navigation", async () => {
    const onValueChange = vi.fn();

    renderCombobox({
      value: ["kickflip", "heelflip"],
      onValueChange,
      multiple: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));

    // Focus input and navigate to badges
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowLeft" });

    // Check if the last badge is highlighted
    const lastBadge = screen
      .getByText("heelflip")
      .closest("[data-highlighted]");
    expect(lastBadge).toBeInTheDocument();

    // Delete highlighted badge with Enter
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);
  });

  test("handles default filtering", async () => {
    renderCombobox();
    const input = screen.getByPlaceholderText(getInputPlaceholder());

    // Type fuzzy match
    fireEvent.change(input, { target: { value: "flp" } });

    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    const fs540Option = screen.getByRole("option", { name: "FS 540" });

    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });

    // Type exact match
    fireEvent.change(input, { target: { value: "Kickflip" } });
    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).not.toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });
  });

  test("handles exact match filtering", async () => {
    renderCombobox({
      exactMatch: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    const trigger = screen.getByTestId("trigger");

    // Open the combobox
    fireEvent.click(trigger);

    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    const fs540Option = screen.getByRole("option", { name: "FS 540" });

    // Type exact match
    fireEvent.change(input, { target: { value: "Kickflip" } });
    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).not.toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });

    // Type partial match
    fireEvent.change(input, { target: { value: "kick" } });
    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).not.toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });
  });

  test("handles custom filtering", async () => {
    const customFilter = (options: string[], term: string) =>
      options.filter((option) =>
        option.toLowerCase().includes(term.toLowerCase()),
      );

    renderCombobox({
      onFilter: customFilter,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());

    // Type to filter
    fireEvent.change(input, { target: { value: "FLIP" } });

    // Check if case-insensitive filtering works
    await waitFor(() => {
      expect(screen.getByText("Kickflip")).toBeInTheDocument();
      expect(screen.getByText("Heelflip")).toBeInTheDocument();
      expect(screen.queryByText("FS 540")).not.toBeInTheDocument();
    });
  });

  test("handles open on focus", async () => {
    renderCombobox({
      openOnFocus: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());

    // Focus should open the combobox
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  test("handles preserve input on blur", async () => {
    renderCombobox({
      preserveInputOnBlur: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());

    // Type something and blur
    fireEvent.change(input, { target: { value: "test" } });
    await waitFor(() => {
      expect(input).toHaveValue("test");
    });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(input).toHaveValue("test");
    });
  });

  test("renders without crashing", () => {
    renderCombobox();
    expect(screen.getByText("Favorite tricks")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(getInputPlaceholder()),
    ).toBeInTheDocument();
  });

  test("handles disabled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({ disabled: true, onValueChange });

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    expect(input).toBeDisabled();

    await user.click(input);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles read only state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({
      readOnly: true,
      defaultValue: "kickflip",
      onValueChange,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    expect(input).toHaveAttribute("readonly");

    await user.type(input, "new value");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("supports RTL direction", async () => {
    renderCombobox({ dir: "rtl" });
    const input = screen.getByPlaceholderText(getInputPlaceholder());
    // Input is inside an anchor
    const anchor = input.closest("div[dir]");
    const trigger = screen.getByTestId("trigger");

    // Open the combobox
    fireEvent.click(trigger);
    const content = screen.getByRole("listbox");

    await waitFor(() => {
      expect(content).toBeInTheDocument();
    });

    expect(anchor).toHaveAttribute("dir", "rtl");
    expect(input).toHaveAttribute("dir", "rtl");
    expect(trigger).toHaveAttribute("dir", "rtl");
    expect(content).toHaveAttribute("dir", "rtl");
  });

  test("supports accessibility features", () => {
    renderCombobox();

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    const label = screen.getByText("Favorite tricks");
    expect(input).toHaveAttribute("role", "combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(label).toHaveAttribute("for", input.id);
  });
});
