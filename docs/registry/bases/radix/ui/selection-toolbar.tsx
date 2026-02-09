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
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/radix/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/radix/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";

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

type ItemElement = React.ComponentRef<typeof SelectionToolbarItem>;

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
  container?: HTMLElement | React.RefObject<HTMLElement | null> | null;
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

  const getContainer = React.useCallback((): HTMLElement | null => {
    if (containerProp === undefined || containerProp === null) return null;
    if (typeof containerProp === "object" && "current" in containerProp) {
      return containerProp.current;
    }
    return containerProp;
  }, [containerProp]);

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

    if (containerProp !== undefined) {
      const resolvedContainer = getContainer();
      if (!resolvedContainer) return;

      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      const element =
        commonAncestor.nodeType === Node.ELEMENT_NODE
          ? (commonAncestor as Element)
          : commonAncestor.parentElement;

      if (!element || !resolvedContainer.contains(element)) {
        closeToolbar();
        return;
      }
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

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
  }, [containerProp, getContainer, store, closeToolbar]);

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
    const container = getContainer() ?? document;

    function onMouseUp() {
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
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [getContainer, updateSelection, closeToolbar, scheduleUpdate]);

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

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      {ReactDOM.createPortal(
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            transform: isPositioned
              ? floatingStyles.transform
              : "translate(0, -200%)",
            minWidth: "max-content",
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
              transformOrigin: middlewareData.transformOrigin
                ? `${middlewareData.transformOrigin.x} ${middlewareData.transformOrigin.y}`
                : undefined,
              animation: !isPositioned ? "none" : undefined,
              ...style,
            }}
          />
        </div>,
        portalContainer,
      )}
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
    onPointerDown: onPointerDownProp,
    onPointerUp: onPointerUpProp,
    className,
    ref,
    ...itemProps
  } = props;

  const store = useStoreContext(ITEM_NAME);

  const propsRef = useAsRef({
    onSelect: onSelectProp,
    onClick: onClickProp,
    onPointerDown: onPointerDownProp,
    onPointerUp: onPointerUpProp,
  });

  const itemRef = React.useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const pointerTypeRef =
    React.useRef<React.PointerEvent["pointerType"]>("touch");

  const onSelect = React.useCallback(() => {
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
      (event) => propsRef.current.onSelect?.(text, event),
      {
        once: true,
      },
    );

    item.dispatchEvent(selectEvent);
  }, [propsRef, store]);

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<ItemElement>) => {
      pointerTypeRef.current = event.pointerType;
      propsRef.current.onPointerDown?.(event);

      if (event.pointerType === "mouse") {
        event.preventDefault();
      }
    },
    [propsRef],
  );

  const onClick = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;

      if (pointerTypeRef.current !== "mouse") {
        onSelect();
      }
    },
    [propsRef, onSelect],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<ItemElement>) => {
      propsRef.current.onPointerUp?.(event);
      if (event.defaultPrevented) return;

      if (pointerTypeRef.current === "mouse") {
        onSelect();
      }
    },
    [propsRef, onSelect],
  );

  return (
    <Button
      type="button"
      data-slot="selection-toolbar-item"
      variant="ghost"
      size="icon"
      {...itemProps}
      className={cn("size-8", className)}
      ref={composedRef}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onPointerUp={onPointerUp}
    />
  );
}

function SelectionToolbarSeparator(props: DivProps) {
  const { asChild, className, ...separatorProps } = props;

  const SeparatorPrimitive = asChild ? SlotPrimitive.Slot : "div";

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
