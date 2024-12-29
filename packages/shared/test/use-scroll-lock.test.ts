import { renderHook } from "@testing-library/react";
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

// Mock useIsomorphicLayoutEffect to use useLayoutEffect
vi.mock("../src/hooks/use-isomorphic-layout-effect", () => ({
  useIsomorphicLayoutEffect: React.useLayoutEffect,
}));

describe("useScrollLock", () => {
  let originalGetComputedStyle: typeof window.getComputedStyle;
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let originalClientWidth: number;
  let originalClientHeight: number;

  beforeEach(() => {
    // Enable fake timers
    vi.useFakeTimers();

    // Store original values
    originalGetComputedStyle = window.getComputedStyle;
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalClientWidth = document.documentElement.clientWidth;
    originalClientHeight = document.documentElement.clientHeight;

    // Mock scrollTo
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    // Mock getComputedStyle
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginTop: "0px",
      marginBottom: "0px",
      overflow: "scroll",
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

    // Reset styles
    document.body.style.cssText = "";
    document.documentElement.style.cssText = "";

    // Restore real timers
    vi.useRealTimers();
  });

  it("should not apply scroll lock when enabled is false", () => {
    renderHook(() => useScrollLock({ enabled: false }));
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("should apply scroll lock to body when enabled", () => {
    renderHook(() => useScrollLock({ enabled: true }));
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("should apply scroll lock to custom reference element", () => {
    const customElement = document.createElement("div");
    document.body.appendChild(customElement);

    renderHook(() =>
      useScrollLock({ enabled: true, referenceElement: customElement }),
    );
    expect(customElement.style.overflow).toBe("hidden");

    document.body.removeChild(customElement);
  });

  it("should handle iOS specific behavior", () => {
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const scrollY = 100;
    Object.defineProperty(window, "scrollY", { value: scrollY });

    renderHook(() => useScrollLock({ enabled: true }));

    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe("100%");
    expect(document.body.style.top).toBe(`-${scrollY}px`);
    expect(
      (document.body.style as unknown as { [key: string]: string })[
        "-webkit-overflow-scrolling"
      ],
    ).toBe("touch");
  });

  it("should handle Firefox specific behavior", () => {
    // Mock Firefox detection
    (browser.isFirefox as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (browser.isSafari as ReturnType<typeof vi.fn>).mockReturnValue(false);

    // Mock scrollbar width by setting up window and document dimensions
    // Make sure innerWidth is greater than clientWidth to simulate visible scrollbars
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

    // Mock CSS.supports for dvh
    Object.defineProperty(window, "CSS", {
      value: {
        dvhSupported: () => false,
      },
      configurable: true,
      writable: true,
    });

    // Mock isInsetScroll
    Object.defineProperty(document, "isInsetScroll", {
      value: () => false,
      configurable: true,
      writable: true,
    });

    // Reset styles
    document.body.style.cssText = "";
    document.documentElement.style.cssText = "";

    // Mock getComputedStyle to return necessary styles
    window.getComputedStyle = vi.fn().mockReturnValue({
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      overflowY: "scroll",
    } as unknown as CSSStyleDeclaration);

    renderHook(() => useScrollLock({ enabled: true }));

    // Assert that both overflow and margin-right are applied correctly
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe(`${scrollbarWidth}px`);
  });

  it("should handle Safari with pinch zoom", () => {
    (browser.isSafari as ReturnType<typeof vi.fn>).mockReturnValue(true);

    // Mock visualViewport
    Object.defineProperty(window, "visualViewport", {
      value: { scale: 2 },
      configurable: true,
    });

    renderHook(() => useScrollLock({ enabled: true }));

    // Should not apply scroll lock when zoomed
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("should cleanup styles when unmounted", () => {
    const { unmount } = renderHook(() => useScrollLock({ enabled: true }));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("should handle scrollable elements in iOS", () => {
    (browser.isIOS as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const scrollableElement = document.createElement("div");
    scrollableElement.setAttribute("data-scroll-lock-scrollable", "");
    document.body.appendChild(scrollableElement);

    renderHook(() => useScrollLock({ enabled: true }));

    expect(scrollableElement.style.overflow).toBe("auto");

    document.body.removeChild(scrollableElement);
  });
});
