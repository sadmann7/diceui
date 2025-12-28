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

interface SelectionToolbarContextValue {
  selectedText: string;
  selectionRect: SelectionRect | null;
}

const SelectionToolbarContext =
  React.createContext<SelectionToolbarContextValue | null>(null);

function useSelectionToolbarContext(consumerName: string) {
  const context = React.useContext(SelectionToolbarContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
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

  const [mounted, setMounted] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState("");
  const [selectionRect, setSelectionRect] =
    React.useState<SelectionRect | null>(null);

  const rafRef = React.useRef<number | null>(null);

  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Create a virtual element from the selection rect
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

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const updateSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setOpen(false);
      setSelectedText("");
      setSelectionRect(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setOpen(false);
      setSelectedText("");
      setSelectionRect(null);
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
        setOpen(false);
        setSelectedText("");
        setSelectionRect(null);
        return;
      }
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);
    setSelectionRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setOpen(true);

    onSelectionChange?.(text);
  }, [containerProp, setOpen, onSelectionChange]);

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
        setOpen(false);
        setSelectedText("");
        setSelectionRect(null);
      }
    }

    function onScroll() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        if (open) {
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
  }, [containerProp, open, setOpen, updateSelection]);

  React.useEffect(() => {
    if (!open) return;

    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (refs.floating.current && !refs.floating.current.contains(target)) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen, refs.floating]);

  const contextValue = React.useMemo<SelectionToolbarContextValue>(
    () => ({
      selectedText,
      selectionRect,
    }),
    [selectedText, selectionRect],
  );

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  if (!portalContainer || !open) return null;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <SelectionToolbarContext.Provider value={contextValue}>
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
    </SelectionToolbarContext.Provider>
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

  const itemRef = React.useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);

  const context = useSelectionToolbarContext(ITEM_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      const item = itemRef.current;
      if (!item) return;

      const selectEvent = new CustomEvent("selectiontoolbar.select", {
        bubbles: true,
        cancelable: true,
        detail: { text: context.selectedText },
      });

      item.addEventListener(
        "selectiontoolbar.select",
        (event) => onSelect?.(context.selectedText, event),
        {
          once: true,
        },
      );

      item.dispatchEvent(selectEvent);
    },
    [onClickProp, onSelect, context.selectedText],
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
  type SelectionToolbarProps,
};
