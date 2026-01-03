"use client";

import {
  autoUpdate,
  flip,
  type Middleware,
  offset,
  type Placement,
  shift,
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

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type ItemElement = React.ComponentRef<typeof SelectionToolbarItem>;

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
  container?: HTMLElement | null;
  portalContainer?: Element | DocumentFragment | null;
  sideOffset?: number;
}

function SelectionToolbar(props: SelectionToolbarProps) {
  const {
    open: openProp,
    onOpenChange,
    onSelectionChange,
    container: containerProp,
    portalContainer: portalContainerProp,
    sideOffset = 8,
    className,
    style,
    ref,
    asChild,
    children,
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

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
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

  const { refs, floatingStyles, isPositioned, middlewareData } = useFloating({
    open: open && !!virtualElement,
    placement: "top",
    strategy: "fixed",
    middleware: [
      offset(sideOffset),
      flip({
        fallbackPlacements: ["bottom", "top"],
        padding: 8,
      }),
      shift({
        padding: 8,
      }),
      transformOrigin,
    ],
    whileElementsMounted: autoUpdate,
    elements: {
      reference: virtualElement,
    },
  });

  const composedRef = useComposedRefs(ref);

  const updateSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      store.setState("open", false);
      store.setState("selectedText", "");
      store.setState("selectionRect", null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      store.setState("open", false);
      store.setState("selectedText", "");
      store.setState("selectionRect", null);
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
        store.setState("open", false);
        store.setState("selectedText", "");
        store.setState("selectionRect", null);
        return;
      }
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    store.setState("selectedText", text);
    store.setState("selectionRect", {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    store.setState("open", true);
  }, [containerProp, store]);

  React.useEffect(() => {
    const container = containerProp ?? document;

    function onMouseUp() {
      // Small delay to ensure selection is complete
      requestAnimationFrame(() => {
        updateSelection();
      });
    }

    function onSelectionChange() {
      const selection = window.getSelection();
      if (!selection || !selection.toString().trim()) {
        store.setState("open", false);
        store.setState("selectedText", "");
        store.setState("selectionRect", null);
      }
    }

    function onScroll() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        if (store.getState().open) {
          updateSelection();
        }
        rafRef.current = null;
      });
    }

    container.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScroll);
    };
  }, [containerProp, store, updateSelection]);

  React.useEffect(() => {
    if (!open) return;

    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (refs.floating.current && !refs.floating.current.contains(target)) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
        store.setState("open", false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
        store.setState("open", false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, store, refs.floating]);

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  if (!portalContainer || !open) return null;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      {ReactDOM.createPortal(
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            // Keep off-page when measuring to prevent janky initial position
            transform: isPositioned
              ? floatingStyles.transform
              : "translate(0, -200%)",
          }}
          data-state={isPositioned ? "positioned" : "measuring"}
        >
          <RootPrimitive
            role="toolbar"
            aria-label="Text formatting toolbar"
            data-slot="selection-toolbar"
            {...rootProps}
            ref={composedRef}
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
              ...style,
            }}
          >
            {children}
          </RootPrimitive>
        </div>,
        portalContainer,
      )}
    </StoreContext.Provider>
  );
}

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side as Side, align as Align] as const;
}

interface SelectionToolbarItemProps
  extends Omit<React.ComponentProps<typeof Button>, "onSelect"> {
  onSelect?: (text: string, event: Event) => void;
}

function SelectionToolbarItem(props: SelectionToolbarItemProps) {
  const {
    onSelect,
    onClick: onClickProp,
    className,
    ref,
    ...itemProps
  } = props;

  const store = useStoreContext(ITEM_NAME);

  const propsRef = useAsRef({
    onSelect,
    onClick: onClickProp,
  });

  const itemRef = React.useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);

  const onClick = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;

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
    },
    [propsRef, store],
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
      onClick={onClick}
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
