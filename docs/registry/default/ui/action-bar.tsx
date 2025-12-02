"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Portal } from "@/registry/default/components/portal";

interface ActionBarContextValue {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  side: "top" | "bottom";
  align: "start" | "center" | "end";
  sideOffset: number;
  animated: boolean;
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
  animated?: boolean;
  asChild?: boolean;
}

const actionBarRootVariants = cva(
  [
    "fixed z-50",
    "flex items-center gap-1 rounded-lg border bg-card px-2 py-1.5 shadow-lg",
    "data-[state=open]:fade-in-0 data-[state=open]:animate-in data-[state=open]:duration-200",
    "data-[side=bottom]:data-[state=open]:slide-in-from-bottom-2",
    "data-[side=top]:data-[state=open]:slide-in-from-top-2",
  ],
  {
    variants: {
      animated: {
        true: "",
        false: "data-[state=open]:animate-none",
      },
    },
  },
);

function ActionBarRoot(props: ActionBarRootProps) {
  const {
    open = false,
    onOpenChange,
    side = "bottom",
    align = "center",
    sideOffset = 16,
    animated = true,
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
      animated,
    }),
    [open, onOpenChange, side, align, sideOffset, animated],
  );

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
          className={cn(actionBarRootVariants({ animated, className }))}
          style={{
            [side]: `${sideOffset}px`,
            ...(align === "center" && {
              left: "50%",
              transform: "translateX(-50%)",
            }),
            ...(align === "start" && { left: `${sideOffset}px` }),
            ...(align === "end" && { right: `${sideOffset}px` }),
            ...style,
          }}
        />
      </Portal>
    </ActionBarContext.Provider>
  );
}

const actionBarItemVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "hover:bg-accent hover:text-accent-foreground",
    "h-9 px-3",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        destructive:
          "text-destructive hover:bg-destructive hover:text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ActionBarItemProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  variant?: "default" | "destructive";
}

function ActionBarItem(props: ActionBarItemProps) {
  const { asChild, className, variant, ...itemProps } = props;

  const ItemPrimitive = asChild ? Slot : "button";

  return (
    <ItemPrimitive
      data-slot="action-bar-item"
      {...itemProps}
      className={cn(actionBarItemVariants({ variant, className }))}
    />
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

interface ActionBarCloseProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function ActionBarClose(props: ActionBarCloseProps) {
  const { asChild, className, onClick, ...closeProps } = props;

  const { onOpenChange } = useActionBarContext("ActionBarClose");

  const onCloseClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
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
        "[&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
      data-slot="action-bar-separator"
      role="separator"
      aria-orientation="vertical"
      {...separatorProps}
      className={cn("mx-1 h-6 w-px bg-border", className)}
    />
  );
}

export {
  ActionBarRoot as Root,
  ActionBarItem as Item,
  ActionBarSelection as Selection,
  ActionBarClose as Close,
  ActionBarSeparator as Separator,
  //
  ActionBarRoot as ActionBar,
  ActionBarItem,
  ActionBarSelection,
  ActionBarClose,
  ActionBarSeparator,
};
