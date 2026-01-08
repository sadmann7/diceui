"use client";

import {
  autoUpdate,
  flip,
  hide,
  limitShift,
  type Middleware,
  offset,
  type Placement,
  shift,
  size,
  useFloating,
} from "@floating-ui/react-dom";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/default/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/default/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/default/hooks/use-lazy-ref";

const ROOT_NAME = "SelectionToolbar";
const ITEM_NAME = "SelectionToolbarItem";

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;

type Side = (typeof SIDE_OPTIONS)[number];
type Align = (typeof ALIGN_OPTIONS)[number];
type Boundary = Element | null;

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side as Side, align as Align] as const;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

interface SelectionRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface StoreState {
  open: boolean;
  selectedText: string;
  selectionRect: SelectionRect | null;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
  batch: (fn: () => void) => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface ItemData {
  id: string;
  ref: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
}

interface FocusContextValue {
  tabStopId: string | null;
  onItemFocus: (tabStopId: string) => void;
  onItemShiftTab: () => void;
  onFocusableItemAdd: () => void;
  onFocusableItemRemove: () => void;
  onItemRegister: (item: ItemData) => void;
  onItemUnregister: (id: string) => void;
  getItems: () => ItemData[];
}

const FocusContext = React.createContext<FocusContextValue | null>(null);

function useFocusContext(consumerName: string) {
  const context = React.useContext(FocusContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function focusFirst(
  candidates: React.RefObject<HTMLElement | null>[],
  preventScroll = false,
) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) continue;
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>(
    (_, index) => array[(startIndex + index) % array.length] as T,
  );
}

function useStore<T>(
  selector: (state: StoreState) => T,
  ogStore?: Store | null,
): T {
  const contextStore = React.useContext(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface SelectionToolbarProps extends DivProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectionChange?: (text: string) => void;
  container?: HTMLElement | null;
  portalContainer?: Element | DocumentFragment | null;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Boundary | Boundary[];
  collisionPadding?: number | Partial<Record<Side, number>>;
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  updatePositionStrategy?: "optimized" | "always";
}

function SelectionToolbar(props: SelectionToolbarProps) {
  const {
    open: openProp,
    onOpenChange,
    onSelectionChange,
    container: containerProp,
    portalContainer: portalContainerProp,
    side = "top",
    sideOffset = 8,
    align = "center",
    alignOffset = 0,
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding: collisionPaddingProp = 0,
    sticky = "partial",
    hideWhenDetached = false,
    updatePositionStrategy = "optimized",
    className,
    style,
    asChild,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? false,
    selectedText: "",
    selectionRect: null,
  }));

  const propsRef = useAsRef({
    onOpenChange,
    onSelectionChange,
  });

