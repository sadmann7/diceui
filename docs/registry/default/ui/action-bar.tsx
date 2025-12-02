"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { Portal } from "@/registry/default/components/portal";

const ITEM_NAME = "ActionBarItem";
const CLOSE_NAME = "ActionBarClose";
const ITEM_SELECT = "actionbar.itemSelect";

interface PointerDownOutsideEvent {
  target: Node;
  preventDefault: () => void;
  defaultPrevented: boolean;
}

interface FocusOutsideEvent {
  target: Node;
  preventDefault: () => void;
  defaultPrevented: boolean;
}

type RootElement = React.ComponentRef<typeof ActionBarRoot>;
type ItemElement = React.ComponentRef<typeof ActionBarItem>; // eslint-disable-line @typescript-eslint/no-unused-vars
type CloseElement = React.ComponentRef<typeof ActionBarClose>;

interface ActionBarContextValue {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  side: "top" | "bottom";
  align: "start" | "center" | "end";
  sideOffset: number;
}

const ActionBarContext = React.createContext<ActionBarContextValue | null>(
  null,
);

function useActionBarContext(consumerName: string) {
  const context = React.useContext(ActionBarContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`ActionBar\``);
  }
  return context;
}

interface ActionBarRootProps extends React.ComponentProps<"div"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  asChild?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (
    event: PointerDownOutsideEvent | FocusOutsideEvent,
  ) => void;
}

function ActionBarRoot(props: ActionBarRootProps) {
  const {
    open = false,
    onOpenChange,
    side = "bottom",
    align = "center",
    sideOffset = 16,
    asChild,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    className,
    style,
    onPointerDownCapture,
    onFocusCapture,
    onBlurCapture,
    ref,
    ...rootProps
  } = props;

  const rootRef = React.useRef<RootElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const isPointerInsideRef = React.useRef(false);
  const isFocusInsideRef = React.useRef(false);
  const onClickRef = React.useRef(() => {});

  const onEscapeKeyDownCallback = useCallbackRef(onEscapeKeyDown);
  const onPointerDownOutsideCallback = useCallbackRef(onPointerDownOutside);
  const onFocusOutsideCallback = useCallbackRef(onFocusOutside);
  const onInteractOutsideCallback = useCallbackRef(onInteractOutside);

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscapeKeyDownCallback?.(event);
        if (!event.defaultPrevented) {
          onOpenChange?.(false);
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onEscapeKeyDownCallback, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;

    const ownerDocument = rootRef.current?.ownerDocument ?? document;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;

      if (target && !isPointerInsideRef.current) {
        const root = rootRef.current;
        if (root && !root.contains(target)) {
          const outsideEvent: PointerDownOutsideEvent = {
            target,
            defaultPrevented: false,
            preventDefault: () => {
              outsideEvent.defaultPrevented = true;
            },
          };

          function handlePointerDownOutside() {
            onPointerDownOutsideCallback?.(outsideEvent);
            onInteractOutsideCallback?.(outsideEvent);

            if (!outsideEvent.defaultPrevented) {
              onOpenChange?.(false);
            }
          }

          if (event.pointerType === "touch") {
            ownerDocument.removeEventListener("click", onClickRef.current);
            onClickRef.current = handlePointerDownOutside;
            ownerDocument.addEventListener("click", onClickRef.current, {
              once: true,
            });
          } else {
            handlePointerDownOutside();
          }
        }
      } else {
        ownerDocument.removeEventListener("click", onClickRef.current);
      }

      isPointerInsideRef.current = false;
    }

    const timeoutId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      ownerDocument.removeEventListener("pointerdown", onPointerDown);
      ownerDocument.removeEventListener("click", onClickRef.current);
    };
  }, [
    open,
    onPointerDownOutsideCallback,
    onInteractOutsideCallback,
    onOpenChange,
  ]);

  React.useEffect(() => {
    if (!open) return;

    function onFocusIn(event: FocusEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      const root = rootRef.current;
      if (!root || root.contains(target) || isFocusInsideRef.current) return;

      const outsideEvent: FocusOutsideEvent = {
        target,
        defaultPrevented: false,
        preventDefault: () => {
          outsideEvent.defaultPrevented = true;
        },
      };

      onFocusOutsideCallback?.(outsideEvent);
      onInteractOutsideCallback?.(outsideEvent);

      if (!outsideEvent.defaultPrevented) {
        onOpenChange?.(false);
      }
    }

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [open, onFocusOutsideCallback, onInteractOutsideCallback, onOpenChange]);

  const onRootPointerDownCapture = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      onPointerDownCapture?.(event);
      isPointerInsideRef.current = true;
    },
    [onPointerDownCapture],
  );

  const onRootFocusCapture = React.useCallback(
    (event: React.FocusEvent<RootElement>) => {
      onFocusCapture?.(event);
      isFocusInsideRef.current = true;
    },
    [onFocusCapture],
  );

  const onRootBlurCapture = React.useCallback(
    (event: React.FocusEvent<RootElement>) => {
      onBlurCapture?.(event);
      isFocusInsideRef.current = false;
    },
    [onBlurCapture],
  );

  const contextValue = React.useMemo<ActionBarContextValue>(
    () => ({
      open,
      onOpenChange,
      side,
      align,
      sideOffset,
    }),
    [open, onOpenChange, side, align, sideOffset],
  );

  if (!open) return null;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <ActionBarContext.Provider value={contextValue}>
      <Portal>
        <RootPrimitive
          data-slot="action-bar"
          data-state={open ? "open" : "closed"}
          data-side={side}
          data-align={align}
          {...rootProps}
          ref={composedRef}
          onPointerDownCapture={onRootPointerDownCapture}
          onFocusCapture={onRootFocusCapture}
          onBlurCapture={onRootBlurCapture}
          className={cn(
            "fixed z-50 flex items-center gap-1 rounded-lg border bg-card px-2 py-1.5 shadow-lg",
            "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in data-[state=open]:duration-250",
            "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out data-[state=closed]:duration-200",
            "data-[side=bottom]:data-[state=open]:slide-in-from-bottom-4 data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-4",
            "data-[side=top]:data-[state=open]:slide-in-from-top-4 data-[side=top]:data-[state=closed]:slide-out-to-top-4",
            "motion-reduce:animate-none motion-reduce:transition-none",
            className,
          )}
          style={{
            [side]: `${sideOffset}px`,
            ...(align === "center" && {
              left: "50%",
              translate: "-50% 0",
            }),
            ...(align === "start" && { left: `${sideOffset}px` }),
            ...(align === "end" && { right: `${sideOffset}px` }),
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            ...style,
          }}
        />
      </Portal>
    </ActionBarContext.Provider>
  );
}

