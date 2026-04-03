"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { cn } from "@/lib/utils";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";
import { Button } from "@/registry/bases/radix/ui/button";

const BANNERS_NAME = "Banners";
const BANNER_NAME = "Banner";

const BANNER_ANIMATION_DURATION = 400;
const DEFAULT_BANNER_PRIORITY = 0;
const DEFAULT_BANNER_DISMISSIBLE = true;

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

type BannerVariant = "default" | "info" | "success" | "warning" | "destructive";
type BannerSide = "top" | "bottom";

interface BannerRenderProps {
  id: string;
  variant?: BannerVariant;
  dismissible: boolean;
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

interface StoreState {
  banners: QueuedBannerItem[];
  removing: Set<string>;
  heights: Map<string, number>;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
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
    throw new Error(
      `\`${consumerName}\` must be used within \`${BANNERS_NAME}\``,
    );
  }
  return context;
}

function useStore<T>(store: Store, selector: (state: StoreState) => T): T {
  return React.useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

interface BannerContextValue {
  id?: string;
  variant?: BannerVariant;
  dismissible?: boolean;
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
  const { id, variant, dismissible, onClose } = useBannerContext("useBanner");
  const storeContext = React.useContext(StoreContext);

  return React.useMemo(() => {
    const onRemove =
      id && storeContext ? () => storeContext.onBannerRemove(id) : undefined;

    return {
      id,
      variant,
      dismissible,
      onClose,
      onRemove,
    };
  }, [id, variant, dismissible, onClose, storeContext]);
}

interface BannersProps {
  children: React.ReactNode;
  maxVisible?: number;
  side?: BannerSide;
  container?: Element | DocumentFragment | null;
}

const SideContext = React.createContext<BannerSide>("top");

function Banners({
  children,
  maxVisible = 1,
  side = "top",
  container: containerProp,
}: BannersProps) {
  const stateRef = useLazyRef<StoreState>(() => ({
    banners: [],
    removing: new Set(),
    heights: new Map(),
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
      notify: () => {
        for (const listener of listenersRef.current) {
          listener();
        }
      },
      onBannerAdd: (banner) => {
        const id = crypto.randomUUID();
        const newBanner: QueuedBannerItem = { ...banner, id };
        const priority = banner.priority ?? DEFAULT_BANNER_PRIORITY;

        const banners = [...stateRef.current.banners];
        const insertIndex = banners.findIndex(
          (b) => (b.priority ?? DEFAULT_BANNER_PRIORITY) < priority,
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

        const newRemoving = new Set(stateRef.current.removing);
        newRemoving.delete(id);
        stateRef.current.removing = newRemoving;

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
        stateRef.current.heights = new Map();
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
        if (stateRef.current.heights.get(id) === height) return;
        const newHeights = new Map(stateRef.current.heights);
        newHeights.set(id, height);
        stateRef.current.heights = newHeights;
        store.notify();
      },
      onHeightRemove: (id) => {
        if (!stateRef.current.heights.has(id)) return;
        const newHeights = new Map(stateRef.current.heights);
        newHeights.delete(id);
        stateRef.current.heights = newHeights;
        store.notify();
      },
    }),
    [stateRef, listenersRef, timeoutsRef],
  );

  const banners = useStore(store, (state) => state.banners);
  const heights = useStore(store, (state) => state.heights);
  const visibleBanners = banners.slice(0, maxVisible);
  const container = containerProp ?? globalThis.document?.body ?? null;

  const totalHeight = React.useMemo(() => {
    let total = 0;
    for (const banner of visibleBanners) {
      total += heights.get(banner.id) ?? 0;
    }
    return total;
  }, [visibleBanners, heights]);

  return (
    <StoreContext.Provider value={store}>
      <SideContext.Provider value={side}>
        {children}
        {container &&
          visibleBanners.length > 0 &&
          ReactDOM.createPortal(
            <div
              data-slot="banner-container"
              data-side={side}
              className={cn(
                "pointer-events-none fixed right-0 left-0 isolate z-50",
                side === "top" ? "top-0" : "bottom-0",
              )}
              style={{
                height: totalHeight > 0 ? totalHeight : "auto",
                transition: `height ${BANNER_ANIMATION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
              }}
            >
              {visibleBanners.map((banner, index) => (
                <QueuedBanner key={banner.id} banner={banner} index={index} />
              ))}
            </div>,
            container,
          )}
      </SideContext.Provider>
    </StoreContext.Provider>
  );
}

function useBanners() {
  const store = useStoreContext("useBanners");
  const banners = useStore(store, (state) => state.banners);

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

interface QueuedBannerProps {
  banner: QueuedBannerItem;
  index: number;
}

function QueuedBanner({ banner, index }: QueuedBannerProps) {
  const store = useStoreContext("QueuedBanner");
  const side = React.useContext(SideContext);
  const removing = useStore(store, (state) => state.removing.has(banner.id));
  const banners = useStore(store, (state) => state.banners);
  const heights = useStore(store, (state) => state.heights);

  const [mounted, setMounted] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement>(null);
  const offsetBeforeRemoveRef = React.useRef(0);

  const offset = React.useMemo(() => {
    let total = 0;
    for (const b of banners) {
      if (b.id === banner.id) break;
      total += heights.get(b.id) ?? 0;
    }
    return total;
  }, [banners, heights, banner.id]);

  if (!removing) {
    offsetBeforeRemoveRef.current = offset;
  }

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useLayoutEffect(() => {
    if (!bannerRef.current || removing) return;
    const height = bannerRef.current.getBoundingClientRect().height;
    store.onHeightChange(banner.id, height);
  }, [store, banner.id, removing]);

  React.useEffect(() => {
    if (!removing) return;
    store.onHeightRemove(banner.id);
    const timeoutId = setTimeout(
      () => store.onBannerRemove(banner.id),
      BANNER_ANIMATION_DURATION,
    );
    return () => clearTimeout(timeoutId);
  }, [removing, store, banner.id]);

  const onClose = React.useCallback(
    () => store.onRemovingChange(banner.id, true),
    [store, banner.id],
  );

  const onRemove = React.useCallback(
    () => store.onBannerRemove(banner.id),
    [store, banner.id],
  );

  const dismissible = banner.dismissible ?? DEFAULT_BANNER_DISMISSIBLE;

  const contextValue = React.useMemo<BannerContextValue>(
    () => ({ id: banner.id, variant: banner.variant, dismissible, onClose }),
    [banner.id, banner.variant, dismissible, onClose],
  );

  const renderProps = React.useMemo<BannerRenderProps>(
    () => ({
      id: banner.id,
      variant: banner.variant,
      dismissible,
      onClose,
      onRemove,
    }),
    [banner.id, banner.variant, dismissible, onClose, onRemove],
  );

  const currentOffset = removing ? offsetBeforeRemoveRef.current : offset;
  const isTop = side === "top";

  const getTransform = () => {
    if (!mounted) return isTop ? "translateY(-100%)" : "translateY(100%)";
    if (removing) {
      return isTop
        ? `translateY(calc(${currentOffset}px - 100%))`
        : `translateY(calc(-${currentOffset}px + 100%))`;
    }
    return isTop
      ? `translateY(${currentOffset}px)`
      : `translateY(-${currentOffset}px)`;
  };

  return (
    <BannerContext.Provider value={contextValue}>
      <div
        role="status"
        aria-live="polite"
        data-slot="queued-banner"
        data-state={removing ? "closed" : "open"}
        data-mounted={mounted}
        data-removed={removing}
        data-side={side}
        data-front={index === 0}
        data-index={index}
        ref={bannerRef}
        className={cn(bannerVariants({ variant: banner.variant }))}
        style={{
          position: "absolute",
          [isTop ? "top" : "bottom"]: 0,
          left: 0,
          right: 0,
          zIndex: removing ? 0 : 50 - index,
          transform: getTransform(),
          opacity: mounted && !removing ? 1 : 0,
          transition: `transform ${BANNER_ANIMATION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1), opacity ${removing ? BANNER_ANIMATION_DURATION / 2 : BANNER_ANIMATION_DURATION}ms ease`,
        }}
      >
        {typeof banner.content === "function"
          ? banner.content(renderProps)
          : banner.content}
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
      dismissible: DEFAULT_BANNER_DISMISSIBLE,
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
  onClick: onClickProp,
  className,
  children,
  asChild,
  disabled,
  ...props
}: ButtonProps) {
  const { dismissible = DEFAULT_BANNER_DISMISSIBLE, onClose } =
    useBannerContext("BannerClose");
  const ClosePrimitive = asChild ? SlotPrimitive.Slot : "button";
  const isDisabled = disabled ?? !dismissible;

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onClickProp?.(event);
      onClose?.();
    },
    [isDisabled, onClickProp, onClose],
  );

  return (
    <ClosePrimitive
      type="button"
      data-slot="banner-close"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      disabled={disabled}
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
  //
  type BannerSide,
  Banners,
  BannerTitle,
  //
  useBanner,
  useBanners,
};
