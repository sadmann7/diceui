"use client";

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
} from "@/components/ui/dialog";
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
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/radix/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/radix/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";
import { useIsMobile } from "@/registry/bases/radix/hooks/use-mobile";

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

  const open = useStore((state) => state.open, store);

  useIsomorphicLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp]);

  useIsomorphicLayoutEffect(() => {
    store.setState("isMobile", isMobile);
  }, [isMobile]);

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

function ResponsiveDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerTrigger data-variant="drawer" {...props} />;
  }

  return <DialogTrigger data-variant="dialog" {...props} />;
}

function ResponsiveDialogClose({
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerClose data-variant="drawer" {...props} />;
  }

  return <DialogClose data-variant="dialog" {...props} />;
}

function ResponsiveDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPortal>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerPortal data-variant="drawer" {...props} />;
  }

  return <DialogPortal data-variant="dialog" {...props} />;
}

function ResponsiveDialogOverlay({
  ...props
}: React.ComponentProps<typeof DialogOverlay>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerOverlay data-variant="drawer" {...props} />;
  }

  return <DialogOverlay data-variant="dialog" {...props} />;
}

function ResponsiveDialogContent({
  className,
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
    <DialogContent data-variant="dialog" className={className} {...props} />
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
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerFooter data-variant="drawer" {...props} />;
  }

  return <DialogFooter data-variant="dialog" {...props} />;
}

function ResponsiveDialogTitle({
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const isMobile = useStore((state) => state.isMobile);

  if (isMobile) {
    return <DrawerTitle data-variant="drawer" {...props} />;
  }

  return <DialogTitle data-variant="dialog" {...props} />;
}

function ResponsiveDialogDescription({
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
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
