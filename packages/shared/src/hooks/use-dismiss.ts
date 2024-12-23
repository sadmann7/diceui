import {
  DATA_DISMISSABLE_LAYER_ATTR,
  DATA_DISMISSABLE_LAYER_STYLE_ATTR,
  getOwnerDocument,
} from "@diceui/shared";
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
   * Event handler called when the a `pointerdown` event happens outside of the dismissable layer.
   * Can be prevented.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;

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

  /**
   * Attribute to add to the dismissable layer
   * @default DATA_DISMISSABLE_LAYER_ATTR
   */
  layerAttr?: string;

  /**
   * Attribute to add to the dismissable layer style
   * @default DATA_DISMISSABLE_LAYER_STYLE_ATTR
   */
  layerStyleAttr?: string;
}

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
    layerAttr = DATA_DISMISSABLE_LAYER_ATTR,
    layerStyleAttr = DATA_DISMISSABLE_LAYER_STYLE_ATTR,
  } = params;

  const shouldTriggerEvents = React.useRef(true);

  React.useEffect(() => {
    if (!open) return;

    const doc = getOwnerDocument(refs[0]?.current) ?? document;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (onEscapeKeyDown) {
          onEscapeKeyDown(event);
          if (event.defaultPrevented) return;
        }
        onInteractOutside?.({
          currentTarget: event.currentTarget as Node,
          target: event.target as Node,
          preventDefault: () => event.preventDefault(),
          defaultPrevented: event.defaultPrevented,
        });
        if (!event.defaultPrevented) {
          onDismiss(event);
        }
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;

      const missingElement = refs.some((ref) => !ref.current);
      if (missingElement) return;

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

        if (!event.defaultPrevented && !outsideEvent.defaultPrevented) {
          onDismiss(event);
        }
      }
    }

    function onFocusOut(event: FocusEvent) {
      const target = event.target as Element | null;

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

        if (!event.defaultPrevented && !outsideEvent.defaultPrevented) {
          onDismiss(event);
        }
      }
    }

    if (disableOutsidePointerEvents) {
      const elements = refs.map((ref) => ref.current).filter(Boolean);
      for (const el of elements) {
        if (el) {
          el.setAttribute(layerAttr, "");
        }
      }

      const style = doc.createElement("style");
      style.setAttribute(layerStyleAttr, "");
      style.textContent = `[${layerAttr}] ~ *:not([${layerAttr}]) { pointer-events: none !important; }`;
      doc.head.appendChild(style);
    }

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

      if (disableOutsidePointerEvents) {
        for (const ref of refs) {
          if (ref.current) {
            ref.current.removeAttribute(layerAttr);
          }
        }
        doc.querySelector(`[${layerStyleAttr}]`)?.remove();
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
    layerAttr,
    layerStyleAttr,
  ]);
}

export { useDismiss };

export type { FocusOutsideEvent, PointerDownOutsideEvent };