interface ActionBarSelectionProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function ActionBarSelection(props: ActionBarSelectionProps) {
  const { asChild, className, ...selectionProps } = props;

  const SelectionPrimitive = asChild ? Slot : "div";

  return (
    <SelectionPrimitive
      data-slot="action-bar-selection"
      {...selectionProps}
      className={cn(
        "flex items-center gap-2 rounded-sm border border-dotted px-2 py-1 font-medium text-sm",
        className,
      )}
    />
  );
}

interface ActionBarItemProps
  extends Omit<React.ComponentProps<typeof Button>, "onSelect"> {
  onSelect?: (event: Event) => void;
}

function ActionBarItem(props: ActionBarItemProps) {
  const { onSelect, onClick, ref, ...itemProps } = props;

  const itemRef = React.useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);

  const { onOpenChange } = useActionBarContext(ITEM_NAME);

  const onItemSelect = React.useCallback(() => {
    const item = itemRef.current;
    if (!item) return;

    const itemSelectEvent = new CustomEvent(ITEM_SELECT, {
      bubbles: true,
      cancelable: true,
    });

    item.addEventListener(ITEM_SELECT, (event) => onSelect?.(event), {
      once: true,
    });

    item.dispatchEvent(itemSelectEvent);

    if (!itemSelectEvent.defaultPrevented) {
      onOpenChange?.(false);
    }
  }, [onOpenChange, onSelect]);

  const onItemClick = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      if (onSelect) {
        onItemSelect();
      }
    },
    [onClick, onSelect, onItemSelect],
  );

  return (
    <Button
      type="button"
      data-slot="action-bar-item"
      variant="secondary"
      size="sm"
      {...itemProps}
      ref={composedRef}
      onClick={onItemClick}
    />
  );
}

interface ActionBarCloseProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function ActionBarClose(props: ActionBarCloseProps) {
  const { asChild, className, onClick, ...closeProps } = props;

  const { onOpenChange } = useActionBarContext(CLOSE_NAME);

  const onCloseClick = React.useCallback(
    (event: React.MouseEvent<CloseElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      onOpenChange?.(false);
    },
    [onOpenChange, onClick],
  );

  const ClosePrimitive = asChild ? Slot : "button";

  return (
    <ClosePrimitive
      type="button"
      data-slot="action-bar-close"
      {...closeProps}
      className={cn(
        "rounded-xs opacity-70 outline-none hover:opacity-100 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      onClick={onCloseClick}
    />
  );
}

interface ActionBarSeparatorProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function ActionBarSeparator(props: ActionBarSeparatorProps) {
  const { asChild, className, ...separatorProps } = props;

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      role="separator"
      aria-orientation="vertical"
      data-slot="action-bar-separator"
      {...separatorProps}
      className={cn("mx-1 h-6 w-px bg-border", className)}
    />
  );
}

export {
  ActionBarRoot as Root,
  ActionBarSelection as Selection,
  ActionBarItem as Item,
  ActionBarClose as Close,
  ActionBarSeparator as Separator,
  //
  ActionBarRoot as ActionBar,
  ActionBarSelection,
  ActionBarItem,
  ActionBarClose,
  ActionBarSeparator,
};

export type { PointerDownOutsideEvent, FocusOutsideEvent };
