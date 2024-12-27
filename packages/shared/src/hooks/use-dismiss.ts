import * as React from "react";
import {
  DATA_DISMISSABLE_LAYER_ATTR,
  DATA_DISMISSABLE_LAYER_STYLE_ATTR,
} from "../constants";
import { getOwnerDocument } from "../lib/dock";

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
  /** Whether the dismissable layer is enabled. */
  enabled: boolean;

  /** Callback to handle closing/dismissing the element, */
  onDismiss: (event?: Event) => void | Promise<void>;

  /** References to elements that should not trigger dismissal when clicked. */
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
   * When `true`, prevents the dismissible layer from closing when scrolling on mobile devices.
   * @default false
   */
  preventScrollDismiss?: boolean;

  /**
   * Delay in ms before adding the mouseup listener.
   * @default 0
   */
  delayMs?: number;

  /**
   * Attribute to add to the dismissable layer.
   * @default DATA_DISMISSABLE_LAYER_ATTR
   */
  layerAttr?: string;

  /**
   * Attribute to add to the dismissable layer style.
   * @default DATA_DISMISSABLE_LAYER_STYLE_ATTR
   */
  layerStyleAttr?: string;
}

function useDismiss(params: UseDismissParameters) {
  const {
    enabled,
    onDismiss,
    refs,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    disableOutsidePointerEvents = false,
    preventScrollDismiss = false,
    delayMs = 0,
    layerAttr = DATA_DISMISSABLE_LAYER_ATTR,
    layerStyleAttr = DATA_DISMISSABLE_LAYER_STYLE_ATTR,
  } = params;

  const shouldTriggerEvents = React.useRef(true);
  const touchStartY = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

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

    function onDismissWithTarget(event: Event, target: Element | null) {
      const missingElement = refs.some((ref) => !ref.current);
      if (missingElement) return;

      const clickedInside = refs.some((ref) => ref.current?.contains(target));

      if (!clickedInside && shouldTriggerEvents.current) {
        const outsideEvent: PointerDownOutsideEvent = {
          currentTarget: event.currentTarget as Node,
          target: target as Node,
          preventDefault: () => event.preventDefault(),
          defaultPrevented: event.defaultPrevented,
          detail: (event as PointerEvent).detail,
        };

        onPointerDownOutside?.(outsideEvent);
        onInteractOutside?.(outsideEvent);

        if (!event.defaultPrevented && !outsideEvent.defaultPrevented) {
          onDismiss(event);
        }
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;

      if (preventScrollDismiss && event.pointerType === "touch") {
        touchStartY.current = event.clientY;
        return;
      }

      if (event.pointerType !== "touch") {
        onDismissWithTarget(event, target);
      }
    }

    function onPointerUp(event: PointerEvent) {
      const target = event.target as Element | null;

      if (
        preventScrollDismiss &&
        event.pointerType === "touch" &&
        touchStartY.current !== null
      ) {
        const deltaY = Math.abs(event.clientY - touchStartY.current);
        touchStartY.current = null;

        if (deltaY <= 5) {
          onDismissWithTarget(event, target);
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
          onDismissWithTarget(event, target);
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
      doc.addEventListener("pointerup", onPointerUp);
      doc.addEventListener("focusout", onFocusOut);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      doc.removeEventListener("keydown", onKeyDown);
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("pointerup", onPointerUp);
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
    enabled,
    refs,
    onDismiss,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    disableOutsidePointerEvents,
    preventScrollDismiss,
    delayMs,
    layerAttr,
    layerStyleAttr,
  ]);
}

export { useDismiss };

export type { FocusOutsideEvent, PointerDownOutsideEvent };
