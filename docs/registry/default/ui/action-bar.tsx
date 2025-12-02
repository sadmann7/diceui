"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { Portal } from "@/registry/default/components/portal";

const ITEM_NAME = "ActionBarItem";
const CLOSE_NAME = "ActionBarClose";
const ITEM_SELECT = "actionbar.itemSelect";

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
}

function ActionBarRoot(props: ActionBarRootProps) {
  const {
    open = false,
    onOpenChange,
    side = "bottom",
    align = "center",
    sideOffset = 16,
    asChild,
    className,
    style,
    ...rootProps
  } = props;

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
