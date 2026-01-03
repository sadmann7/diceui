import * as React from "react";
import { isFirefox, isIOS, isSafari } from "../lib/browser";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

// HTML input types that do not cause the software keyboard to appear
const nonTextInputTypes = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);

function getCanOpenKeyboard(target: Element) {
  return (
    (target instanceof HTMLInputElement &&
      !nonTextInputTypes.has(target.type)) ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function isNodeScrollable(node: Element | null): boolean {
  if (!node) return false;

  const style = window.getComputedStyle(node);
  const hasScrollStyle = /(auto|scroll)/.test(
    style.overflow + style.overflowX + style.overflowY
  );

  return (
    hasScrollStyle &&
    (node.scrollHeight !== node.clientHeight ||
      node.scrollWidth !== node.clientWidth)
  );
}

function scrollIntoView(target: Element) {
  const root = document.scrollingElement || document.documentElement;
  let currentNode: Element | null = target;

  while (currentNode && currentNode !== root) {
    // Skip non-scrollable nodes
    while (currentNode && !isNodeScrollable(currentNode)) {
      currentNode = currentNode.parentElement;
    }

    // No more scrollable parents found
    if (!currentNode || currentNode === root) break;

    const { top: scrollableTop } = currentNode.getBoundingClientRect();
    const { top: targetTop } = target.getBoundingClientRect();

    // Only scroll if target is below the visible area
    if (targetTop > scrollableTop + target.clientHeight) {
      currentNode.scrollTop += targetTop - scrollableTop;
    }

    currentNode = currentNode.parentElement;
  }
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
  /** The element to lock the scroll of. */
  referenceElement?: HTMLElement | null;

  /**
   * Whether to lock the scroll.
   * @default false
   */
  enabled?: boolean;

  /**
   * Whether to allow pinch zoom in Safari.
   * @default window.visualViewport?.scale !== 1
   */
  allowPinchZoom?: boolean;
}

let preventScrollCount = 0;
let originalStyle: {
  htmlOverflowY?: string;
  htmlOverflowX?: string;
  bodyOverflow?: string;
  bodyPosition?: string;
  bodyWidth?: string;
  bodyHeight?: string;
  bodyBoxSizing?: string;
} = {};

function useScrollLock({
  referenceElement,
  enabled = false,
  allowPinchZoom = false,
}: ScrollLockOptions = {}) {
  const scrollPositionRef = React.useRef({ top: 0, left: 0 });
  const resizeRef = React.useRef(-1);
  const scrollableRef = React.useRef<Element | null>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;

    const doc = referenceElement?.ownerDocument ?? globalThis.document;
    const win = doc.defaultView ?? globalThis.window;
    const html = doc.documentElement;
    const body = doc.body;

    const shouldAllowPinchZoom =
      allowPinchZoom ?? win.visualViewport?.scale !== 1;

    // Don't lock if pinch-zoom is active in Safari
    if (isSafari() && !shouldAllowPinchZoom) {
      return;
    }

    preventScrollCount++;
    if (preventScrollCount !== 1) return;

    // Store scroll position
    scrollPositionRef.current = {
      top: win.scrollY,
      left: win.scrollX,
    };

    // Get computed styles
    const htmlStyle = win.getComputedStyle(html);
    const bodyStyle = win.getComputedStyle(body);

    // Store original styles
    originalStyle = {
      htmlOverflowY: html.style.overflowY,
      htmlOverflowX: html.style.overflowX,
      bodyPosition: body.style.position,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
      bodyBoxSizing: body.style.boxSizing,
    };

    const scrollbarWidth = Math.max(
      0,
      win.innerWidth - doc.documentElement.clientWidth
    );
    const scrollbarHeight = Math.max(
      0,
      win.innerHeight - doc.documentElement.clientHeight
    );
    const dvhSupported = getIsDvhSupported();
    const isInsetScroll = getIsInsetScroll(referenceElement);

    function onScrollLock() {
      // Handle scrollbar-gutter in modern browsers
      const isScrollbarGutterStable =
        htmlStyle.scrollbarGutter?.includes("stable");
      const isScrollableY = html.scrollHeight > html.clientHeight;
      const isScrollableX = html.scrollWidth > html.clientWidth;
      const isOverflowYScroll =
        htmlStyle.overflowY === "scroll" || bodyStyle.overflowY === "scroll";
      const isOverflowXScroll =
        htmlStyle.overflowX === "scroll" || bodyStyle.overflowX === "scroll";

      // Calculate margins to prevent content shift
      const marginY =
        Number.parseFloat(bodyStyle.marginTop) +
        Number.parseFloat(bodyStyle.marginBottom);
      const marginX =
        Number.parseFloat(bodyStyle.marginLeft) +
        Number.parseFloat(bodyStyle.marginRight);

      if (isIOS()) {
        const topValue = scrollPositionRef.current.top;
        const leftValue = scrollPositionRef.current.left;
        const widthValue =
          marginX || scrollbarWidth
            ? `calc(100vw - ${marginX + scrollbarWidth}px)`
            : "100vw";
        const heightValue =
          marginY || scrollbarHeight
            ? `calc(100vh - ${marginY + scrollbarHeight}px)`
            : "100vh";

        body.style.position = "fixed";
        body.style.width = widthValue;
        body.style.height = heightValue;
        body.style.overflow = "hidden";
        body.style.boxSizing = "border-box";

        // Store the scroll position values for restoration
        body.setAttribute("data-scroll-lock-top", String(topValue));
        body.setAttribute("data-scroll-lock-left", String(leftValue));

        // Set top and left - try to apply even if JSDOM doesn't reflect them
        body.style.top = `-${topValue}px`;
        body.style.left = `-${leftValue}px`;

        // Enhanced iOS Safari handling
        function onTouchStart(event: TouchEvent) {
          const target = event.target as Element;
          let currentNode: Element | null = target;

          // Find the first scrollable parent
          while (currentNode && currentNode !== html) {
            if (
              isNodeScrollable(currentNode) &&
              currentNode instanceof HTMLElement
            ) {
              scrollableRef.current = currentNode;
              const style = win.getComputedStyle(currentNode);
              if (style.overscrollBehavior === "auto") {
                currentNode.style.overscrollBehavior = "contain";
              }
              break;
            }
            currentNode = currentNode.parentElement;
          }

          if (!currentNode || currentNode === html) {
            scrollableRef.current = null;
          }
        }

        function onTouchMove(event: TouchEvent) {
          const scrollable = scrollableRef.current;
          if (!scrollable || scrollable === html || scrollable === body) {
            event.preventDefault();
            return;
          }

          if (
            scrollable.scrollHeight === scrollable.clientHeight &&
            scrollable.scrollWidth === scrollable.clientWidth
          ) {
            event.preventDefault();
          }
        }

        function onFocus(event: FocusEvent) {
          const target = event.target as HTMLElement;
          if (getCanOpenKeyboard(target)) {
            // Move the target out of the viewport for Safari
            target.style.transform = "translateY(-2000px)";
            requestAnimationFrame(() => {
              target.style.transform = "";

              if (!win.visualViewport) return;

              if (win.visualViewport.height < win.innerHeight) {
                requestAnimationFrame(() => scrollIntoView(target));
                return;
              }

              win.visualViewport.addEventListener(
                "resize",
                () => scrollIntoView(target),
                { once: true }
              );
            });
          }
        }

        doc.addEventListener("touchstart", onTouchStart, {
          passive: false,
          capture: true,
        });
        doc.addEventListener("touchmove", onTouchMove, {
          passive: false,
          capture: true,
        });
        doc.addEventListener("focus", onFocus, true);

        cleanupRef.current = () => {
          doc.removeEventListener("touchstart", onTouchStart, {
            capture: true,
          });
          doc.removeEventListener("touchmove", onTouchMove, {
            capture: true,
          });
          doc.removeEventListener("focus", onFocus, true);
        };
      } else {
        // Standard scroll lock
        Object.assign(html.style, {
          overflowY:
            !isScrollbarGutterStable && (isScrollableY || isOverflowYScroll)
              ? "scroll"
              : "hidden",
          overflowX:
            !isScrollbarGutterStable && (isScrollableX || isOverflowXScroll)
              ? "scroll"
              : "hidden",
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

        // Firefox without inset scrollbars
        if (isFirefox() && !isInsetScroll) {
          body.style.marginRight = `${scrollbarWidth}px`;
        }

        // Restore scroll position
        body.scrollTop = scrollPositionRef.current.top;
        body.scrollLeft = scrollPositionRef.current.left;

        html.setAttribute("data-scroll-locked", "");
      }
    }

    function onScrollUnlock() {
      Object.assign(html.style, {
        overflowY: originalStyle.htmlOverflowY,
        overflowX: originalStyle.htmlOverflowX,
        paddingRight: "",
      });

      Object.assign(body.style, {
        overflow: originalStyle.bodyOverflow,
        position: originalStyle.bodyPosition,
        width: originalStyle.bodyWidth,
        height: originalStyle.bodyHeight,
        boxSizing: originalStyle.bodyBoxSizing,
        marginRight: "",
        top: "",
        left: "",
      });

      html.removeAttribute("data-scroll-locked");
      body.removeAttribute("data-scroll-lock-top");
      body.removeAttribute("data-scroll-lock-left");

      // Restore scroll position
      win.scrollTo(
        scrollPositionRef.current.left,
        scrollPositionRef.current.top
      );
    }

    function onResize() {
      cancelAnimationFrame(resizeRef.current);
      resizeRef.current = requestAnimationFrame(() => {
        // Restore and reapply to handle viewport changes
        onScrollUnlock();
        onScrollLock();
      });
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
        cleanupRef.current?.();
      }
    };
  }, [enabled, referenceElement, allowPinchZoom]);
}

export { useScrollLock };