  const store = React.useMemo<Store>(() => {
    let isBatching = false;

    return {
      subscribe: (callback) => {
        listenersRef.current.add(callback);
        return () => listenersRef.current.delete(callback);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "open" && typeof value === "boolean") {
          stateRef.current.open = value;
          propsRef.current.onOpenChange?.(value);
        } else if (key === "selectedText" && typeof value === "string") {
          stateRef.current.selectedText = value;
          propsRef.current.onSelectionChange?.(value);
        } else {
          stateRef.current[key] = value;
        }

        if (!isBatching) {
          store.notify();
        }
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
      batch: (fn: () => void) => {
        if (isBatching) {
          fn();
          return;
        }
        isBatching = true;
        try {
          fn();
        } finally {
          isBatching = false;
          store.notify();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  useIsomorphicLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp]);

  const open = useStore((state) => state.open, store);
  const selectionRect = useStore((state) => state.selectionRect, store);

  // Roving focus management
  const [tabStopId, setTabStopId] = React.useState<string | null>(null);
  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());

  const onItemFocus = React.useCallback((tabStopId: string) => {
    setTabStopId(tabStopId);
  }, []);

  const onItemShiftTab = React.useCallback(() => {
    // Allow tab to exit the toolbar
  }, []);

  const onFocusableItemAdd = React.useCallback(() => {
    // Track focusable items
  }, []);

  const onFocusableItemRemove = React.useCallback(() => {
    // Track focusable items
  }, []);

  const onItemRegister = React.useCallback((item: ItemData) => {
    itemsRef.current.set(item.id, item);
  }, []);

  const onItemUnregister = React.useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const getItems = React.useCallback(() => {
    return Array.from(itemsRef.current.values());
  }, []);

  const focusContext = React.useMemo<FocusContextValue>(
    () => ({
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    }),
    [
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    ],
  );

  // Auto-focus first item when toolbar opens
  React.useEffect(() => {
    if (!open) return;

    // Set first item as tab stop and focus it
    const items = Array.from(itemsRef.current.values()).filter(
      (item) => !item.disabled,
    );
    if (items.length > 0 && items[0]) {
      setTabStopId(items[0].id);
      queueMicrotask(() => {
        items[0]?.ref.current?.focus();
      });
    }
  }, [open]);

  const rafRef = React.useRef<number | null>(null);

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const virtualElement = React.useMemo(() => {
    if (!selectionRect) return null;

    return {
      getBoundingClientRect: () => ({
        x: selectionRect.left,
        y: selectionRect.top,
        width: selectionRect.width,
        height: selectionRect.height,
        top: selectionRect.top,
        left: selectionRect.left,
        right: selectionRect.left + selectionRect.width,
        bottom: selectionRect.top + selectionRect.height,
      }),
    };
  }, [selectionRect]);

  const transformOrigin = React.useMemo<Middleware>(
    () => ({
      name: "transformOrigin",
      fn(data) {
        const { placement, rects } = data;
        const [placedSide, placedAlign] =
          getSideAndAlignFromPlacement(placement);
        const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[
          placedAlign
        ];

        let x = "";
        let y = "";

        if (placedSide === "bottom") {
          x = noArrowAlign;
          y = "0px";
        } else if (placedSide === "top") {
          x = noArrowAlign;
          y = `${rects.floating.height}px`;
        } else if (placedSide === "right") {
          x = "0px";
          y = noArrowAlign;
        } else if (placedSide === "left") {
          x = `${rects.floating.width}px`;
          y = noArrowAlign;
        }
        return { data: { x, y } };
      },
    }),
    [],
  );

  const desiredPlacement = React.useMemo(
    () => (side + (align !== "center" ? `-${align}` : "")) as Placement,
    [side, align],
  );

  const collisionPadding = React.useMemo(
    () =>
      typeof collisionPaddingProp === "number"
        ? collisionPaddingProp
        : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp },
    [collisionPaddingProp],
  );

  const boundary = React.useMemo(
    () =>
      Array.isArray(collisionBoundary)
        ? collisionBoundary
        : [collisionBoundary],
    [collisionBoundary],
  );

  const hasExplicitBoundaries = boundary.length > 0;

  const detectOverflowOptions = React.useMemo(
    () => ({
      padding: collisionPadding,
      boundary: boundary.filter(isNotNull),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: hasExplicitBoundaries,
    }),
    [collisionPadding, boundary, hasExplicitBoundaries],
  );

  const sizeMiddleware = React.useMemo(
    () =>
      size({
        ...detectOverflowOptions,
        apply: ({ elements, rects, availableWidth, availableHeight }) => {
          const { width: anchorWidth, height: anchorHeight } = rects.reference;
          const contentStyle = elements.floating.style;
          contentStyle.setProperty(
            "--selection-toolbar-available-width",
            `${availableWidth}px`,
          );
          contentStyle.setProperty(
            "--selection-toolbar-available-height",
            `${availableHeight}px`,
          );
          contentStyle.setProperty(
            "--selection-toolbar-anchor-width",
            `${anchorWidth}px`,
          );
          contentStyle.setProperty(
            "--selection-toolbar-anchor-height",
            `${anchorHeight}px`,
          );
        },
      }),
    [detectOverflowOptions],
  );

  const middleware = React.useMemo<Array<Middleware | false | undefined>>(
    () => [
      offset({ mainAxis: sideOffset, alignmentAxis: alignOffset }),
      avoidCollisions &&
        shift({
          mainAxis: true,
          crossAxis: false,
          limiter: sticky === "partial" ? limitShift() : undefined,
          ...detectOverflowOptions,
        }),
      avoidCollisions && flip({ ...detectOverflowOptions }),
      sizeMiddleware,
      transformOrigin,
      hideWhenDetached &&
        hide({ strategy: "referenceHidden", ...detectOverflowOptions }),
    ],
    [
      sideOffset,
      alignOffset,
      avoidCollisions,
      sticky,
      detectOverflowOptions,
      sizeMiddleware,
      transformOrigin,
      hideWhenDetached,
    ],
  );

  const { refs, floatingStyles, isPositioned, middlewareData } = useFloating({
    open: open && !!virtualElement,
    placement: desiredPlacement,
    strategy: "fixed",
    middleware,
    whileElementsMounted: (reference, floating, update) => {
      return autoUpdate(reference, floating, update, {
        animationFrame: updatePositionStrategy === "always",
      });
    },
    elements: {
      reference: virtualElement,
    },
  });

  const closeToolbar = React.useCallback(() => {
    const state = store.getState();
    if (state.open || state.selectedText || state.selectionRect) {
      store.batch(() => {
        store.setState("open", false);
        store.setState("selectedText", "");
        store.setState("selectionRect", null);
      });
    }
  }, [store]);

  const updateSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      closeToolbar();
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      closeToolbar();
      return;
    }

