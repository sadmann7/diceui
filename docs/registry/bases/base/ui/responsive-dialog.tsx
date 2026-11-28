"use client";

import { useControlled } from "@base-ui/utils/useControlled";
import { cn } from "cn";
import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/registry/bases/base/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/bases/base/ui/drawer";

const ROOT_NAME = "ResponsiveDialog";

const IsMobileContext = React.createContext<boolean | null>(null);

function useIsMobileContext() {
  const isMobile = React.useContext(IsMobileContext);

  if (isMobile === null) {
    throw new Error(
      `\`useIsMobileContext\` must be used within \`${ROOT_NAME}\``,
    );
  }

  return isMobile;
}

function useIsBelowBreakpoint(breakpoint: number) {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [breakpoint],
  );

  const getSnapshot = React.useCallback(
    () => window.innerWidth < breakpoint,
    [breakpoint],
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot() {
  return false;
}

interface ResponsiveDialogProps extends React.ComponentProps<typeof Dialog> {
  breakpoint?: number;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  modal?: boolean;
}

function ResponsiveDialog({
  breakpoint = 768,
  open: openProp,
  defaultOpen = false,
  onOpenChange: onOpenChangeProp,
  handle,
  ...props
}: ResponsiveDialogProps) {
  const isMobile = useIsBelowBreakpoint(breakpoint);

  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen,
    name: ROOT_NAME,
    state: "open",
  });

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen === open) return;
    onOpenChangeProp?.(nextOpen);
    setOpenState(nextOpen);
  }

  if (isMobile) {
    return (
      <IsMobileContext.Provider value={isMobile}>
        <Drawer open={open} onOpenChange={onOpenChange} {...props} />
      </IsMobileContext.Provider>
    );
  }

  return (
    <IsMobileContext.Provider value={isMobile}>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        handle={handle}
        {...props}
      />
    </IsMobileContext.Provider>
  );
}

interface ResponsiveDialogTriggerProps extends React.ComponentProps<"button"> {
  render?: React.ComponentProps<typeof DialogTrigger>["render"];
}

function ResponsiveDialogTrigger({
  render,
  children,
  ...props
}: ResponsiveDialogTriggerProps) {
  const isMobile = useIsMobileContext();

  if (isMobile) {
    return (
      <DrawerTrigger data-variant="drawer" render={render} {...props}>
        {children}
      </DrawerTrigger>
    );
  }

  return render ? (
    <DialogTrigger data-variant="dialog" render={render} {...props} />
  ) : (
    <DialogTrigger data-variant="dialog" {...props}>
      {children}
    </DialogTrigger>
  );
}

interface ResponsiveDialogCloseProps extends React.ComponentProps<"button"> {
  render?: React.ComponentProps<typeof DialogClose>["render"];
}

function ResponsiveDialogClose({
  render,
  children,
  ...props
}: ResponsiveDialogCloseProps) {
  const isMobile = useIsMobileContext();

  if (isMobile) {
    return (
      <DrawerClose data-variant="drawer" render={render} {...props}>
        {children}
      </DrawerClose>
    );
  }

  return render ? (
    <DialogClose data-variant="dialog" render={render} {...props} />
  ) : (
    <DialogClose data-variant="dialog" {...props}>
      {children}
    </DialogClose>
  );
}

interface ResponsiveDialogPortalProps extends React.ComponentProps<
  typeof DialogPortal
> {
  container?: HTMLElement | null;
}

function ResponsiveDialogPortal({
  children,
  container,
}: ResponsiveDialogPortalProps) {
  const isMobile = useIsMobileContext();

  if (isMobile) {
    return (
      <DrawerPortal data-variant="drawer" container={container}>
        {children}
      </DrawerPortal>
    );
  }

  return (
    <DialogPortal data-variant="dialog" container={container}>
      {children}
    </DialogPortal>
  );
}

interface ResponsiveDialogOverlayProps extends Omit<
  React.ComponentProps<typeof DialogOverlay>,
  "className"
> {
  className?: string;
}

function ResponsiveDialogOverlay({
  forceRender,
  render,
  style,
  ...props
}: ResponsiveDialogOverlayProps) {
  const isMobile = useIsMobileContext();
  const resolvedStyle = typeof style === "function" ? undefined : style;

  if (isMobile) {
    return (
      <DrawerOverlay data-variant="drawer" style={resolvedStyle} {...props} />
    );
  }

  return (
    <DialogOverlay
      data-variant="dialog"
      render={render}
      forceRender={forceRender}
      style={style}
      {...props}
    />
  );
}

function ResponsiveDialogContent({
  className,
  showCloseButton,
  style,
  render,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isMobile = useIsMobileContext();
  const resolvedStyle = typeof style === "function" ? undefined : style;

  if (isMobile) {
    return (
      <DrawerContent
        data-variant="drawer"
        className={cn("cn-responsive-dialog-content", className)}
        style={resolvedStyle}
        {...props}
      />
    );
  }

  return (
    <DialogContent
      data-variant="dialog"
      className={className}
      showCloseButton={showCloseButton}
      style={style}
      render={render}
      {...props}
    />
  );
}

function ResponsiveDialogHeader({
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const isMobile = useIsMobileContext();

  if (isMobile) {
    return <DrawerHeader data-variant="drawer" {...props} />;
  }

  return <DialogHeader data-variant="dialog" {...props} />;
}

function ResponsiveDialogFooter({
  showCloseButton,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const isMobile = useIsMobileContext();

  if (isMobile) {
    return <DrawerFooter data-variant="drawer" {...props} />;
  }

  return (
    <DialogFooter
      data-variant="dialog"
      showCloseButton={showCloseButton}
      {...props}
    />
  );
}

function ResponsiveDialogTitle({ ...props }: React.ComponentProps<"h2">) {
  const isMobile = useIsMobileContext();

  if (isMobile) {
    return <DrawerTitle data-variant="drawer" {...props} />;
  }

  return <DialogTitle data-variant="dialog" {...props} />;
}

function ResponsiveDialogDescription({ ...props }: React.ComponentProps<"p">) {
  const isMobile = useIsMobileContext();

  if (isMobile) {
    return <DrawerDescription data-variant="drawer" {...props} />;
  }

  return <DialogDescription data-variant="dialog" {...props} />;
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogOverlay,
  ResponsiveDialogPortal,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
