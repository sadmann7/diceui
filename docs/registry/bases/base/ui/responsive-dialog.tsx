"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/base/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/base/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/base/hooks/use-lazy-ref";
import { useIsMobile } from "@/registry/bases/base/hooks/use-mobile";
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
  isMobile: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

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
  ...props
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile(breakpoint);

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? defaultOpen,
    isMobile,
  }));

  const onOpenChangeRef = useAsRef(onOpenChangeProp);

  const store = React.useMemo<Store>(() => {
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

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, onOpenChangeRef]);

  if (stateRef.current.isMobile !== isMobile) {
    stateRef.current.isMobile = isMobile;
  }

  const open = useStore((state) => state.open, store);

  useIsomorphicLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp]);

  const onOpenChange = React.useCallback(
    (value: boolean) => {
      store.setState("open", value);
    },
    [store],
  );

  if (isMobile) {
    return (
      <StoreContext.Provider value={store}>
        <Drawer open={open} onOpenChange={onOpenChange} {...props} />
      </StoreContext.Provider>
    );
  }

  return (
    <StoreContext.Provider value={store}>
      <Dialog open={open} onOpenChange={onOpenChange} {...props} />
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
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return render && React.isValidElement(render) ? (
      <DrawerTrigger data-variant="drawer" asChild {...props}>
        {render}
      </DrawerTrigger>
    ) : (
      <DrawerTrigger data-variant="drawer" {...props}>
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
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return render && React.isValidElement(render) ? (
      <DrawerClose data-variant="drawer" asChild {...props}>
        {render}
      </DrawerClose>
    ) : (
      <DrawerClose data-variant="drawer" {...props}>
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

interface ResponsiveDialogPortalProps
  extends React.ComponentProps<typeof DialogPortal> {
  container?: HTMLElement | null;
}

function ResponsiveDialogPortal({
  children,
  container,
}: ResponsiveDialogPortalProps) {
  const isMobile = useStore((state) => state.isMobile);

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

interface ResponsiveDialogOverlayProps
  extends Omit<React.ComponentProps<typeof DialogOverlay>, "className"> {
  className?: string;
}

function ResponsiveDialogOverlay({
  forceRender,
  render,
  ...props
}: ResponsiveDialogOverlayProps) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return (
      <DrawerOverlay
        data-variant="drawer"
        forceMount={forceRender as true}
        {...props}
      />
    );
  }

  return (
    <DialogOverlay
      data-variant="dialog"
      render={render}
      forceRender={forceRender}
      {...props}
    />
  );
}

function ResponsiveDialogContent({
  className,
  showCloseButton,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return (
      <DrawerContent
        data-variant="drawer"
        className={cn("px-4 pb-4", className)}
        {...props}
      />
    );
  }

  return (
    <DialogContent
      data-variant="dialog"
      className={className}
      showCloseButton={showCloseButton}
      {...props}
    />
  );
}

function ResponsiveDialogHeader({
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerHeader data-variant="drawer" {...props} />;
  }

  return <DialogHeader data-variant="dialog" {...props} />;
}

function ResponsiveDialogFooter({
  showCloseButton,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const isMobile = useStore((state) => state.isMobile);

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
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerTitle data-variant="drawer" {...props} />;
  }

  return <DialogTitle data-variant="dialog" {...props} />;
}

function ResponsiveDialogDescription({ ...props }: React.ComponentProps<"p">) {
  const isMobile = useStore((state) => state.isMobile);

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
