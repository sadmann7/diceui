import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Primitive } from "../src/components/primitive";

describe("Primitive", () => {
  it("renders basic HTML elements", () => {
    render(<Primitive.div data-testid="test-div">Test Content</Primitive.div>);
    expect(screen.getByTestId("test-div")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("forwards refs correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Primitive.div ref={ref}>Content</Primitive.div>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("handles asChild prop correctly", () => {
    render(
      <Primitive.div asChild>
        <button data-testid="button">Click me</button>
      </Primitive.div>,
    );

    const button = screen.getByTestId("button");
    expect(button.tagName).toBe("BUTTON");
  });

  it("merges props when using asChild", () => {
    render(
      <Primitive.div
        className="primitive-class"
        data-testid="primitive"
        asChild
      >
        <button className="button-class" data-testid="button">
          Click me
        </button>
      </Primitive.div>,
    );

    const button = screen.getByTestId("button");
    expect(button).toHaveClass("primitive-class", "button-class");
  });

  it("handles event handlers", () => {
    const onClick = vi.fn();
    render(
      <Primitive.button onClick={onClick} data-testid="button">
        Click me
      </Primitive.button>,
    );

    const button = screen.getByTestId("button");
    button.click();
    expect(onClick).toHaveBeenCalled();
  });

  it("handles different HTML elements", () => {
    render(
      <div>
        <Primitive.span data-testid="span">Span</Primitive.span>
        <Primitive.p data-testid="p">Paragraph</Primitive.p>
        <Primitive.button data-testid="button">Button</Primitive.button>
      </div>,
    );

    expect(screen.getByTestId("span").tagName).toBe("SPAN");
    expect(screen.getByTestId("p").tagName).toBe("P");
    expect(screen.getByTestId("button").tagName).toBe("BUTTON");
  });

  it("caches primitive components", () => {
    const firstDiv = Primitive.div;
    const secondDiv = Primitive.div;
    expect(firstDiv).toBe(secondDiv);
  });

  it("handles nested primitives", () => {
    render(
      <Primitive.div data-testid="outer">
        <Primitive.div data-testid="inner">Nested Content</Primitive.div>
      </Primitive.div>,
    );

    expect(screen.getByTestId("outer")).toContainElement(
      screen.getByTestId("inner"),
    );
  });

  it("handles custom data attributes", () => {
    render(
      <Primitive.div
        data-testid="test-div"
        data-custom="value"
        aria-label="test label"
      >
        Content
      </Primitive.div>,
    );

    const element = screen.getByTestId("test-div");
    expect(element).toHaveAttribute("data-custom", "value");
    expect(element).toHaveAttribute("aria-label", "test label");
  });
});
