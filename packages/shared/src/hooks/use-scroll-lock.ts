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

function getScrollbarWidth(win: Window = window, doc: Document = document) {
  return Math.max(0, win.innerWidth - doc.documentElement.clientWidth);
}

function getScrollbarHeight(win: Window = window, doc: Document = document) {
  return Math.max(0, win.innerHeight - doc.documentElement.clientHeight);
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
let originalStyles: {
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
  allowPinchZoom = window.visualViewport?.scale !== 1,
}: ScrollLockOptions = {}) {
  const scrollPositionRef = React.useRef(0);
  const resizeRef = React.useRef(-1);
  const scrollableRef = React.useRef<Element | null>(null);

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

    const scrollbarWidth = getScrollbarWidth(win, doc);
    const scrollbarHeight = getScrollbarHeight(win, doc);
    const dvhSupported = getIsDvhSupported();
    const isInsetScroll = getIsInsetScroll(referenceElement);

    function onScrollLock() {
      // Handle scrollbar-gutter in modern browsers
      const isScrollbarGutterStable =
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
          width:
            marginX || scrollbarWidth
              ? `calc(100vw - ${marginX + scrollbarWidth}px)`
              : "100vw",
          height:
            marginY || scrollbarHeight
              ? `calc(100vh - ${marginY + scrollbarHeight}px)`
              : "100vh",
          top: `-${scrollPositionRef.current}px`,
          left: "0",
          overflow: "hidden",
          boxSizing: "border-box",
        });

        // Enhanced iOS Safari handling
        function onTouchStart(e: TouchEvent) {
          const target = e.target as Element;
          const scrollableElement: Element | null =
            target.closest("[data-scrollable]");
          if (scrollableElement instanceof HTMLElement) {
            scrollableRef.current = scrollableElement;
            const style = win.getComputedStyle(scrollableElement);
            if (style.overscrollBehavior === "auto") {
              scrollableElement.style.overscrollBehavior = "contain";
            }
          } else {
            scrollableRef.current = null;
          }
        }

        function onTouchMove(e: TouchEvent) {
          const scrollable = scrollableRef.current;
          if (!scrollable || scrollable === html || scrollable === body) {
            e.preventDefault();
            return;
          }

          if (
            scrollable.scrollHeight === scrollable.clientHeight &&
            scrollable.scrollWidth === scrollable.clientWidth
          ) {
            e.preventDefault();
          }
        }

        function onFocus(e: FocusEvent) {
          const target = e.target as HTMLElement;
          if (getCanOpenKeyboard(target)) {
            target.style.transform = "translateY(-2000px)";
            requestAnimationFrame(() => {
              target.style.transform = "";
              if (win.visualViewport) {
                const scrollIntoView = () => {
                  let nextTarget: Element | null = target;
                  while (nextTarget && nextTarget !== html) {
                    const scrollableElement: Element | null =
                      nextTarget.closest("[data-scrollable]");
                    if (
                      scrollableElement instanceof HTMLElement &&
                      scrollableElement !== html &&
                      scrollableElement !== body
                    ) {
                      const scrollableTop =
                        scrollableElement.getBoundingClientRect().top;
                      const targetTop = nextTarget.getBoundingClientRect().top;
                      if (
                        targetTop >
                        scrollableTop + scrollableElement.clientHeight
                      ) {
                        scrollableElement.scrollTop +=
                          targetTop - scrollableTop;
                      }
                      nextTarget = scrollableElement.parentElement;
                    } else {
                      nextTarget = null;
                    }
                  }
                };

                if (win.visualViewport.height < win.innerHeight) {
                  requestAnimationFrame(scrollIntoView);
                } else {
                  win.visualViewport.addEventListener(
                    "resize",
                    () => scrollIntoView(),
                    { once: true }
                  );
                }
              }
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

        return () => {
          doc.removeEventListener("touchstart", onTouchStart, {
            capture: true,
          });
          doc.removeEventListener("touchmove", onTouchMove, {
            capture: true,
          });
          doc.removeEventListener("focus", onFocus, true);
        };
      }

      // Standard scroll lock
      Object.assign(html.style, {
        overflowY:
          !isScrollbarGutterStable && isScrollableY ? "scroll" : "hidden",
        overflowX:
          !isScrollbarGutterStable && isScrollableX ? "scroll" : "hidden",
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
        overflow: originalStyles.bodyOverflow,
        position: originalStyles.bodyPosition,
        width: originalStyles.bodyWidth,
        height: originalStyles.bodyHeight,
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
