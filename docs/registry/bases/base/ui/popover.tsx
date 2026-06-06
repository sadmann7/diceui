"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useComposedRefs } from "@/registry/bases/base/lib/compose-refs";

type InteractOutsideEvent = {
  defaultPrevented: boolean;
  preventDefault: () => void;
  target: EventTarget | null;
};

type InteractOutsideHandler = (event: InteractOutsideEvent) => void;

type OpenAutoFocusEvent = {
  defaultPrevented: boolean;
  preventDefault: () => void;
};

type OpenAutoFocusHandler = (event: OpenAutoFocusEvent) => void;

const PopoverInteractOutsideContext = React.createContext<{
  subscribe: (handler: InteractOutsideHandler) => () => void;
} | null>(null);

const PopoverAnchorContext = React.createContext<HTMLElement | null>(null);

function Popover({ onOpenChange, ...props }: PopoverPrimitive.Root.Props) {
  const handlersRef = React.useRef(new Set<InteractOutsideHandler>());

  const subscribe = React.useCallback((handler: InteractOutsideHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  const handleOpenChange = React.useCallback(
    (open: boolean, eventDetails: PopoverPrimitive.Root.ChangeEventDetails) => {
      if (
        !open &&
        eventDetails.reason === "outside-press" &&
        handlersRef.current.size > 0
      ) {
        const event: InteractOutsideEvent = {
          defaultPrevented: false,
          preventDefault() {
            this.defaultPrevented = true;
          },
          target: eventDetails.event.target,
        };

        for (const handler of handlersRef.current) {
          handler(event);
          if (event.defaultPrevented) {
            eventDetails.cancel();
            return;
          }
        }
      }

      onOpenChange?.(open, eventDetails);
    },
    [onOpenChange],
  );

  return (
    <PopoverInteractOutsideContext.Provider value={{ subscribe }}>
      <PopoverPrimitive.Root
        data-slot="popover"
        onOpenChange={handleOpenChange}
        {...props}
      />
    </PopoverInteractOutsideContext.Provider>
  );
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor({
  asChild = true,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement;
}) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  const setAnchorRef = React.useCallback((node: HTMLElement | null) => {
    setAnchor(node);
  }, []);

  if (!asChild) {
    return (
      <PopoverAnchorContext.Provider value={anchor}>
        <div ref={setAnchorRef}>{children}</div>
      </PopoverAnchorContext.Provider>
    );
  }

  const childRef = (children as React.RefAttributes<HTMLElement>).ref;
  const composedRef = useComposedRefs(setAnchorRef, childRef);

  return (
    <PopoverAnchorContext.Provider value={anchor}>
      {React.cloneElement(children, {
        ref: composedRef,
      } as React.HTMLAttributes<HTMLElement>)}
    </PopoverAnchorContext.Provider>
  );
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  container,
  onOpenAutoFocus,
  onInteractOutside,
  initialFocus: initialFocusProp,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    container?: PopoverPrimitive.Portal.Props["container"];
    onOpenAutoFocus?: OpenAutoFocusHandler;
    onInteractOutside?: InteractOutsideHandler;
  }) {
  const anchor = React.useContext(PopoverAnchorContext);
  const interactOutsideContext = React.useContext(
    PopoverInteractOutsideContext,
  );

  React.useEffect(() => {
    if (!onInteractOutside || !interactOutsideContext) return;
    return interactOutsideContext.subscribe(onInteractOutside);
  }, [onInteractOutside, interactOutsideContext]);

  const initialFocus = React.useMemo(() => {
    if (initialFocusProp !== undefined) return initialFocusProp;
    if (!onOpenAutoFocus) return undefined;

    return () => {
      const event: OpenAutoFocusEvent = {
        defaultPrevented: false,
        preventDefault() {
          event.defaultPrevented = true;
        },
      };
      onOpenAutoFocus(event);
      if (event.defaultPrevented) return false;
      return true;
    };
  }, [initialFocusProp, onOpenAutoFocus]);

  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Positioner
        anchor={anchor ?? undefined}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          initialFocus={initialFocus}
          className={cn(
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-popover-foreground text-sm shadow-md outline-hidden ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
