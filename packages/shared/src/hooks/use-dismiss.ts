import * as React from "react";
import {
  DATA_DISMISSABLE_LAYER_ATTR,
  DATA_DISMISSABLE_LAYER_STYLE_ATTR,
} from "../constants";
import { getOwnerDocument } from "../lib/dock";
import { useEscapeKeydown } from "./use-escape-keydown";

const SCROLL_DISTANCE_THRESHOLD = 5;

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

  /**
   * Callback called when the dismissable layer is dismissed.
   * @param event - The event that triggered the dismissal.
   */
  onDismiss: (event?: Event) => void | Promise<void>;

  /** References to elements that should not trigger dismissal when clicked. */
  refs: Array<React.RefObject<Element | null>>;

  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   *
   * @param event - The event that triggered the escape key down.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Event handler called when the focus moves outside of the dismissable layer.
   * Can be prevented.
   *
   * @param event - The event that triggered the focus move outside.
   */
  onFocusOutside?: (event: FocusOutsideEvent) => void;

  /**
   * Event handler called when an interaction happens outside the dismissable layer.
   * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
   * Can be prevented.
   *
   * @param event - The event that triggered the interaction outside.
   */
  onInteractOutside?: (
    event: PointerDownOutsideEvent | FocusOutsideEvent,
  ) => void;

  /**
   * Event handler called when the a `pointerdown` event happens outside of the dismissable layer.
   * Can be prevented.
   *
   * @param event - The event that triggered the interaction outside.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;

  /**
   * Whether to disable hover/focus/click interactions on elements outside the dismissable layer.
   * Outside elements need to be clicked twice to interact with them: once to close the
   * dismissable layer, and again to trigger the element.
   */
  disableOutsidePointerEvents?: boolean;

  /**
   * Whether to prevent the dismissible layer from closing when scrolling on touch devices.
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

  const ownerDocument = getOwnerDocument(refs[0]?.current) ?? document;
  const shouldTriggerEvents = React.useRef(true);
  const touchStartY = React.useRef<number | null>(null);

  useEscapeKeydown({
    ownerDocument,
    onEscapeKeyDown: (event) => {
      if (onEscapeKeyDown && !event.defaultPrevented) {
        onEscapeKeyDown(event);
      }
    },
    enabled: enabled && !!onEscapeKeyDown && !!onDismiss,
  });

  React.useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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

        if (deltaY <= SCROLL_DISTANCE_THRESHOLD) {
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

      const style = ownerDocument.createElement("style");
      style.setAttribute(layerStyleAttr, "");
      style.textContent = `[${layerAttr}] ~ *:not([${layerAttr}]) { pointer-events: none !important; }`;
      ownerDocument.head.appendChild(style);
    }

    const timeoutId = window.setTimeout(() => {
      ownerDocument.addEventListener("keydown", onKeyDown);
      ownerDocument.addEventListener("pointerdown", onPointerDown);
      ownerDocument.addEventListener("pointerup", onPointerUp);
      ownerDocument.addEventListener("focusout", onFocusOut);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      ownerDocument.removeEventListener("keydown", onKeyDown);
      ownerDocument.removeEventListener("pointerdown", onPointerDown);
      ownerDocument.removeEventListener("pointerup", onPointerUp);
      ownerDocument.removeEventListener("focusout", onFocusOut);

      if (disableOutsidePointerEvents) {
        for (const ref of refs) {
          if (ref.current) {
            ref.current.removeAttribute(layerAttr);
          }
        }
        ownerDocument.querySelector(`[${layerStyleAttr}]`)?.remove();
      }
    };
  }, [
    enabled,
    refs,
    onDismiss,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    disableOutsidePointerEvents,
    preventScrollDismiss,
    delayMs,
    layerAttr,
    layerStyleAttr,
    ownerDocument,
  ]);
}

export { useDismiss };

export type { FocusOutsideEvent, PointerDownOutsideEvent };
