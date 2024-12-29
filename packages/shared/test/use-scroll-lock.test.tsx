import { renderHook } from "@testing-library/react";
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

interface ScrollLockComponentProps {
  enabled?: boolean;
  referenceElement?: HTMLElement;
}

function ScrollLockComponent({
  enabled = true,
  referenceElement,
}: ScrollLockComponentProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  useScrollLock({
    enabled,
    referenceElement: referenceElement ?? ref.current,
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
    });

    // Mock window dimensions
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 768,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: 1004,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 748,
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

    // Mock getComputedStyle to include webkit overflow scrolling
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      marginLeft: "0px",
      overflowY: "scroll",
      overflowX: "hidden",
      scrollbarGutter: "auto",
      WebkitOverflowScrolling: "touch",
    } as unknown as CSSStyleDeclaration);

    render(<ScrollLockComponent enabled={true} />);

    // Force a layout calculation
    vi.runAllTimers();

    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe("100%");
    expect(document.body.style.top).toBe(`-${scrollY}px`);
    expect(document.body.style.boxSizing).toBe("border-box");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should handle Firefox specific behavior", () => {
    // Mock Firefox detection
    (browser.isFirefox as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (browser.isSafari as ReturnType<typeof vi.fn>).mockReturnValue(false);

    // Mock scrollbar width by setting up window and document dimensions
    const mockInnerWidth = 1024;
    const mockClientWidth = 1004;
    const scrollbarWidth = mockInnerWidth - mockClientWidth;

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

    // Mock visualViewport
    Object.defineProperty(window, "visualViewport", {
      value: { scale: 2 },
      configurable: true,
    });

    render(<ScrollLockComponent enabled={true} />);

    // Should not apply scroll lock when zoomed
    expect(document.body.style.overflow).not.toBe("hidden");
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
    expect(document.body.style.width).toBe("100vw"); // Should be 100vw with no margin adjustment
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
});
