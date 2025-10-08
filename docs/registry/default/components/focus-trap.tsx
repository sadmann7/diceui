"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { useComposedRefs } from "@/lib/compose-refs";

const AUTOFOCUS_ON_MOUNT = "focusTrap.autoFocusOnMount";
const AUTOFOCUS_ON_UNMOUNT = "focusTrap.autoFocusOnUnmount";
const EVENT_OPTIONS = { bubbles: false, cancelable: true } as const;

type FocusableTarget = HTMLElement | { focus(): void };

interface FocusTrapRefProps {
  paused: boolean;
  pause(): void;
  resume(): void;
}

function getReturnFocusNode(
  setReturnFocus: FocusTrapProps["setReturnFocus"],
  previouslyFocusedElement: HTMLElement | null,
): HTMLElement | null {
  if (!setReturnFocus) return previouslyFocusedElement;

  if (typeof setReturnFocus === "function") {
    return setReturnFocus();
  }

  return setReturnFocus;
}

function focusFirst(
  candidates: HTMLElement[],
  { preventScroll = false }: { preventScroll?: boolean } = {},
) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { preventScroll });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}

function getTabbableEdges(container: HTMLElement) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last] as const;
}

function getTabbableCandidates(container: HTMLElement): HTMLElement[] {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: Node) => {
      const element = node as HTMLElement;

      // Skip hidden inputs
      if (
        element.tagName === "INPUT" &&
        element.getAttribute("type") === "hidden"
      ) {
        return NodeFilter.FILTER_SKIP;
      }

      // Skip disabled or hidden elements
      if (
        element.hasAttribute("disabled") ||
        element.hasAttribute("hidden") ||
        element.getAttribute("aria-hidden") === "true"
      ) {
        return NodeFilter.FILTER_SKIP;
      }

      // `.tabIndex` works on the runtime's understanding of tabbability,
      // so this automatically accounts for any kind of element that could be tabbed to.
      return element.tabIndex >= 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  while (walker.nextNode()) {
    nodes.push(walker.currentNode as HTMLElement);
  }

  // We do not take into account the order of nodes with positive `tabIndex` as it
  // hinders accessibility to have tab order different from visual order.
  return nodes;
}

function findVisible(elements: HTMLElement[], container: HTMLElement) {
  for (const element of elements) {
    // We stop checking if it's hidden at the `container` level (excluding)
    if (!isHidden(element, { upTo: container })) return element;
  }
  return undefined;
}

function isHidden(
  node: HTMLElement,
  { upTo }: { upTo?: HTMLElement },
): boolean {
  if (getComputedStyle(node).visibility === "hidden") return true;

  let currentNode: HTMLElement | null = node;
  while (currentNode) {
    // We stop at `upTo` (excluding it)
    if (upTo !== undefined && currentNode === upTo) return false;
    if (getComputedStyle(currentNode).display === "none") return true;
    currentNode = currentNode.parentElement;
  }

  return false;
}

function isSelectableInput(
  element: unknown,
): element is FocusableTarget & { select: () => void } {
  return element instanceof HTMLInputElement && "select" in element;
}

/**
 * Focuses an element with additional options.
 */
function focus(
  element?: FocusableTarget | null,
  { preventScroll = false }: { preventScroll?: boolean } = {},
) {
  // Only focus if that element is focusable
  if (element?.focus) {
    const previouslyFocusedElement = document.activeElement;
    // NOTE: we prevent scrolling on focus, to minimize jarring transitions for users
    element.focus({ preventScroll });
    // Only select if its not the same element, it supports selection
    if (element !== previouslyFocusedElement && isSelectableInput(element)) {
      element.select();
    }
  }
}

/**
 * Removes anchor tags from a list of elements.
 */
function removeAnchors(items: HTMLElement[]): HTMLElement[] {
  return items.filter((item) => item.tagName !== "A");
}

const focusTrapStack = createFocusTrapStack();