    // Check if selection is within container
    if (containerProp) {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      const element =
        commonAncestor.nodeType === Node.ELEMENT_NODE
          ? (commonAncestor as Element)
          : commonAncestor.parentElement;

      if (!element || !containerProp.contains(element)) {
        closeToolbar();
        return;
      }
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check if anything has changed before batching updates
    const state = store.getState();
    const hasChanges =
      state.selectedText !== text ||
      !state.selectionRect ||
      state.selectionRect.top !== rect.top ||
      state.selectionRect.left !== rect.left ||
      state.selectionRect.width !== rect.width ||
      state.selectionRect.height !== rect.height ||
      !state.open;

    if (hasChanges) {
      store.batch(() => {
        store.setState("selectedText", text);
        store.setState("selectionRect", {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        store.setState("open", true);
      });
    }
  }, [containerProp, store, closeToolbar]);

  const scheduleUpdate = React.useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      if (store.getState().open) {
        updateSelection();
      }
      rafRef.current = null;
    });
  }, [store, updateSelection]);

  React.useEffect(() => {
    const container = containerProp ?? document;

    function onMouseUp() {
      // Use RAF to ensure selection is complete
      requestAnimationFrame(() => {
        updateSelection();
      });
    }

    function onSelectionChange() {
      const selection = window.getSelection();
      if (!selection || !selection.toString().trim()) {
        closeToolbar();
      }
    }

    container.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      container.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      // Clean up any pending RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [containerProp, updateSelection, closeToolbar, scheduleUpdate]);

  const clearSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    closeToolbar();
  }, [closeToolbar]);

  React.useEffect(() => {
    if (!open) return;

    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (refs.floating.current && !refs.floating.current.contains(target)) {
        clearSelection();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearSelection();
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, refs.floating, clearSelection]);

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  if (!portalContainer || !open) return null;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <FocusContext.Provider value={focusContext}>
        {ReactDOM.createPortal(
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              // Keep off-page when measuring to prevent janky initial position
              transform: isPositioned
                ? floatingStyles.transform
                : "translate(0, -200%)",
              minWidth: "max-content",
              // Hide the content if using the hide middleware and should be hidden
              // Set visibility to hidden and disable pointer events so the UI behaves
              // as if the SelectionToolbar isn't there at all
              ...(middlewareData.hide?.referenceHidden && {
                visibility: "hidden",
                pointerEvents: "none",
              }),
            }}
            data-state={isPositioned ? "positioned" : "measuring"}
          >
            <RootPrimitive
              role="toolbar"
              aria-label="Text formatting toolbar"
              data-slot="selection-toolbar"
              data-state={open ? "open" : "closed"}
              {...rootProps}
              className={cn(
                "flex items-center gap-1 rounded-lg border bg-card px-1.5 py-1.5 shadow-lg outline-none",
                isPositioned &&
                  "fade-in-0 zoom-in-95 animate-in duration-200 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                "motion-reduce:animate-none motion-reduce:transition-none",
                className,
              )}
              style={{
                // Set transform origin based on placement for smooth animations
                transformOrigin: middlewareData.transformOrigin
                  ? `${middlewareData.transformOrigin.x} ${middlewareData.transformOrigin.y}`
                  : undefined,
                // If the SelectionToolbar hasn't been placed yet (not all measurements done)
                // we prevent animations so that users's animation don't kick in too early referring wrong sides
                animation: !isPositioned ? "none" : undefined,
                ...style,
              }}
            />
          </div>,
          portalContainer,
        )}
      </FocusContext.Provider>
    </StoreContext.Provider>
  );
}

interface SelectionToolbarItemProps
  extends Omit<React.ComponentProps<typeof Button>, "onSelect"> {
  onSelect?: (text: string, event: Event) => void;
}

