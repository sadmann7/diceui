"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { cn } from "@/lib/utils";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";
import { Button } from "@/registry/bases/radix/ui/button";

const ROOT_NAME = "Banners";
const BANNER_NAME = "Banner";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

type BannerVariant = "default" | "info" | "success" | "warning" | "destructive";

interface BannerQueueItem {
  id: string;
  content: React.ReactNode;
  variant?: BannerVariant;
  dismissible?: boolean;
  duration?: number;
  onDismiss?: () => void;
}

interface StoreState {
  banners: BannerQueueItem[];
  removing: Set<string>;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
  addBanner: (banner: Omit<BannerQueueItem, "id">) => string;
  removeBanner: (id: string) => void;
  clearBanners: () => void;
  setRemoving: (id: string, value: boolean) => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
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

interface BannerContextValue {
  variant?: BannerVariant;
  onClose?: () => void;
}

const BannerContext = React.createContext<BannerContextValue | null>(null);

function useBannerContext(consumerName: string) {
  const context = React.useContext(BannerContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${BANNER_NAME}\``,
    );
  }
  return context;
}

interface BannersProps {
  children: React.ReactNode;
  maxVisible?: number;
  container?: Element | DocumentFragment | null;
}

function Banners({
  children,
  maxVisible = 1,
  container: containerProp,
}: BannersProps) {
  const stateRef = useLazyRef<StoreState>(() => ({
    banners: [],
    removing: new Set(),
  }));
  const listenersRef = useLazyRef<Set<() => void>>(() => new Set());
  const timeoutsRef = useLazyRef<Map<string, ReturnType<typeof setTimeout>>>(
    () => new Map(),
  );

  const store: Store = React.useMemo(
    () => ({
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;
        stateRef.current[key] = value;
        store.notify();
      },
      notify: () => {
        for (const listener of listenersRef.current) {
          listener();
        }
      },
      addBanner: (banner) => {
        const id = crypto.randomUUID();
        const newBanner: BannerQueueItem = { ...banner, id };

        stateRef.current.banners = [...stateRef.current.banners, newBanner];
        store.notify();

        if (banner.duration && banner.duration > 0) {
          const timeoutId = setTimeout(() => {
            store.setRemoving(id, true);
            timeoutsRef.current.delete(id);
          }, banner.duration);
          timeoutsRef.current.set(id, timeoutId);
        }

        return id;
      },
      removeBanner: (id) => {
        const banner = stateRef.current.banners.find((b) => b.id === id);
        if (!banner) return;

        const timeoutId = timeoutsRef.current.get(id);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutsRef.current.delete(id);
        }

        stateRef.current.removing = new Set(stateRef.current.removing);
        stateRef.current.removing.delete(id);

        banner.onDismiss?.();
        stateRef.current.banners = stateRef.current.banners.filter(
          (b) => b.id !== id,
        );
        store.notify();
      },
      clearBanners: () => {
        for (const timeoutId of timeoutsRef.current.values()) {
          clearTimeout(timeoutId);
        }
        timeoutsRef.current.clear();
        stateRef.current.removing = new Set();
        stateRef.current.banners = [];
        store.notify();
      },
      setRemoving: (id, value) => {
        const newSet = new Set(stateRef.current.removing);
        if (value) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        stateRef.current.removing = newSet;
        store.notify();
      },
    }),
    [stateRef, listenersRef, timeoutsRef],
  );

  const banners = useStore((state) => state.banners, store);
  const visibleBanners = banners.slice(0, maxVisible);
  const container = containerProp ?? globalThis.document?.body ?? null;

  return (
    <StoreContext.Provider value={store}>
      {children}
      {container &&
        visibleBanners.length > 0 &&
        ReactDOM.createPortal(
          <div
            data-slot="banner-container"
            className="fixed top-0 right-0 left-0 z-50 flex flex-col"
          >
            {visibleBanners.map((banner) => (
              <QueuedBannerItem key={banner.id} banner={banner} />
            ))}
          </div>,
          container,
        )}
    </StoreContext.Provider>
  );
}

function useBanner() {
  const store = useStoreContext("useBanner");
  const banners = useStore((state) => state.banners);

  return React.useMemo(
    () => ({
      addBanner: store.addBanner,
      removeBanner: store.removeBanner,
      clearBanners: store.clearBanners,
      banners,
    }),
    [store, banners],
  );
}

const bannerVariants = cva(
  "relative flex w-full items-center gap-3 border-b px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50",
        success:
          "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50",
        warning:
          "bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50",
        destructive: "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface QueuedBannerItemProps {
  banner: BannerQueueItem;
}

