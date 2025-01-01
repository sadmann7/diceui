import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Slot, Slottable } from "../src/components/slot";

describe("Slot", () => {
  it("renders children directly when asChild is not used", () => {
    render(
      <Slot>
        <div data-testid="test-child">Test Content</div>
      </Slot>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("merges props when rendering children", () => {
    render(
      <Slot className="slot-class" data-testid="slot">
        <div className="child-class" data-testid="child">
          Test Content
        </div>
      </Slot>,
    );

    const element = screen.getByTestId("child");
    expect(element).toHaveClass("slot-class", "child-class");
  });

  it("merges event handlers", () => {
    const slotClick = vi.fn();
    const childClick = vi.fn();

    render(
      <Slot onClick={slotClick}>
        <button onClick={childClick}>Click Me</button>
      </Slot>,
    );

    const button = screen.getByText("Click Me");
    button.click();

    expect(slotClick).toHaveBeenCalled();
    expect(childClick).toHaveBeenCalled();
  });

  it("handles Slottable component correctly", () => {
    render(
      <Slot>
        <div>Before</div>
        <Slottable>
          <button>Slotted Content</button>
        </Slottable>
        <div>After</div>
      </Slot>,
    );

    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("Slotted Content")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });

  it("merges styles properly", () => {
    render(
      <Slot style={{ color: "red", fontSize: "16px" }}>
        {/* Browser computed style convert color value to rgb, so keeping rgb value. */}
        <div style={{ color: "rgb(0, 0, 255)", fontWeight: "bold" }}>
          Styled Content
        </div>
      </Slot>,
    );

    const element = screen.getByText("Styled Content");
    expect(element).toHaveStyle({
      color: "rgb(0, 0, 255)", // Child's color overrides slot's color
      fontSize: "16px",
      fontWeight: "bold",
    });
  });

  it("handles nested slots correctly", () => {
    render(
      <Slot className="outer">
        <Slot className="inner">
          <div data-testid="nested">Nested Content</div>
        </Slot>
      </Slot>,
    );

    const element = screen.getByTestId("nested");
    expect(element).toHaveClass("outer", "inner");
  });

  it("handles undefined and null children", () => {
    render(
      <>
        <Slot>{null}</Slot>
        <Slot>
          <div>Valid Content</div>
        </Slot>
        <Slot>{undefined}</Slot>
      </>,
    );

    expect(screen.getByText("Valid Content")).toBeInTheDocument();
  });
});
