import { render } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollLock } from "../src/hooks/use-scroll-lock";
import * as browser from "../src/lib/browser";

// Mock browser detection functions
vi.mock("../src/lib/browser", () => ({
  isFirefox: vi.fn(() => false),
  isIOS: vi.fn(() => false),
  isSafari: vi.fn(() => false),
}));

// Mock scrollbar width and height by setting up window and document dimensions
const mockInnerWidth = 1024;
const mockClientWidth = 1004;
const scrollbarWidth = mockInnerWidth - mockClientWidth;
const mockInnerHeight = 768;
const mockClientHeight = 748;
const scrollbarHeight = mockInnerHeight - mockClientHeight;

interface ScrollLockComponentProps {
  enabled?: boolean;
  referenceElement?: HTMLElement;
  allowPinchZoom?: boolean;
}

function ScrollLockComponent({
  enabled = true,
  referenceElement,
  allowPinchZoom,
}: ScrollLockComponentProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  useScrollLock({
    enabled,
    referenceElement: referenceElement ?? ref.current,
    allowPinchZoom,
  });

  return (
    <div>
      <div ref={ref} data-testid="scroll-lock-content">
        Scrollable Content
      </div>
      <div data-testid="outside-content">Outside Content</div>
    </div>
  );
}

describe("useScrollLock", () => {
  let originalGetComputedStyle: typeof window.getComputedStyle;
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let originalClientWidth: number;
  let originalClientHeight: number;
  let originalScrollHeight: number;
  let originalScrollWidth: number;

  beforeEach(() => {
    // Enable fake timers
    vi.useFakeTimers();

    // Store original values
    originalGetComputedStyle = window.getComputedStyle;
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalClientWidth = document.documentElement.clientWidth;
    originalClientHeight = document.documentElement.clientHeight;
    originalScrollHeight = document.documentElement.scrollHeight;
    originalScrollWidth = document.documentElement.scrollWidth;

    // Mock scrollTo
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    // Mock getComputedStyle with more comprehensive values
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginTop: "10px",
      marginBottom: "10px",
      marginLeft: "10px",
      marginRight: "10px",
      overflow: "scroll",
      scrollbarGutter: "auto",
      overscrollBehavior: "auto",
    });

    // Mock window dimensions
    Object.defineProperty(window, "innerWidth", {
      value: mockInnerWidth,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: mockInnerHeight,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: mockClientWidth,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: mockClientHeight,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 1500,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "scrollWidth", {
      value: 1200,
      configurable: true,
      writable: true,
    });

    // Mock CSS.supports
    Object.defineProperty(window, "CSS", {
      value: {
        supports: vi.fn((prop, value) => prop === "height" && value === "1dvh"),
      },
      configurable: true,
      writable: true,
    });

    // Mock visualViewport
    Object.defineProperty(window, "visualViewport", {
      value: { scale: 1, height: mockInnerHeight },
      configurable: true,
      writable: true,
    });

    // Reset all mocks before each test
    vi.clearAllMocks();

    // Reset body and documentElement styles
    document.body.style.cssText = "";
    document.documentElement.style.cssText = "";

    // Reset browser detection mocks
    (browser.isFirefox as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (browser.isSafari as ReturnType<typeof vi.fn>).mockReturnValue(false);
  });

  afterEach(() => {
    // Restore original values
    window.getComputedStyle = originalGetComputedStyle;
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: originalInnerHeight,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: originalClientWidth,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: originalClientHeight,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: originalScrollHeight,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "scrollWidth", {
      value: originalScrollWidth,
      configurable: true,
      writable: true,
    });

    // Reset styles
    document.body.style.cssText = "";
    document.documentElement.style.cssText = "";

    // Restore real timers
    vi.useRealTimers();
  });

  it("should not apply scroll lock when enabled is false", () => {
    render(<ScrollLockComponent enabled={false} />);
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("should apply scroll lock to body when enabled", () => {
    render(<ScrollLockComponent enabled={true} />);

    // Force a layout calculation
    vi.runAllTimers();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflowY).toBe("scroll");
  });

  it("should apply scroll lock to custom reference element", () => {
    const customElement = document.createElement("div");
    document.body.appendChild(customElement);

    // Mock scrollable state
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      marginLeft: "0px",
      overflowY: "scroll",
      overflowX: "hidden",
      scrollbarGutter: "auto",
    } as unknown as CSSStyleDeclaration);

    render(
      <ScrollLockComponent enabled={true} referenceElement={customElement} />,
    );

    // Force a layout calculation
    vi.runAllTimers();

    // The hook applies styles to document/body even with reference element
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflowY).toBe("scroll");

    document.body.removeChild(customElement);
  });

  it("should handle iOS specific behavior", () => {
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const scrollY = 100;
    Object.defineProperty(window, "scrollY", { value: scrollY });

    // Mock getComputedStyle with margins
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "10px",
      marginTop: "10px",
      marginBottom: "10px",
      marginLeft: "10px",
      overflow: "scroll",
      scrollbarGutter: "auto",
      overscrollBehavior: "auto",
    });

    render(<ScrollLockComponent enabled={true} />);

    // Force a layout calculation
    vi.runAllTimers();

    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe(
      `calc(100vw - ${scrollbarWidth + 20}px)`,
    );
    expect(document.body.style.top).toBe(`-${scrollY}px`);
    expect(document.body.style.boxSizing).toBe("border-box");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should handle Firefox specific behavior", () => {
    // Mock Firefox detection
    (browser.isFirefox as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (browser.isSafari as ReturnType<typeof vi.fn>).mockReturnValue(false);

    // Set up window dimensions to ensure scrollbarWidth > 0
    Object.defineProperty(window, "innerWidth", {
      value: mockInnerWidth,
      configurable: true,
      writable: true,
    });

    // Set up document dimensions
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: mockClientWidth,
      configurable: true,
      writable: true,
    });

    // Mock getComputedStyle to return necessary styles
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      marginLeft: "0px",
      overflowY: "scroll",
      overflowX: "hidden",
      scrollbarGutter: "auto",
    } as unknown as CSSStyleDeclaration);

    render(<ScrollLockComponent enabled={true} />);

    // Force a layout calculation
    vi.runAllTimers();

    // Assert that both overflow and margin-right are applied correctly
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflowY).toBe("scroll");
    expect(document.body.style.width).toBe(`calc(100vw - ${scrollbarWidth}px)`);
  });

  it("should handle Safari with pinch zoom", () => {
    (browser.isSafari as ReturnType<typeof vi.fn>).mockReturnValue(true);

    // Mock visualViewport with zoomed scale
    Object.defineProperty(window, "visualViewport", {
      value: { scale: 2, height: mockInnerHeight },
      configurable: true,
    });

    render(<ScrollLockComponent enabled={true} allowPinchZoom={false} />);
    expect(document.body.style.overflow).toBe("");

    // Test with allowPinchZoom true
    render(<ScrollLockComponent enabled={true} allowPinchZoom={true} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should cleanup styles when unmounted", () => {
    const { unmount } = render(<ScrollLockComponent enabled={true} />);
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("should handle scrollable elements in iOS", () => {
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const scrollableElement = document.createElement("div");
    scrollableElement.setAttribute("data-scroll-lock-scrollable", "");
    // Set the overflow style directly as it would be in real DOM
    scrollableElement.style.overflow = "auto";
    document.body.appendChild(scrollableElement);

    // Mock getComputedStyle for scrollable element
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (element: Element) => {
      if (element === scrollableElement) {
        return {
          overflow: "auto",
          overflowY: "auto",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        } as unknown as CSSStyleDeclaration;
      }
      return originalGetComputedStyle(element);
    };

    render(<ScrollLockComponent enabled={true} />);

    // Force a layout calculation
    vi.runAllTimers();

    expect(scrollableElement.style.overflow).toBe("auto");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");

    document.body.removeChild(scrollableElement);
  });

  it("should handle scrollbar-gutter stable", () => {
    // Mock getComputedStyle with all necessary values
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      marginLeft: "0px",
      overflowY: "scroll",
      overflowX: "hidden",
      scrollbarGutter: "stable",
    } as unknown as CSSStyleDeclaration);

    // Mock dimensions to simulate no scrollbar width
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: 1024, // Same as innerWidth to simulate no scrollbar
      configurable: true,
      writable: true,
    });

    render(<ScrollLockComponent enabled={true} />);

    expect(document.documentElement.style.overflowY).toBe("hidden");
    expect(document.documentElement.style.paddingRight).toBe("");
    expect(document.body.style.width).toBe("100vw");
  });

  it("should handle dvh units when supported", () => {
    // Mock CSS.supports to return true for dvh
    Object.defineProperty(window, "CSS", {
      value: {
        supports: vi.fn((prop, value) => prop === "height" && value === "1dvh"),
      },
      configurable: true,
    });

    render(<ScrollLockComponent enabled={true} />);

    expect(document.body.style.height).toBe("calc(100dvh - 20px)");
  });

  it("should handle vh units when dvh is not supported", () => {
    // Mock CSS.supports to return false for dvh
    Object.defineProperty(window, "CSS", {
      value: {
        supports: vi.fn(() => false),
      },
      configurable: true,
    });

    render(<ScrollLockComponent enabled={true} />);

    expect(document.body.style.height).toBe("calc(100vh - 20px)");
  });

  it("should handle both x and y scrolling", () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      overflowY: "scroll",
      overflowX: "scroll",
      scrollbarGutter: "auto",
    } as unknown as CSSStyleDeclaration);

    render(<ScrollLockComponent enabled={true} />);

    expect(document.documentElement.style.overflowY).toBe("scroll");
    expect(document.documentElement.style.overflowX).toBe("scroll");
  });

  it("should handle resize events", () => {
    render(<ScrollLockComponent enabled={true} />);

    // Trigger resize event
    window.dispatchEvent(new Event("resize"));
    vi.runAllTimers();

    expect(document.documentElement.style.overflowY).toBe("scroll");
    expect(document.body.style.width).toBe("calc(100vw - 40px)");
  });

  it("should handle iOS specific behavior with scrollable elements", () => {
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const scrollY = 100;
    Object.defineProperty(window, "scrollY", { value: scrollY });

    const scrollableElement = document.createElement("div");
    scrollableElement.setAttribute("data-scrollable", "");
    scrollableElement.style.overflow = "auto";

    // Mock scroll dimensions to make element actually scrollable
    Object.defineProperty(scrollableElement, "scrollHeight", { value: 200 });
    Object.defineProperty(scrollableElement, "clientHeight", { value: 100 });
    Object.defineProperty(scrollableElement, "scrollWidth", { value: 200 });
    Object.defineProperty(scrollableElement, "clientWidth", { value: 100 });

    document.body.appendChild(scrollableElement);

    // Mock getComputedStyle specifically for the scrollable element
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (element: Element) => {
      if (element === scrollableElement) {
        return {
          overflow: "auto",
          overflowY: "auto",
          overflowX: "auto",
          overscrollBehavior: "auto",
        } as unknown as CSSStyleDeclaration;
      }
      return {
        marginTop: "10px",
        marginBottom: "10px",
        marginLeft: "10px",
        marginRight: "10px",
        overflow: "scroll",
        scrollbarGutter: "auto",
        overscrollBehavior: "auto",
      } as unknown as CSSStyleDeclaration;
    };

    render(<ScrollLockComponent enabled={true} />);

    // Simulate touch events
    const touchStartEvent = new TouchEvent("touchstart", {
      touches: [{ clientX: 0, clientY: 0 } as Touch],
    });
    const touchMoveEvent = new TouchEvent("touchmove", {
      touches: [{ clientX: 0, clientY: 10 } as Touch],
    });

    scrollableElement.dispatchEvent(touchStartEvent);
    scrollableElement.dispatchEvent(touchMoveEvent);

    expect(scrollableElement.style.overscrollBehavior).toBe("contain");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe(
      `calc(100vw - ${scrollbarWidth + 20}px)`,
    );
    expect(document.body.style.height).toBe(
      `calc(100vh - ${scrollbarHeight + 20}px)`,
    );

    // Restore original getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
    document.body.removeChild(scrollableElement);
  });

  it("should handle iOS keyboard focus behavior", () => {
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);

    // Mock visualViewport.addEventListener
    const mockAddEventListener = vi.fn();
    Object.defineProperty(window.visualViewport, "addEventListener", {
      value: mockAddEventListener,
      configurable: true,
    });

    render(<ScrollLockComponent enabled={true} />);

    const focusEvent = new FocusEvent("focus");
    input.dispatchEvent(focusEvent);

    // Check initial transform
    expect(input.style.transform).toBe("translateY(-2000px)");

    // Run animation frame
    vi.runAllTimers();

    expect(input.style.transform).toBe("");

    // Verify visualViewport event listener was called
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
      { once: true },
    );

    document.body.removeChild(input);
  });

  it("should handle allowPinchZoom in Safari", () => {
    (browser.isSafari as ReturnType<typeof vi.fn>).mockReturnValue(true);

    // Mock visualViewport with zoomed scale
    Object.defineProperty(window, "visualViewport", {
      value: { scale: 2, height: mockInnerHeight },
      configurable: true,
    });

    // Test with allowPinchZoom true
    render(<ScrollLockComponent enabled={true} allowPinchZoom={true} />);
    expect(document.body.style.overflow).toBe("hidden");

    // Test with allowPinchZoom false
    render(<ScrollLockComponent enabled={true} allowPinchZoom={false} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should handle scrollbar-gutter stable with no scrollbar width", () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      marginLeft: "0px",
      overflowY: "scroll",
      overflowX: "hidden",
      scrollbarGutter: "stable",
    } as unknown as CSSStyleDeclaration);

    // Mock dimensions to simulate no scrollbar width
    Object.defineProperty(window, "innerWidth", {
      value: mockClientWidth, // Same as clientWidth to simulate no scrollbar
      configurable: true,
    });

    render(<ScrollLockComponent enabled={true} />);

    expect(document.documentElement.style.overflowY).toBe("hidden");
    expect(document.documentElement.style.paddingRight).toBe("");
    expect(document.body.style.width).toBe("100vw");
  });

  it("should handle both vertical and horizontal scrollbars", () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "10px",
      marginTop: "10px",
      marginBottom: "10px",
      marginLeft: "10px",
      overflowY: "scroll",
      overflowX: "scroll",
      scrollbarGutter: "auto",
    } as unknown as CSSStyleDeclaration);

    render(<ScrollLockComponent enabled={true} />);

    expect(document.documentElement.style.overflowY).toBe("scroll");
    expect(document.documentElement.style.overflowX).toBe("scroll");
    expect(document.body.style.width).toBe(
      `calc(100vw - ${scrollbarWidth + 20}px)`,
    );
    expect(document.body.style.height).toBe("calc(100dvh - 20px)");
  });
});