function createFocusTrapStack() {
  /** A stack of focus traps, with the active one at the top */
  let stack: FocusTrapRefProps[] = [];

  return {
    add(focusTrap: FocusTrapRefProps) {
      // Pause the currently active focus trap (at the top of the stack)
      const activeFocusTrap = stack[0];
      if (focusTrap !== activeFocusTrap) {
        activeFocusTrap?.pause();
      }
      // Remove in case it already exists (because we'll re-add it at the top of the stack)
      stack = arrayRemove(stack, focusTrap);
      stack.unshift(focusTrap);
    },

    remove(focusTrap: FocusTrapRefProps) {
      stack = arrayRemove(stack, focusTrap);
      stack[0]?.resume();
    },
  };
}

function arrayRemove<T>(array: T[], item: T): T[] {
  const updatedArray = [...array];
  const index = updatedArray.indexOf(item);
  if (index !== -1) {
    updatedArray.splice(index, 1);
  }
  return updatedArray;
}

export interface FocusTrapProps extends React.ComponentProps<typeof Slot> {
  loop?: boolean;
  trapped?: boolean;
  active?: boolean;
  paused?: boolean;
  onMountAutoFocus?: (event: Event) => void;
  onUnmountAutoFocus?: (event: Event) => void;
  returnFocusOnDeactivate?: boolean;
  setReturnFocus?: HTMLElement | (() => HTMLElement | null);
  preventScroll?: boolean;
  initialFocus?: boolean;
  clickOutsideDeactivates?: boolean | ((event: MouseEvent) => boolean);
  excludeAnchors?: boolean;
}

