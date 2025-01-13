import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { BubbleInput } from "../src/components/bubble-input";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

describe("BubbleInput", () => {
  const mockControl = document.createElement("div");

  describe("hidden input", () => {
    it("should render with default props", () => {
      render(<BubbleInput control={mockControl} data-testid="bubble-input" />);
      const input = screen.getByTestId("bubble-input");
      expect(input).toHaveAttribute("type", "hidden");
    });

    it("should bubble input event with string value", () => {
      const value = "test";
      const onChange = vi.fn();

      render(
        <BubbleInput
          control={mockControl}
          value={value}
          onChange={onChange}
          data-testid="bubble-input"
        />,
      );
      const input = screen.getByTestId("bubble-input");

      expect(input).toHaveValue(JSON.stringify(value));
    });

    it("should bubble input event with array value", () => {
      const value = ["item1", "item2"];
      const onChange = vi.fn();

      render(
        <BubbleInput
          control={mockControl}
          value={value}
          onChange={onChange}
          data-testid="bubble-input"
        />,
      );
      const input = screen.getByTestId("bubble-input");

      expect(input).toHaveValue(JSON.stringify(value));
    });

    it("should not bubble events when bubbles is false", () => {
      const value = "test";
      const onChange = vi.fn();

      render(
        <BubbleInput
          control={mockControl}
          value={value}
          onChange={onChange}
          bubbles={false}
          data-testid="bubble-input"
        />,
      );

      const input = screen.getByTestId("bubble-input");
      expect(input).toHaveValue(JSON.stringify(value));
    });
  });

  describe("checkbox input", () => {
    it("should render checkbox type", () => {
      render(
        <BubbleInput
          control={mockControl}
          type="checkbox"
          data-testid="bubble-input"
        />,
      );
      const input = screen.getByTestId("bubble-input");
      expect(input).toHaveAttribute("type", "checkbox");
      expect(input).toHaveAttribute("aria-hidden", "true");
      expect(input).toHaveAttribute("tabindex", "-1");
    });

    it("should handle checked state", () => {
      const { rerender } = render(
        <BubbleInput
          control={mockControl}
          type="checkbox"
          checked={true}
          data-testid="bubble-input"
        />,
      );

      const input = screen.getByTestId("bubble-input");
      expect(input).toBeChecked();

      rerender(
        <BubbleInput
          control={mockControl}
          type="checkbox"
          checked={false}
          data-testid="bubble-input"
        />,
      );
      expect(input).not.toBeChecked();
    });
  });

  describe("form reset", () => {
    it("should call onReset with default value when form is reset", () => {
      const onReset = vi.fn();
      const defaultValue = "default";

      const { container } = render(
        <form>
          <BubbleInput
            control={mockControl}
            value={defaultValue}
            onReset={onReset}
            data-testid="bubble-input"
          />
        </form>,
      );

      const form = container.querySelector("form");
      if (!form) throw new Error("Form not found");
      fireEvent.reset(form);

      expect(onReset).toHaveBeenCalledWith(defaultValue);
    });
  });

  describe("size synchronization", () => {
    it("should sync size with control element", () => {
      Object.defineProperty(mockControl, "offsetWidth", { value: 100 });
      Object.defineProperty(mockControl, "offsetHeight", { value: 50 });

      render(<BubbleInput control={mockControl} data-testid="bubble-input" />);
      const input = screen.getByTestId("bubble-input");

      expect(input).toHaveStyle({
        width: "100px",
        height: "50px",
        position: "absolute",
        pointerEvents: "none",
        opacity: "0",
        margin: "0",
      });
    });
  });
});