function SelectionToolbarItem(props: SelectionToolbarItemProps) {
  const {
    onSelect: onSelectProp,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onPointerDown: onPointerDownProp,
    onPointerUp: onPointerUpProp,
    className,
    disabled,
    ref,
    ...itemProps
  } = props;

  const store = useStoreContext(ITEM_NAME);
  const focusContext = useFocusContext(ITEM_NAME);

  const itemRef = React.useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const pointerTypeRef =
    React.useRef<React.PointerEvent["pointerType"]>("touch");

  const itemId = React.useId();
  const isTabStop = focusContext.tabStopId === itemId;

  useIsomorphicLayoutEffect(() => {
    focusContext.onItemRegister({
      id: itemId,
      ref: itemRef,
      disabled: !!disabled,
    });

    if (!disabled) {
      focusContext.onFocusableItemAdd();
    }

    return () => {
      focusContext.onItemUnregister(itemId);
      if (!disabled) {
        focusContext.onFocusableItemRemove();
      }
    };
  }, [focusContext, itemId, disabled]);

  const handleSelect = React.useCallback(() => {
    const item = itemRef.current;
    if (!item) return;

    const text = store.getState().selectedText;

    const selectEvent = new CustomEvent("selectiontoolbar.select", {
      bubbles: true,
      cancelable: true,
      detail: { text },
    });

    item.addEventListener(
      "selectiontoolbar.select",
      (event) => onSelectProp?.(text, event),
      {
        once: true,
      },
    );

    item.dispatchEvent(selectEvent);
  }, [onSelectProp, store]);

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      pointerTypeRef.current = event.pointerType;
      onPointerDownProp?.(event);

      // Prevent the button from stealing focus from the contentEditable container
      // when using a mouse. This is crucial for maintaining the focus ring.
      if (event.pointerType === "mouse") {
        event.preventDefault();
      }

      if (!disabled) {
        focusContext.onItemFocus(itemId);
      }
    },
    [onPointerDownProp, focusContext, itemId, disabled],
  );

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      // Handle selection on click when using touch or pen device
      if (pointerTypeRef.current !== "mouse") {
        handleSelect();
      }
    },
    [onClickProp, handleSelect],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      onPointerUpProp?.(event);
      if (event.defaultPrevented) return;

      // Handle selection on pointer up when using a mouse
      if (pointerTypeRef.current === "mouse") {
        handleSelect();
      }
    },
    [onPointerUpProp, handleSelect],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      focusContext.onItemFocus(itemId);
    },
    [onFocusProp, focusContext, itemId],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Tab" && event.shiftKey) {
        focusContext.onItemShiftTab();
        return;
      }

      if (event.target !== event.currentTarget) return;

      let focusIntent: "first" | "last" | "prev" | "next" | undefined;

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        focusIntent = "prev";
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        focusIntent = "next";
      } else if (event.key === "Home") {
        focusIntent = "first";
      } else if (event.key === "End") {
        focusIntent = "last";
      }

      if (focusIntent !== undefined) {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
          return;
        event.preventDefault();

        const items = focusContext.getItems().filter((item) => !item.disabled);
        let candidateRefs = items.map((item) => item.ref);

        if (focusIntent === "last") {
          candidateRefs.reverse();
        } else if (focusIntent === "prev" || focusIntent === "next") {
          if (focusIntent === "prev") candidateRefs.reverse();
          const currentIndex = candidateRefs.findIndex(
            (ref) => ref.current === event.currentTarget,
          );
          candidateRefs = wrapArray(candidateRefs, currentIndex + 1);
        }

        queueMicrotask(() => focusFirst(candidateRefs));
      }
    },
    [onKeyDownProp, focusContext],
  );

  return (
    <Button
      type="button"
      data-slot="selection-toolbar-item"
      variant="ghost"
      size="icon"
      disabled={disabled}
      tabIndex={isTabStop ? 0 : -1}
      {...itemProps}
      className={cn("size-8", className)}
      ref={composedRef}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onPointerUp={onPointerUp}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    />
  );
}

function SelectionToolbarSeparator(props: DivProps) {
  const { asChild, className, ...separatorProps } = props;

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      role="separator"
      aria-orientation="vertical"
      aria-hidden="true"
      data-slot="selection-toolbar-separator"
      {...separatorProps}
      className={cn("mx-0.5 h-6 w-px bg-border", className)}
    />
  );
}

export {
  SelectionToolbar,
  SelectionToolbarItem,
  SelectionToolbarSeparator,
  //
  useStore as useSelectionToolbar,
  //
  type SelectionToolbarProps,
};