export function FocusTrap(props: FocusTrapProps) {
  const {
    loop = false,
    trapped = false,
    active = true,
    paused = false,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    returnFocusOnDeactivate = true,
    setReturnFocus,
    preventScroll = true,
    initialFocus = true,
    clickOutsideDeactivates = false,
    excludeAnchors = true,
    ref,
    children,
    ...scopeProps
  } = props;

  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
  const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
  const lastFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const composedRefs = useComposedRefs(ref, (node) => setContainer(node));

  const focusTrapRef = React.useRef<FocusTrapRefProps>({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    },
  }).current;

  // Sync paused state
  React.useEffect(() => {
    if (paused) {
      focusTrapRef.pause();
    } else {
      focusTrapRef.resume();
    }
  }, [paused, focusTrapRef]);

  // Handle trapped focus - prevent focus from leaving the container
  React.useEffect(() => {
    if (!active || !trapped || !container) return;

    function handleFocusIn(event: FocusEvent) {
      if (focusTrapRef.paused || !container) return;
      const target = event.target as HTMLElement | null;
      if (target && container.contains(target)) {
        lastFocusedElementRef.current = target;
      } else {
        focus(lastFocusedElementRef.current, { preventScroll });
      }
    }

    function handleFocusOut(event: FocusEvent) {
      if (focusTrapRef.paused || !container) return;
      const relatedTarget = event.relatedTarget as HTMLElement | null;

      // A `focusout` event with a `null` `relatedTarget` will happen when:
      // 1. The user switches app/tabs/windows/the browser itself loses focus.
      // 2. In Chrome, when the focused element is removed from the DOM.
      // We let the browser handle these cases naturally.
      if (relatedTarget === null) return;

      // If focus moved to an element outside the container, return it back
      if (!container.contains(relatedTarget)) {
        focus(lastFocusedElementRef.current, { preventScroll });
      }
    }

    // When the focused element gets removed from the DOM, browsers move focus
    // back to document.body. In this case, we move focus to the container
    // to keep focus trapped correctly.
    function handleMutations(mutations: MutationRecord[]) {
      const focusedElement = document.activeElement as HTMLElement | null;
      if (focusedElement !== document.body) return;
      for (const mutation of mutations) {
        if (mutation.removedNodes.length > 0) {
          focus(container, { preventScroll });
        }
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    const mutationObserver = new MutationObserver(handleMutations);
    if (container) {
      mutationObserver.observe(container, { childList: true, subtree: true });
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      mutationObserver.disconnect();
    };
  }, [active, trapped, container, focusTrapRef, preventScroll]);

  // Handle click outside deactivation
  React.useEffect(() => {
    if (!active || !container || !clickOutsideDeactivates) return;

    function handlePointerDown(event: PointerEvent) {
      if (!container || focusTrapRef.paused) return;
      const target = event.target as HTMLElement;

      const shouldDeactivate =
        typeof clickOutsideDeactivates === "function"
          ? clickOutsideDeactivates(event as unknown as MouseEvent)
          : clickOutsideDeactivates;

      if (shouldDeactivate && !container.contains(target)) {
        // Return focus to previously focused element
        const returnElement = getReturnFocusNode(
          setReturnFocus,
          previouslyFocusedElementRef.current,
        );
        if (returnElement && returnFocusOnDeactivate) {
          focus(returnElement, { preventScroll });
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [
    active,
    container,
    clickOutsideDeactivates,
    focusTrapRef,
    preventScroll,
    returnFocusOnDeactivate,
    setReturnFocus,
  ]);

  // Handle initial focus and cleanup
  React.useEffect(() => {
    if (!active || !container) return;

    focusTrapStack.add(focusTrapRef);
    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;
    const hasFocusedCandidate = container.contains(
      previouslyFocusedElementRef.current,
    );

    if (!hasFocusedCandidate && initialFocus) {
      const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
      container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
      container.dispatchEvent(mountEvent);

      if (!mountEvent.defaultPrevented) {
        const candidates = getTabbableCandidates(container);
        const filteredCandidates = excludeAnchors
          ? removeAnchors(candidates)
          : candidates;
        focusFirst(filteredCandidates, { preventScroll });

        // If nothing got focused, focus the container itself
        if (document.activeElement === previouslyFocusedElementRef.current) {
          focus(container, { preventScroll });
        }
      }
    }

    return () => {
      container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);

      // We need to delay the focus restoration to work around a React bug
      // See: https://github.com/facebook/react/issues/17894
      setTimeout(() => {
        const unmountEvent = new CustomEvent(
          AUTOFOCUS_ON_UNMOUNT,
          EVENT_OPTIONS,
        );
        container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
        container.dispatchEvent(unmountEvent);

        if (!unmountEvent.defaultPrevented && returnFocusOnDeactivate) {
          const returnElement = getReturnFocusNode(
            setReturnFocus,
            previouslyFocusedElementRef.current,
          );
          focus(returnElement ?? document.body, { preventScroll });
        }

        container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
        focusTrapStack.remove(focusTrapRef);
      }, 0);
    };
  }, [
    active,
    container,
    excludeAnchors,
    focusTrapRef,
    initialFocus,
    onMountAutoFocus,
    onUnmountAutoFocus,
    preventScroll,
    returnFocusOnDeactivate,
    setReturnFocus,
  ]);

  // Handle keyboard navigation (Tab key looping)
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!active || (!loop && !trapped)) return;
      if (focusTrapRef.paused) return;

      const isTabKey =
        event.key === "Tab" &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey;
      const focusedElement = document.activeElement as HTMLElement | null;

      if (isTabKey && focusedElement && container) {
        const [first, last] = getTabbableEdges(container);
        const hasTabbableElementsInside = first && last;

        // We can only wrap focus if we have tabbable edges
        if (!hasTabbableElementsInside) {
          if (focusedElement === container) {
            event.preventDefault();
          }
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop) focus(first, { preventScroll });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop) focus(last, { preventScroll });
          }
        }
      }
    },
    [active, loop, trapped, focusTrapRef, container, preventScroll],
  );

  if (!active) {
    return React.isValidElement(children) ? children : children || null;
  }

  return (
    <Slot {...scopeProps} ref={composedRefs} onKeyDown={onKeyDown}>
      {children}
    </Slot>
  );
}