function QueuedBannerItem({ banner }: QueuedBannerItemProps) {
  const store = useStoreContext("QueuedBannerItem");
  const removing = useStore((state) => state.removing.has(banner.id));

  const onClose = React.useCallback(() => {
    store.setRemoving(banner.id, true);
  }, [store, banner.id]);

  const onAnimationEnd = React.useCallback(() => {
    if (removing) {
      store.removeBanner(banner.id);
    }
  }, [removing, store, banner.id]);

  const contextValue = React.useMemo<BannerContextValue>(
    () => ({
      variant: banner.variant,
      onClose,
    }),
    [banner.variant, onClose],
  );

  return (
    <BannerContext.Provider value={contextValue}>
      <div
        role="status"
        aria-live="polite"
        data-state={removing ? "closed" : "open"}
        onAnimationEnd={onAnimationEnd}
        className={cn(
          bannerVariants({ variant: banner.variant }),
          "fade-in-0 slide-in-from-top-full animate-in duration-300",
          removing &&
            "fade-out-0 slide-out-to-top-full animate-out duration-200",
        )}
      >
        {banner.content}
        {banner.dismissible && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </BannerContext.Provider>
  );
}

interface BannerProps extends DivProps, VariantProps<typeof bannerVariants> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Banner({
  className,
  variant = "default",
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  children,
  asChild,
  ...props
}: BannerProps) {
  const isControlled = openProp !== undefined;
  const openRef = useLazyRef(() => openProp ?? defaultOpen);

  if (isControlled) {
    openRef.current = openProp;
  }

  const listenersRef = useLazyRef<Set<() => void>>(() => new Set());

  const subscribe = React.useCallback(
    (cb: () => void) => {
      listenersRef.current.add(cb);
      return () => listenersRef.current.delete(cb);
    },
    [listenersRef],
  );

  const getSnapshot = React.useCallback(() => openRef.current, [openRef]);

  const open = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const onClose = React.useCallback(() => {
    if (!isControlled) {
      openRef.current = false;
      for (const listener of listenersRef.current) {
        listener();
      }
    }
    onOpenChange?.(false);
  }, [isControlled, onOpenChange, openRef, listenersRef]);

  const contextValue = React.useMemo<BannerContextValue>(
    () => ({
      variant: variant ?? undefined,
      onClose,
    }),
    [variant, onClose],
  );

  if (!open) return null;

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <BannerContext.Provider value={contextValue}>
      <RootPrimitive
        role="status"
        aria-live="polite"
        data-slot="banner"
        data-state="open"
        className={cn(bannerVariants({ variant }), className)}
        {...props}
      >
        {children}
      </RootPrimitive>
    </BannerContext.Provider>
  );
}

function BannerIcon({ className, children, asChild, ...props }: DivProps) {
  const IconPrimitive = asChild ? SlotPrimitive.Slot : "div";
  return (
    <IconPrimitive
      data-slot="banner-icon"
      className={cn("flex shrink-0 items-center [&>svg]:size-4", className)}
      {...props}
    >
      {children}
    </IconPrimitive>
  );
}

function BannerContent({ className, asChild, ...props }: DivProps) {
  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";
  return (
    <ContentPrimitive
      data-slot="banner-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

function BannerTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="banner-title"
      className={cn("font-medium text-sm leading-none", className)}
      {...props}
    />
  );
}

function BannerDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="banner-description"
      className={cn("text-xs opacity-90", className)}
      {...props}
    />
  );
}

function BannerActions({ className, asChild, ...props }: DivProps) {
  const ActionsPrimitive = asChild ? SlotPrimitive.Slot : "div";
  return (
    <ActionsPrimitive
      data-slot="banner-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function BannerClose({
  className,
  children,
  asChild,
  onClick,
  ...props
}: ButtonProps) {
  const context = useBannerContext("BannerClose");
  const ClosePrimitive = asChild ? SlotPrimitive.Slot : "button";

  const onClickHandler = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      context.onClose?.();
    },
    [onClick, context],
  );

  return (
    <ClosePrimitive
      data-slot="banner-close"
      type="button"
      onClick={onClickHandler}
      className={cn(
        "shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
      aria-label="Dismiss banner"
      {...props}
    >
      {children ?? <X className="size-3.5" />}
    </ClosePrimitive>
  );
}

export {
  Banner,
  BannerActions,
  BannerClose,
  BannerContent,
  BannerDescription,
  BannerIcon,
  Banners,
  BannerTitle,
  useBanner,
};
