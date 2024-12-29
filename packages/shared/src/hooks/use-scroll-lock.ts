import * as React from "react";
import { isFirefox, isIOS, isSafari } from "../lib/browser";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

function getScrollbarWidth() {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

function getScrollbarHeight() {
  return Math.max(
    0,
    window.innerHeight - document.documentElement.clientHeight,
  );
}

function getOriginalStyles(element: HTMLElement) {
  const computedStyle = window.getComputedStyle(element);
  return {
    overflow: element.style.overflow,
    paddingRight: element.style.paddingRight,
    paddingBottom: element.style.paddingBottom,
    position: element.style.position,
    height: element.style.height,
    width: element.style.width,
    top: element.style.top,
    left: element.style.left,
    marginTop: computedStyle.marginTop,
    marginBottom: computedStyle.marginBottom,
  };
}

function getIsDvhSupported() {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("height", "1dvh")
  );
}

function getIsInsetScroll(referenceElement: HTMLElement | null) {
  if (typeof document === "undefined") return false;
  const doc = referenceElement ? referenceElement.ownerDocument : document;
  const win = doc ? doc.defaultView : window;
  if (!win) return false;
  return win.innerWidth - doc.documentElement.clientWidth > 0;
}

interface ScrollLockOptions {
  referenceElement?: HTMLElement | null;
  enabled?: boolean;
  allowPinchZoom?: boolean;
}

// Track scroll lock state globally
let preventScrollCount = 0;

function useScrollLock({
  referenceElement,
  enabled = false,
  allowPinchZoom = false,
}: ScrollLockOptions = {}) {
  const scrollPositionRef = React.useRef(0);
  const originalStylesRef = React.useRef<Record<string, string>>({});

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;

    const targetElement = referenceElement ?? document.body;
    const documentElement = document.documentElement;
    const ios = isIOS();
    const firefox = isFirefox();
    const safari = isSafari();

    // Don't lock if pinch-zoom is active in Safari
    if (
      safari &&
      !allowPinchZoom &&
      (window.visualViewport?.scale ?? 1) !== 1
    ) {
      return;
    }

    // Increment global counter
    preventScrollCount++;
    if (preventScrollCount !== 1) return;

    // Store scroll position and original styles
    scrollPositionRef.current = window.scrollY;
    originalStylesRef.current = getOriginalStyles(targetElement);

    const scrollbarWidth = getScrollbarWidth();
    const scrollbarHeight = getScrollbarHeight();

    // Handle iOS devices
    if (ios) {
      const scrollableElements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-lock-scrollable]"),
      );

      Object.assign(targetElement.style, {
        position: "fixed",
        width: "100%",
        top: `-${scrollPositionRef.current}px`,
        left: "0",
        overflow: scrollableElements.length ? "auto" : "hidden",
        height: "100%",
        "-webkit-overflow-scrolling": "touch",
      });

      // Enable scrolling on marked elements
      for (const elem of scrollableElements) {
        elem.style.overflow = "auto";
      }
    } else {
      // Standard scroll lock with edge case handling
      const dvhSupported = getIsDvhSupported();
      const isInsetScroll = getIsInsetScroll(targetElement);

      Object.assign(targetElement.style, {
        overflow: "hidden",
        ...(scrollbarWidth > 0 && {
          paddingRight: `${scrollbarWidth}px`,
          // Prevent content shift in Firefox
          ...(firefox &&
            !isInsetScroll && {
              marginRight: `${scrollbarWidth}px`,
            }),
        }),
        ...(scrollbarHeight > 0 && {
          paddingBottom: `${scrollbarHeight}px`,
        }),
        // Use dvh if supported for better mobile handling
        ...(dvhSupported && {
          height: "100dvh",
        }),
      });

      // Prevent document scrolling
      Object.assign(documentElement.style, {
        overflow: "hidden",
        // Prevent iOS momentum scrolling
        overscrollBehavior: "none",
      });
    }

    // Handle touch events for iOS momentum scrolling
    function preventDefault(event: TouchEvent) {
      if (event.touches.length > 1) return; // Allow pinch-zoom
      event.preventDefault();
    }

    // Only add touch handlers for iOS
    if (ios) {
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
    }

    // Cleanup function
    return () => {
      preventScrollCount--;
      if (preventScrollCount !== 0) return;

      // Restore original styles
      Object.assign(targetElement.style, originalStylesRef.current);
      Object.assign(documentElement.style, {
        overflow: "",
        overscrollBehavior: "",
      });

      if (ios) {
        document.removeEventListener("touchmove", preventDefault);
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [enabled, referenceElement, allowPinchZoom]);
}

export { useScrollLock };
