"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { Portal } from "@/registry/default/components/portal";

const ROOT_NAME = "ActionBar";
const ITEM_NAME = "ActionBarItem";
const CLOSE_NAME = "ActionBarClose";
const ITEM_SELECT = "actionbar.itemSelect";
const POINTER_DOWN_OUTSIDE = "actionbar.pointerDownOutside";
const FOCUS_OUTSIDE = "actionbar.focusOutside";

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

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

function dispatchCustomEvent<E extends CustomEvent>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: E["detail"],
  discrete: boolean,
) {
  const target = detail.originalEvent.target as HTMLElement;
  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail,
  });

  if (handler) {
    target.addEventListener(name, handler as EventListener, { once: true });
  }

  if (discrete) {
    ReactDOM.flushSync(() => target.dispatchEvent(event));
  } else {
    target.dispatchEvent(event);
  }

  return event;
}

type OnOpenChange = ((open: boolean) => void) | undefined;

const ActionBarContext = React.createContext<OnOpenChange>(undefined);

function useActionBarContext(consumerName: string) {
  const onOpenChange = React.useContext(ActionBarContext);
  if (onOpenChange === undefined) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return onOpenChange;
}

interface ActionBarRootProps extends React.ComponentProps<"div"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  asChild?: boolean;
  dismissible?: boolean;
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
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onPointerDownCapture,
    onFocusCapture,
    onBlurCapture,
    className,
    style,
    ref,
    asChild,
    dismissible = false,
    ...rootProps
  } = props;

  const rootRef = React.useRef<RootElement>(null);
  const isPointerInsideRef = React.useRef(false);
  const isFocusInsideRef = React.useRef(false);
  const onClickRef = React.useRef(() => {});

  const composedRef = useComposedRefs(ref, rootRef);

  const propsRef = useAsRef({
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onOpenChange,
  });

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

  React.useEffect(() => {
    if (!open || !dismissible) return;

    const ownerDocument = rootRef.current?.ownerDocument ?? document;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;

      if (target && !isPointerInsideRef.current) {
        const root = rootRef.current;
        if (root && !root.contains(target)) {
          function onPointerDownOutside() {
            const pointerEvent = dispatchCustomEvent(
              POINTER_DOWN_OUTSIDE,
              propsRef.current.onPointerDownOutside,
              { originalEvent: event },
              true,
            );

            const interactEvent = dispatchCustomEvent(
              POINTER_DOWN_OUTSIDE,
              propsRef.current.onInteractOutside,
              { originalEvent: event },
              true,
            );

            if (
              !pointerEvent.defaultPrevented &&
              !interactEvent.defaultPrevented
            ) {
              propsRef.current.onOpenChange?.(false);
            }
          }

          if (event.pointerType === "touch") {
            ownerDocument.removeEventListener("click", onClickRef.current);
            onClickRef.current = onPointerDownOutside;
            ownerDocument.addEventListener("click", onClickRef.current, {
              once: true,
            });
          } else {
            onPointerDownOutside();
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
  }, [open, dismissible, propsRef]);

  React.useEffect(() => {
    if (!open || !dismissible) return;

    const ownerDocument = rootRef.current?.ownerDocument ?? document;

    function onFocusIn(event: FocusEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      const root = rootRef.current;
      if (!root || root.contains(target) || isFocusInsideRef.current) return;

      const focusEvent = dispatchCustomEvent(
        FOCUS_OUTSIDE,
        propsRef.current.onFocusOutside,
        { originalEvent: event },
        false,
      );

      const interactEvent = dispatchCustomEvent(
        FOCUS_OUTSIDE,
        propsRef.current.onInteractOutside,
        { originalEvent: event },
        false,
      );

      if (!focusEvent.defaultPrevented && !interactEvent.defaultPrevented) {
        propsRef.current.onOpenChange?.(false);
      }
    }

    ownerDocument.addEventListener("focusin", onFocusIn);
    return () => ownerDocument.removeEventListener("focusin", onFocusIn);
  }, [open, dismissible, propsRef]);

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

  if (!open) return null;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <ActionBarContext.Provider value={onOpenChange}>
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

  const onOpenChange = useActionBarContext(ITEM_NAME);

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

  const onOpenChange = useActionBarContext(CLOSE_NAME);

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
