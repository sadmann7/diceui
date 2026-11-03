"use client";

import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useRefWithInit } from "@base-ui/utils/useRefWithInit";
import { useValueAsRef } from "@base-ui/utils/useValueAsRef";
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

interface StoreState {
  open: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);
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

  const listenersRef = useRefWithInit(() => new Set<() => void>());
  const stateRef = useRefWithInit<StoreState>(() => ({
    open: openProp ?? defaultOpen,
  }));

  const onOpenChangeRef = useValueAsRef(onOpenChangeProp);

  const store = React.useMemo<Store>(() => {
    function notify() {
      for (const cb of listenersRef.current) {
        cb();
      }
    }

    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "open" && typeof value === "boolean") {
          stateRef.current.open = value;
          onOpenChangeRef.current?.(value);
        } else {
          stateRef.current[key] = value;
        }

        notify();
      },
      notify,
    };
  }, [listenersRef, stateRef, onOpenChangeRef]);

  const open = useStore((state) => state.open, store);

  useIsoLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp, store]);

  const onOpenChange = React.useCallback(
    (value: boolean) => {
      store.setState("open", value);
    },
    [store],
  );

  if (isMobile) {
    return (
      <StoreContext.Provider value={store}>
        <IsMobileContext.Provider value={isMobile}>
          <Drawer open={open} onOpenChange={onOpenChange} {...props} />
        </IsMobileContext.Provider>
      </StoreContext.Provider>
    );
  }

  return (
    <StoreContext.Provider value={store}>
      <IsMobileContext.Provider value={isMobile}>
        <Dialog
          open={open}
          onOpenChange={onOpenChange}
          handle={handle}
          {...props}
        />
      </IsMobileContext.Provider>
    </StoreContext.Provider>
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
