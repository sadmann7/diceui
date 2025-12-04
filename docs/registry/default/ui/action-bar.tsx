"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "ActionBar";
const ITEM_NAME = "ActionBarItem";
const CLOSE_NAME = "ActionBarClose";
const ITEM_SELECT = "actionbar.itemSelect";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof ActionBarRoot>;
type ItemElement = React.ComponentRef<typeof ActionBarItem>;
type CloseElement = React.ComponentRef<typeof ActionBarClose>;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props);

  useIsomorphicLayoutEffect(() => {
    ref.current = props;
  });

  return ref;
}

interface ActionBarContextValue {
  onOpenChange?: (open: boolean) => void;
}

const ActionBarContext = React.createContext<ActionBarContextValue | null>(
  null,
);

function useActionBarContext(consumerName: string) {
  const context = React.useContext(ActionBarContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface ActionBarRootProps extends DivProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  side?: "top" | "bottom";
  sideOffset?: number;
  portalContainer?: Element | DocumentFragment | null;
}

function ActionBarRoot(props: ActionBarRootProps) {
  const {
    open = false,
    onOpenChange,
    onEscapeKeyDown,
    side = "bottom",
    alignOffset = 0,
    align = "center",
    sideOffset = 16,
    portalContainer: portalContainerProp,
    className,
    style,
    ref,
    asChild,
    ...rootProps
  } = props;

  const [mounted, setMounted] = React.useState(false);

  const rootRef = React.useRef<RootElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);

  const propsRef = useAsRef({
    onEscapeKeyDown,
    onOpenChange,
  });

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const ownerDocument = rootRef.current?.ownerDocument ?? document;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        propsRef.current.onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) {
          propsRef.current.onOpenChange?.(false);
        }
      }
    }

    ownerDocument.addEventListener("keydown", onKeyDown);
    return () => ownerDocument.removeEventListener("keydown", onKeyDown);
  }, [open, propsRef]);

  const contextValue = React.useMemo<ActionBarContextValue>(
    () => ({
      onOpenChange,
    }),
    [onOpenChange],
  );

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  if (!portalContainer || !open) return null;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <ActionBarContext.Provider value={contextValue}>
      {ReactDOM.createPortal(
        <RootPrimitive
          data-slot="action-bar"
          data-side={side}
          data-align={align}
          {...rootProps}
          ref={composedRef}
          className={cn(
            "fixed z-50 flex items-center gap-2 rounded-lg border bg-card px-2 py-1.5 shadow-lg",
            "fade-in-0 zoom-in-95 animate-in duration-250 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]",
            "data-[side=bottom]:slide-in-from-bottom-4 data-[side=top]:slide-in-from-top-4",
            "motion-reduce:animate-none motion-reduce:transition-none",
            className,
          )}
          style={{
            [side]: `${sideOffset}px`,
            ...(align === "center" && {
              left: "50%",
              translate: "-50% 0",
            }),
            ...(align === "start" && { left: `${alignOffset}px` }),
            ...(align === "end" && { right: `${alignOffset}px` }),
            ...style,
          }}
        />,
        portalContainer,
      )}
    </ActionBarContext.Provider>
  );
}

function ActionBarSelection(props: DivProps) {
  const { className, asChild, ...selectionProps } = props;

  const SelectionPrimitive = asChild ? Slot : "div";

  return (
    <SelectionPrimitive
      data-slot="action-bar-selection"
      {...selectionProps}
      className={cn(
        "flex items-center gap-1 rounded-sm border px-2 py-1 font-medium text-sm tabular-nums",
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

function ActionBarSeparator(props: DivProps) {
  const { asChild, className, ...separatorProps } = props;

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      role="separator"
      aria-orientation="vertical"
      data-slot="action-bar-separator"
      {...separatorProps}
      className={cn(
        "in-data-[slot=action-bar-selection]:ml-0.5 h-6 in-data-[slot=action-bar-selection]:h-4 w-px bg-border",
        className,
      )}
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
