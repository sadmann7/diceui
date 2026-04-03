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

interface BannerRenderProps {
  id: string;
  variant?: BannerVariant;
  onClose: () => void;
  onRemove: () => void;
}

type BannerContent =
  | React.ReactNode
  | ((props: BannerRenderProps) => React.ReactNode);

interface QueuedBannerItem {
  id: string;
  content: BannerContent;
  variant?: BannerVariant;
  priority?: number;
  dismissible?: boolean;
  duration?: number;
  onDismiss?: () => void;
}

interface BannerHeight {
  id: string;
  height: number;
}

interface StoreState {
  banners: QueuedBannerItem[];
  removing: Set<string>;
  heights: BannerHeight[];
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
  onBannerAdd: (banner: Omit<QueuedBannerItem, "id">) => string;
  onBannerRemove: (id: string) => void;
  onBannersClear: () => void;
  onRemovingChange: (id: string, value: boolean) => void;
  onHeightChange: (id: string, height: number) => void;
  onHeightRemove: (id: string) => void;
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
  id?: string;
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

function useBanner() {
  const bannerContext = useBannerContext("useBanner");
  const storeContext = React.useContext(StoreContext);
  const { id, variant, onClose } = bannerContext;

  return React.useMemo(() => {
    const onRemove =
      id && storeContext ? () => storeContext.onBannerRemove(id) : undefined;

    return {
      id,
      variant,
      onClose,
      onRemove,
    };
  }, [id, variant, onClose, storeContext]);
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
    heights: [],
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
      onBannerAdd: (banner) => {
        const id = crypto.randomUUID();
        const newBanner: QueuedBannerItem = { ...banner, id };
        const priority = banner.priority ?? 0;

        const banners = [...stateRef.current.banners];
        const insertIndex = banners.findIndex(
          (b) => (b.priority ?? 0) < priority,
        );

        if (insertIndex === -1) {
          banners.push(newBanner);
        } else {
          banners.splice(insertIndex, 0, newBanner);
        }

        stateRef.current.banners = banners;
        store.notify();

        if (banner.duration && banner.duration > 0) {
          const timeoutId = setTimeout(() => {
            store.onRemovingChange(id, true);
            timeoutsRef.current.delete(id);
          }, banner.duration);
          timeoutsRef.current.set(id, timeoutId);
        }

        return id;
      },
      onBannerRemove: (id) => {
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
      onBannersClear: () => {
        for (const timeoutId of timeoutsRef.current.values()) {
          clearTimeout(timeoutId);
        }
        timeoutsRef.current.clear();
        stateRef.current.removing = new Set();
        stateRef.current.heights = [];
        stateRef.current.banners = [];
        store.notify();
      },
      onRemovingChange: (id, value) => {
        const newSet = new Set(stateRef.current.removing);
        if (value) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        stateRef.current.removing = newSet;
        store.notify();
      },
      onHeightChange: (id, height) => {
        const existing = stateRef.current.heights.find((h) => h.id === id);
        if (existing) {
          if (existing.height === height) return;
          stateRef.current.heights = stateRef.current.heights.map((h) =>
            h.id === id ? { ...h, height } : h,
          );
        } else {
          stateRef.current.heights = [
            { id, height },
            ...stateRef.current.heights,
          ];
        }
        store.notify();
      },
      onHeightRemove: (id) => {
        const existing = stateRef.current.heights.find((h) => h.id === id);
        if (!existing) return;
        stateRef.current.heights = stateRef.current.heights.filter(
          (h) => h.id !== id,
        );
        store.notify();
      },
    }),
    [stateRef, listenersRef, timeoutsRef],
  );

  const banners = useStore((state) => state.banners, store);
  const heights = useStore((state) => state.heights, store);
  const visibleBanners = banners.slice(0, maxVisible);
  const container = containerProp ?? globalThis.document?.body ?? null;

  const totalHeight = React.useMemo(() => {
    return visibleBanners.reduce((acc, banner) => {
      const height = heights.find((h) => h.id === banner.id)?.height ?? 0;
      return acc + height;
    }, 0);
  }, [visibleBanners, heights]);

  return (
    <StoreContext.Provider value={store}>
      {children}
      {container &&
        visibleBanners.length > 0 &&
        ReactDOM.createPortal(
          <div
            data-slot="banner-container"
            className="pointer-events-none fixed top-0 right-0 left-0 isolate z-50"
            style={{
              height: totalHeight > 0 ? totalHeight : "auto",
              transition: `height ${ANIMATION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
            }}
          >
            {visibleBanners.map((banner, index) => (
              <QueuedBanner key={banner.id} banner={banner} index={index} />
            ))}
          </div>,
          container,
        )}
    </StoreContext.Provider>
  );
}

function useBanners() {
  const store = useStoreContext("useBanners");
  const banners = useStore((state) => state.banners);

  return React.useMemo(
    () => ({
      onBannerAdd: store.onBannerAdd,
      onBannerRemove: store.onBannerRemove,
      onBannersClear: store.onBannersClear,
      banners,
    }),
    [store, banners],
  );
}

const ANIMATION_DURATION = 400;

const bannerVariants = cva(
  "pointer-events-auto relative flex w-full items-center gap-3 border-b px-4 py-3 text-sm motion-reduce:transition-none",
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

interface QueuedBannerProps extends React.ComponentProps<"div"> {
  banner: QueuedBannerItem;
  index: number;
}

function QueuedBanner({
  banner,
  index,
  className,
  style,
  ...props
}: QueuedBannerProps) {
  const store = useStoreContext("QueuedBanner");
  const removing = useStore((state) => state.removing.has(banner.id));
  const heights = useStore((state) => state.heights);
  const [mounted, setMounted] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement>(null);
  const offsetBeforeRemoveRef = React.useRef(0);

  const heightIndex = React.useMemo(
    () => heights.findIndex((h) => h.id === banner.id),
    [heights, banner.id],
  );

  const offset = React.useMemo(() => {
    if (heightIndex === -1) return 0;
    return heights.slice(0, heightIndex).reduce((acc, h) => acc + h.height, 0);
  }, [heights, heightIndex]);

  React.useEffect(() => {
    if (!removing) {
      offsetBeforeRemoveRef.current = offset;
    }
  }, [offset, removing]);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useLayoutEffect(() => {
    if (bannerRef.current && !removing) {
      const height = bannerRef.current.getBoundingClientRect().height;
      store.onHeightChange(banner.id, height);
    }
  }, [store, banner.id, removing]);

  React.useEffect(() => {
    if (!removing) return;

    store.onHeightRemove(banner.id);

    const timeoutId = setTimeout(() => {
      store.onBannerRemove(banner.id);
    }, ANIMATION_DURATION);

    return () => clearTimeout(timeoutId);
  }, [removing, store, banner.id]);

  const onClose = React.useCallback(() => {
    store.onRemovingChange(banner.id, true);
  }, [store, banner.id]);

  const onRemove = React.useCallback(() => {
    store.onBannerRemove(banner.id);
  }, [store, banner.id]);

  const contextValue = React.useMemo<BannerContextValue>(
    () => ({
      id: banner.id,
      variant: banner.variant,
      onClose,
    }),
    [banner.id, banner.variant, onClose],
  );

  const renderProps = React.useMemo<BannerRenderProps>(
    () => ({
      id: banner.id,
      variant: banner.variant,
      onClose,
      onRemove,
    }),
    [banner.id, banner.variant, onClose, onRemove],
  );

  const content =
    typeof banner.content === "function"
      ? banner.content(renderProps)
      : banner.content;

  const isFront = index === 0;
  const currentOffset = removing ? offsetBeforeRemoveRef.current : offset;

  const getTransform = React.useCallback(() => {
    if (!mounted) return "translateY(-100%)";
    if (removing) return `translateY(calc(${currentOffset}px - 100%))`;
    return `translateY(${currentOffset}px)`;
  }, [mounted, removing, currentOffset]);

  return (
    <BannerContext.Provider value={contextValue}>
      <div
        ref={bannerRef}
        role="status"
        aria-live="polite"
        data-slot="queued-banner"
        data-state={removing ? "closed" : "open"}
        data-mounted={mounted}
        data-removed={removing}
        data-front={isFront}
        data-index={index}
        className={cn(bannerVariants({ variant: banner.variant, className }))}
        style={
          {
            "--offset": currentOffset,
            "--opacity": mounted && !removing ? 1 : 0,
            "--index": index,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: removing ? 0 : 50 - index,
            transform: getTransform(),
            opacity: "var(--opacity)",
            transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1), opacity ${removing ? ANIMATION_DURATION / 2 : ANIMATION_DURATION}ms ease`,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {content}
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
  defaultOpen,
  onOpenChange,
  children,
  asChild,
  ...props
}: BannerProps) {
  const isControlled = openProp !== undefined;
  const openRef = useLazyRef(() => openProp ?? defaultOpen ?? true);
  const listenersRef = useLazyRef<Set<() => void>>(() => new Set());

  if (isControlled) {
    openRef.current = openProp;
  }

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
  //
  useBanner,
  useBanners,
};
