import * as React from "react";

interface FocusOutsideEvent {
  currentTarget: Node;
  target: Node;
  preventDefault: () => void;
  defaultPrevented: boolean;
}

interface PointerDownOutsideEvent extends FocusOutsideEvent {
  detail: number;
}

interface UseDismissParameters {
  /** Whether the element is currently open/mounted */
  open: boolean;

  /** Callback to handle closing/dismissing the element */
  onDismiss: (event?: Event) => void | Promise<void>;

  /** References to elements that should not trigger dismissal when clicked */
  refs: Array<React.RefObject<Element | null>>;

  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Event handler called when the a `pointerdown` event happens outside of the dismissable layer.
   * Can be prevented.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;

  /**
   * Event handler called when the focus moves outside of the dismissable layer.
   * Can be prevented.
   */
  onFocusOutside?: (event: FocusOutsideEvent) => void;

  /**
   * Event handler called when an interaction happens outside the dismissable layer.
   * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
   * Can be prevented.
   */
  onInteractOutside?: (
    event: PointerDownOutsideEvent | FocusOutsideEvent,
  ) => void;

  /**
   * When `true`, hover/focus/click interactions will be disabled on elements outside
   * the dismissable layer. Users will need to click twice on outside elements to
   * interact with them: once to close the dismissable layer, and again to trigger the element.
   */
  disableOutsidePointerEvents?: boolean;

  /**
   * Delay in ms before adding the mouseup listener
   * @default 0
   */
  delay?: number;
}

/**
 * Hook for handling dismissal of elements (like popups, modals) when clicking outside
 */
function useDismiss(params: UseDismissParameters) {
  const {
    open,
    onDismiss,
    refs,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    disableOutsidePointerEvents = false,
    delay = 0,
  } = params;

  // Track whether we should trigger events
  const shouldTriggerEvents = React.useRef(true);

  React.useEffect(() => {
    if (!open) return undefined;

    const doc = refs[0]?.current?.ownerDocument || document;

    // Handle escape key
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (onEscapeKeyDown) {
          onEscapeKeyDown(event);
          if (event.defaultPrevented) return;
        }
        onDismiss(event);
      }
    }

    // Handle pointer down outside
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;

      // Check if any ref is missing its element
      const missingElement = refs.some((ref) => !ref.current);
      if (missingElement) return;

      // Check if click was inside any of the refs
      const clickedInside = refs.some((ref) => ref.current?.contains(target));

      if (!clickedInside && shouldTriggerEvents.current) {
        const outsideEvent: PointerDownOutsideEvent = {
          currentTarget: event.currentTarget as Node,
          target: target as Node,
          preventDefault: () => event.preventDefault(),
          defaultPrevented: event.defaultPrevented,
          detail: event.detail,
        };

        onPointerDownOutside?.(outsideEvent);
        onInteractOutside?.(outsideEvent);

        if (!outsideEvent.defaultPrevented) {
          onDismiss(event);
        }
      }
    }

    // Handle focus outside
    function onFocusOut(event: FocusEvent) {
      const target = event.target as Element | null;

      // Check if focus is still within any of our refs
      const focusedInside = refs.some((ref) => ref.current?.contains(target));

      if (!focusedInside && shouldTriggerEvents.current) {
        const outsideEvent: FocusOutsideEvent = {
          currentTarget: event.currentTarget as Node,
          target: target as Node,
          preventDefault: () => event.preventDefault(),
          defaultPrevented: event.defaultPrevented,
        };

        onFocusOutside?.(outsideEvent);
        onInteractOutside?.(outsideEvent);

        if (!outsideEvent.defaultPrevented) {
          onDismiss(event);
        }
      }
    }

    // Handle outside pointer events
    if (disableOutsidePointerEvents) {
      const elements = refs.map((ref) => ref.current).filter(Boolean);
      for (const el of elements) {
        if (el) {
          el.setAttribute("data-dismissable-layer", "");
        }
      }

      const style = doc.createElement("style");
      style.setAttribute("data-dismissable-layer-style", "");
      style.textContent =
        "[data-dismissable-layer] ~ *:not([data-dismissable-layer]) { pointer-events: none !important; }";
      doc.head.appendChild(style);
    }

    // Add event listeners
    const timeoutId = window.setTimeout(() => {
      doc.addEventListener("keydown", onKeyDown);
      doc.addEventListener("pointerdown", onPointerDown);
      doc.addEventListener("focusout", onFocusOut);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      doc.removeEventListener("keydown", onKeyDown);
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("focusout", onFocusOut);

      // Clean up outside pointer events
      if (disableOutsidePointerEvents) {
        for (const ref of refs) {
          if (ref.current) {
            ref.current.removeAttribute("data-dismissable-layer");
          }
        }
        doc.querySelector("[data-dismissable-layer-style]")?.remove();
      }
    };
  }, [
    open,
    refs,
    onDismiss,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    disableOutsidePointerEvents,
    delay,
  ]);
}

export { useDismiss };

export type { UseDismissParameters };
