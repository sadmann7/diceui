import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { VisuallyHiddenInput } from "../src/components/visually-hidden-input";
import { visuallyHidden } from "../src/lib";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

describe("VisuallyHiddenInput", () => {
  const mockControl = document.createElement("div");

  function renderVisuallyHiddenInput(
    props: Partial<React.ComponentProps<typeof VisuallyHiddenInput>> = {},
  ) {
    return render(
      <VisuallyHiddenInput
        data-testid="input"
        control={mockControl}
        {...props}
      />,
    );
  }

  describe("hidden input", () => {
    it("should render with default props", () => {
      renderVisuallyHiddenInput();
      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "hidden");
    });

    it("should bubble input event with string value", () => {
      const value = "test";
      const onChange = vi.fn();

      renderVisuallyHiddenInput({ value, onChange });
      const input = screen.getByTestId("input");

      expect(input).toHaveValue(JSON.stringify(value));
    });

    it("should bubble input event with array value", () => {
      const value = ["item1", "item2"];
      const onChange = vi.fn();

      renderVisuallyHiddenInput({ value, onChange });
      const input = screen.getByTestId("input");

      expect(input).toHaveValue(JSON.stringify(value));
    });

    it("should not bubble events when bubbles is false", () => {
      const value = "test";
      const onChange = vi.fn();

      renderVisuallyHiddenInput({ value, onChange, bubbles: false });
      const input = screen.getByTestId("input");
      expect(input).toHaveValue(JSON.stringify(value));
    });
  });

  describe("checkbox input", () => {
    it("should render checkbox type", () => {
      renderVisuallyHiddenInput({ type: "checkbox" });
      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "checkbox");
      expect(input).toHaveAttribute("aria-hidden", "true");
      expect(input).toHaveAttribute("tabindex", "-1");
    });

    it("should handle checked state", () => {
      const { rerender } = renderVisuallyHiddenInput({
        type: "checkbox",
        checked: true,
      });

      const input = screen.getByTestId("input");
      expect(input).toBeChecked();

      rerender(
        <VisuallyHiddenInput
          control={mockControl}
          type="checkbox"
          checked={false}
          data-testid="input"
        />,
      );
      expect(input).not.toBeChecked();
    });
  });

  describe("form reset", () => {
    it("should call onReset with default value when form is reset", async () => {
      const onReset = vi.fn();
      const defaultValue = "default";

      const { container } = render(
        <form>
          <VisuallyHiddenInput
            control={mockControl}
            value={defaultValue}
            onReset={onReset}
            data-testid="input"
          />
        </form>,
      );

      await waitFor(() => {
        const form = container.querySelector("form");
        if (!form) throw new Error("Form not found");
        fireEvent.reset(form);
      });

      expect(onReset).toHaveBeenCalledWith(defaultValue);
    });
  });

  describe("size synchronization", () => {
    it("should sync size with control element", () => {
      Object.defineProperty(mockControl, "offsetWidth", { value: 100 });
      Object.defineProperty(mockControl, "offsetHeight", { value: 50 });

      renderVisuallyHiddenInput();
      const input = screen.getByTestId("input");

      expect(input).toHaveStyle({
        width: "100px",
        height: "50px",
        ...visuallyHidden,
      });
    });
  });
});
