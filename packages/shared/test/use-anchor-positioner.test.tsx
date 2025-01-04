import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VAR_TRANSFORM_ORIGIN } from "../src/constants";
import {
  type AnchorPositionerProps,
  useAnchorPositioner,
} from "../src/hooks/use-anchor-positioner";

// Test component that uses useAnchorPositioner
function TestPopover({
  defaultOpen = false,
  side = "bottom",
  align = "start",
}: Partial<AnchorPositionerProps> & {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const {
    refs,
    floatingStyles,
    getFloatingProps,
    arrowStyles,
    onArrowChange,
    placement,
  } = useAnchorPositioner({
    open,
    onOpenChange: setOpen,
    anchorRef,
    side,
    align,
    disableArrow: false,
  });

  const arrowRef = React.useRef<HTMLDivElement>(null);

  // Test arrow positioning right away without settting component for it
  React.useEffect(() => {
    if (arrowRef.current) {
      onArrowChange(arrowRef.current);
    }
  }, [onArrowChange]);

  return (
    <>
      <button
        ref={anchorRef}
        onClick={() => setOpen(!open)}
        data-testid="anchor"
      >
        Toggle
      </button>
      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          data-testid="content"
          data-placement={placement}
        >
          Popover Content
          <div ref={arrowRef} style={arrowStyles} data-testid="arrow" />
        </div>
      )}
    </>
  );
}

describe("useAnchorPositioner", () => {
  const mockAnchorRef = {
    current: document.createElement("div"),
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    anchorRef: mockAnchorRef,
    disableArrow: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.dir = "ltr";
  });

  it("returns expected properties", () => {
    const { result } = renderHook(() => useAnchorPositioner(defaultProps));

    expect(result.current).toHaveProperty("refs");
    expect(result.current).toHaveProperty("floatingStyles");
    expect(result.current).toHaveProperty("placement");
    expect(result.current).toHaveProperty("isPositioned");
    expect(result.current).toHaveProperty("middlewareData");
    expect(result.current).toHaveProperty("elements");
    expect(result.current).toHaveProperty("update");
    expect(result.current).toHaveProperty("context");
    expect(result.current).toHaveProperty("getFloatingProps");
    expect(result.current).toHaveProperty("arrowStyles");
    expect(result.current).toHaveProperty("onArrowChange");
    expect(result.current).toHaveProperty("side");
    expect(result.current).toHaveProperty("align");
    expect(result.current).toHaveProperty("arrowDisplaced");
    expect(result.current).toHaveProperty("anchorHidden");
  });

  it("uses default values when not provided", () => {
    const { result } = renderHook(() => useAnchorPositioner(defaultProps));

    expect(result.current.side).toBe("bottom");
    expect(result.current.align).toBe("start");
    expect(result.current.placement).toBe("bottom-start");
    expect(result.current.arrowDisplaced).toBe(false);
    expect(result.current.anchorHidden).toBe(false);
  });

  it("handles custom placement", () => {
    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        side: "top",
        align: "end",
      }),
    );

    expect(result.current.side).toBe("top");
    expect(result.current.align).toBe("end");
    expect(result.current.placement).toBe("top-end");
  });

  it("handles RTL direction", () => {
    document.dir = "rtl";

    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        side: "right",
        align: "start",
        disableArrow: false,
      }),
    );

    expect(result.current.placement).toBe("right-start");
  });

  it("disables pointer correctly", () => {
    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        disableArrow: true,
      }),
    );

    expect(result.current.arrowStyles).toEqual({});
    expect(result.current.arrowDisplaced).toBe(false);
  });

  it("updates position when open state changes", async () => {
    const { result, rerender } = renderHook(
      ({ open }) => useAnchorPositioner({ ...defaultProps, open }),
      {
        initialProps: { open: false },
      },
    );

    expect(result.current.isPositioned).toBe(false);

    await act(async () => {
      rerender({ open: true });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isPositioned).toBe(false);
  });

  it("handles virtual element as anchor", async () => {
    const virtualElement = {
      getBoundingClientRect: () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
      }),
    };

    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        anchorRef: virtualElement,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isPositioned).toBe(false);
  });

  it("returns correct floating styles", () => {
    const { result } = renderHook(() => useAnchorPositioner(defaultProps));

    expect(result.current.floatingStyles).toHaveProperty("position");
    expect(result.current.floatingStyles).toHaveProperty("top");
    expect(result.current.floatingStyles).toHaveProperty("left");
    expect(result.current.floatingStyles).toHaveProperty(VAR_TRANSFORM_ORIGIN);
  });

  it("handles arrow positioning", () => {
    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        disableArrow: false,
      }),
    );

    const arrowElement = document.createElement("div");
    act(() => {
      result.current.onArrowChange(arrowElement);
    });

    expect(result.current.arrowStyles).toHaveProperty("position", "absolute");
  });

  it("handles collision avoidance", () => {
    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        avoidCollisions: true,
        collisionPadding: 10,
      }),
    );

    expect(result.current.middlewareData).toBeDefined();
  });

  it("handles fitViewport option", () => {
    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        fitViewport: true,
      }),
    );

    expect(result.current.middlewareData).toBeDefined();
  });
});

