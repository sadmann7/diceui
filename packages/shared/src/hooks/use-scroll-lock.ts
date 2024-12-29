import * as React from "react";
import { isFirefox, isIOS, isSafari } from "../lib/browser";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

let preventScrollCount = 0;
let originalStyles: Record<string, string> = {};

function getScrollbarWidth() {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

function getIsDvhSupported() {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("height", "1dvh")
  );
}

function getIsInsetScroll(referenceElement?: Element | null) {
  if (typeof document === "undefined") return false;
  const doc = referenceElement?.ownerDocument ?? document;
  const win = doc.defaultView ?? window;
  return win.innerWidth - doc.documentElement.clientWidth > 0;
}

interface ScrollLockOptions {
  referenceElement?: HTMLElement | null;
  enabled?: boolean;
  allowPinchZoom?: boolean;
}

function useScrollLock({
  referenceElement,
  enabled = false,
  allowPinchZoom = false,
}: ScrollLockOptions = {}) {
  const scrollPositionRef = React.useRef(0);
  const resizeRef = React.useRef(-1);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;

    const doc = referenceElement?.ownerDocument ?? document;
    const win = doc.defaultView ?? window;
    const html = doc.documentElement;
    const body = doc.body;

    // Don't lock if pinch-zoom is active in Safari
    if (
      isSafari() &&
      !allowPinchZoom &&
      (win.visualViewport?.scale ?? 1) !== 1
    ) {
      return;
    }

    preventScrollCount++;
    if (preventScrollCount !== 1) return;

    // Store scroll position
    scrollPositionRef.current = win.scrollY;

    // Get computed styles
    const htmlStyles = win.getComputedStyle(html);
    const bodyStyles = win.getComputedStyle(body);

    // Store original styles
    originalStyles = {
      htmlOverflowY: html.style.overflowY,
      htmlOverflowX: html.style.overflowX,
      bodyPosition: body.style.position,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
      bodyBoxSizing: body.style.boxSizing,
    };

    const scrollbarWidth = getScrollbarWidth();
    const dvhSupported = getIsDvhSupported();
    const isInsetScroll = getIsInsetScroll(referenceElement);

    function onScrollLock() {
      // Handle scrollbar-gutter in modern browsers
      const hasScrollbarGutterStable =
        htmlStyles.scrollbarGutter?.includes("stable");
      const isScrollableY = html.scrollHeight > html.clientHeight;
      const isScrollableX = html.scrollWidth > html.clientWidth;

      // Calculate margins to prevent content shift
      const marginY =
        Number.parseFloat(bodyStyles.marginTop) +
        Number.parseFloat(bodyStyles.marginBottom);
      const marginX =
        Number.parseFloat(bodyStyles.marginLeft) +
        Number.parseFloat(bodyStyles.marginRight);

      if (isIOS()) {
        Object.assign(body.style, {
          position: "fixed",
          width: "100%",
          top: `-${scrollPositionRef.current}px`,
          left: "0",
          height: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
        });
      } else {
        // Standard scroll lock
        Object.assign(html.style, {
          overflowY:
            !hasScrollbarGutterStable && isScrollableY ? "scroll" : "hidden",
          overflowX:
            !hasScrollbarGutterStable && isScrollableX ? "scroll" : "hidden",
          paddingRight: scrollbarWidth > 0 ? `${scrollbarWidth}px` : "",
        });

        Object.assign(body.style, {
          position: "relative",
          width:
            marginX || scrollbarWidth
              ? `calc(100vw - ${marginX + scrollbarWidth}px)`
              : "100vw",
          height: dvhSupported
            ? marginY
              ? `calc(100dvh - ${marginY}px)`
              : "100dvh"
            : marginY
              ? `calc(100vh - ${marginY}px)`
              : "100vh",
          boxSizing: "border-box",
          overflow: "hidden",
        });

        // Special handling for Firefox without inset scrollbars
        if (isFirefox() && !isInsetScroll) {
          body.style.marginRight = `${scrollbarWidth}px`;
        }
      }

      html.setAttribute("data-scroll-locked", "");
    }

    function onResize() {
      cancelAnimationFrame(resizeRef.current);
      resizeRef.current = requestAnimationFrame(() => {
        // Restore and reapply to handle viewport changes
        onScrollUnlock();
        onScrollLock();
      });
    }

    function onScrollUnlock() {
      Object.assign(html.style, {
        overflowY: originalStyles.htmlOverflowY,
        overflowX: originalStyles.htmlOverflowX,
        paddingRight: "",
      });

      Object.assign(body.style, {
        position: originalStyles.bodyPosition,
        width: originalStyles.bodyWidth,
        height: originalStyles.bodyHeight,
        overflow: originalStyles.bodyOverflow,
        boxSizing: originalStyles.bodyBoxSizing,
        marginRight: "",
        top: "",
        left: "",
      });

      html.removeAttribute("data-scroll-locked");
    }

    // Handle touch events for iOS momentum scrolling
    function preventDefault(event: TouchEvent) {
      if (event.touches.length > 1) return; // Allow pinch-zoom
      event.preventDefault();
    }

    onScrollLock();
    win.addEventListener("resize", onResize);

    if (isIOS()) {
      doc.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
    }

    return () => {
      preventScrollCount--;
      if (preventScrollCount !== 0) return;

      cancelAnimationFrame(resizeRef.current);
      onScrollUnlock();
      win.removeEventListener("resize", onResize);

      if (isIOS()) {
        doc.removeEventListener("touchmove", preventDefault);
        win.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [enabled, referenceElement, allowPinchZoom]);
}

export { useScrollLock };
