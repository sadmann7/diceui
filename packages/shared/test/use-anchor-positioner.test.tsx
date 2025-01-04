import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VAR_TRANSFORM_ORIGIN } from "../src/constants";
import { useAnchorPositioner } from "../src/hooks/use-anchor-positioner";

describe("useAnchorPositioner", () => {
  const mockAnchorRef = {
    current: document.createElement("div"),
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    anchorRef: mockAnchorRef,
    disablePointer: true,
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
        disablePointer: false,
      }),
    );

    expect(result.current.placement).toBe("right-start");
  });

  it("disables pointer correctly", () => {
    const { result } = renderHook(() =>
      useAnchorPositioner({
        ...defaultProps,
        disablePointer: true,
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
        disablePointer: false,
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