describe("useAnchorPositioner in React component", () => {
  it("renders and positions content relative to anchor", async () => {
    const user = userEvent.setup();
    render(<TestPopover />);

    const anchor = screen.getByTestId("anchor");
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();

    await user.click(anchor);

    const content = screen.getByTestId("content");
    const arrow = screen.getByTestId("arrow");

    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-placement", "bottom-start");
    expect(arrow).toHaveStyle({ position: "absolute" });
  });

  it("updates placement based on props", () => {
    render(<TestPopover defaultOpen side="top" align="end" />);

    const content = screen.getByTestId("content");
    expect(content).toHaveAttribute("data-placement", "top-end");
  });

  it("toggles content visibility", async () => {
    const user = userEvent.setup();
    render(<TestPopover />);

    const anchor = screen.getByTestId("anchor");

    await user.click(anchor);
    expect(screen.getByTestId("content")).toBeInTheDocument();

    await user.click(anchor);
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });
});

describe("useAnchorPositioner boundary collision detection", () => {
  const mockAnchorRef = {
    current: document.createElement("div"),
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    anchorRef: mockAnchorRef,
    disableArrow: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("handles clippingAncestors boundary", async () => {
    const container = document.createElement("div");
    container.style.width = "300px";
    container.style.height = "300px";
    container.style.overflow = "hidden";
    document.body.appendChild(container);

    function TestComponent() {
      const anchorRef = React.useRef<HTMLButtonElement>(null);
      const { refs, floatingStyles, getFloatingProps } = useAnchorPositioner({
        ...defaultProps,
        collisionBoundary: "clippingAncestors",
        avoidCollisions: true,
      });

      return (
        <>
          <button ref={anchorRef} data-testid="anchor">
            Anchor
          </button>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            data-testid="floating"
          >
            Content
          </div>
        </>
      );
    }

    render(<TestComponent />);
    await screen.findByTestId("floating");

    // Allow time for position updates
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("handles Element boundary", async () => {
    const boundaryElement = document.createElement("div");
    boundaryElement.style.width = "400px";
    boundaryElement.style.height = "400px";
    boundaryElement.style.position = "relative";
    document.body.appendChild(boundaryElement);

    function TestComponent() {
      const anchorRef = React.useRef<HTMLButtonElement>(null);
      const { refs, floatingStyles, getFloatingProps } = useAnchorPositioner({
        open: true,
        onOpenChange: vi.fn(),
        anchorRef,
        collisionBoundary: boundaryElement,
        avoidCollisions: true,
      });

      return (
        <>
          <button ref={anchorRef} data-testid="anchor">
            Anchor
          </button>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            data-testid="floating"
          >
            Content
          </div>
        </>
      );
    }

    render(<TestComponent />);
    await screen.findByTestId("floating");

    // Allow time for position updates
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("handles Array<Element> boundary", async () => {
    const boundary1 = document.createElement("div");
    const boundary2 = document.createElement("div");

    for (const el of [boundary1, boundary2]) {
      el.style.width = "500px";
      el.style.height = "500px";
      el.style.position = "relative";
      document.body.appendChild(el);
    }

    function TestComponent() {
      const anchorRef = React.useRef<HTMLButtonElement>(null);
      const { refs, floatingStyles, getFloatingProps } = useAnchorPositioner({
        open: true,
        onOpenChange: vi.fn(),
        anchorRef,
        collisionBoundary: [boundary1, boundary2],
        avoidCollisions: true,
      });

      return (
        <>
          <button ref={anchorRef} data-testid="anchor">
            Anchor
          </button>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            data-testid="floating"
          >
            Content
          </div>
        </>
      );
    }

    render(<TestComponent />);
    await screen.findByTestId("floating");

    // Allow time for position updates
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("adjusts position when content overflows boundary", async () => {
    const rect = {
      width: 60,
      height: 30,
      x: 10,
      y: 10,
      top: 10,
      right: 70,
      bottom: 40,
      left: 10,
    };

    const virtualElement = {
      getBoundingClientRect: () => rect,
      getClientRects: () => [rect],
      contextElement: document.body,
    };

    function TestComponent() {
      const { refs, floatingStyles, getFloatingProps } = useAnchorPositioner({
        open: true,
        onOpenChange: vi.fn(),
        anchorRef: virtualElement,
        side: "bottom",
        sideOffset: 5,
        strategy: "fixed",
      });

      return (
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            position: "fixed",
            width: "100px",
            height: "40px",
          }}
          {...getFloatingProps()}
          data-testid="floating"
        >
          Content
        </div>
      );
    }

    render(<TestComponent />);
    const floating = await screen.findByTestId("floating");

    // Allow time for position updates
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 16));
    });

    // Get the computed top position from the style
    const computedTop = Number.parseFloat(floating.style.top);

    // Mock getBoundingClientRect to return the correct position
    const floatingBox = {
      width: 100,
      height: 40,
      x: rect.x,
      y: computedTop,
      top: computedTop,
      right: rect.x + 100,
      bottom: computedTop + 40,
      left: rect.x,
    };

    // Debug output
    console.log({
      virtualAnchorBottom: rect.bottom,
      floatingTop: floatingBox.top,
      offset: floatingBox.top - rect.bottom,
      computedTop,
      floatingStyles: floating.style.cssText,
    });

    expect(computedTop - rect.bottom).toBeGreaterThanOrEqual(5);
  });
});
