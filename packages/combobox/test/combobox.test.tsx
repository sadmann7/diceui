import { render, screen } from "@testing-library/react";
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
  const renderCombobox = (props: Combobox.ComboboxRootProps = {}) => {
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
  };

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

  test("supports RTL direction", () => {
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
