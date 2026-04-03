"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/base/hooks/use-as-ref";
import { useLazyRef } from "@/registry/bases/base/hooks/use-lazy-ref";
import { Button } from "@/registry/bases/base/ui/button";

const BANNER_ANIMATION_DURATION = 400;
const DEFAULT_BANNER_PRIORITY = 0;
const DEFAULT_BANNER_DISMISSIBLE = true;

type BannerVariant = "default" | "info" | "success" | "warning" | "destructive";
type BannerSide = "top" | "bottom";

interface DivProps
  extends useRender.ComponentProps<"div">,
    React.ComponentProps<"div"> {}

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

interface BannerData {
  id: string;
  content: BannerContent;
  variant?: BannerVariant;
  priority?: number;
  dismissible?: boolean;
  duration?: number;
  onDismiss?: () => void;
}

interface StoreState {
  banners: BannerData[];
  removing: Set<string>;
  heights: Map<string, number>;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  notify: () => void;
  onBannerAdd: (banner: Omit<BannerData, "id">) => string;
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
    throw new Error(`\`${consumerName}\` must be used within \`Banners\``);
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
  variant?: BannerVariant | null;
  dismissible?: boolean;
  onClose?: () => void;
}

const BannerContext = React.createContext<BannerContextValue | null>(null);

function useBannerContext(consumerName: string) {
  const context = React.useContext(BannerContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`Banner\``);
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
  children?: React.ReactNode;
  maxVisible?: number;
  side?: BannerSide;
  container?: Element | DocumentFragment | null;
}

function Banners(props: BannersProps) {
  const {
    children,
    maxVisible = 1,
    side = "top",
    container: containerProp,
  } = props;

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
        const newBanner: BannerData = { ...banner, id };
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
              <BannerImpl
                key={banner.id}
                banner={banner}
                side={side}
                index={index}
              />
            ))}
          </div>,
          container,
        )}
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

interface BannerImplProps {
  banner: BannerData;
  side: BannerSide;
  index: number;
}

function BannerImpl(props: BannerImplProps) {
  const { banner, side, index } = props;

  const store = useStoreContext("BannerImpl");
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

  function getTransform() {
    if (!mounted) return isTop ? "translateY(-100%)" : "translateY(100%)";
    if (removing) {
      return isTop
        ? `translateY(calc(${currentOffset}px - 100%))`
        : `translateY(calc(-${currentOffset}px + 100%))`;
    }
    return isTop
      ? `translateY(${currentOffset}px)`
      : `translateY(-${currentOffset}px)`;
  }

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
        className={bannerVariants({ variant: banner.variant })}
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
      </div>
    </BannerContext.Provider>
  );
}

interface BannerProps extends DivProps, VariantProps<typeof bannerVariants> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
  priority?: number;
  dismissible?: boolean;
  duration?: number;
}

function Banner(props: BannerProps) {
  const {
    className,
    variant = "default",
    open: openProp,
    defaultOpen,
    onOpenChange,
    onDismiss,
    priority,
    dismissible = DEFAULT_BANNER_DISMISSIBLE,
    duration,
    children,
    render,
    ...rootProps
  } = props;

  const store = React.useContext(StoreContext);

  const isInsideStore = store !== null;
  const isControlled = openProp !== undefined;

  const openRef = useLazyRef(() => openProp ?? defaultOpen ?? true);
  const listenersRef = useLazyRef<Set<() => void>>(() => new Set());
  const bannerIdRef = React.useRef<string | null>(null);
  const onDismissRef = useAsRef(onDismiss);
  const onOpenChangeRef = useAsRef(onOpenChange);

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

  React.useEffect(() => {
    if (!isInsideStore || !store || !open) return;

    const id = store.onBannerAdd({
      content: children,
      variant: variant ?? undefined,
      priority,
      dismissible,
      duration,
      onDismiss: () => {
        onDismissRef.current?.();
        onOpenChangeRef.current?.(false);
      },
    });
    bannerIdRef.current = id;

    return () => {
      if (bannerIdRef.current) {
        store.onBannerRemove(bannerIdRef.current);
        bannerIdRef.current = null;
      }
    };
  }, [
    isInsideStore,
    store,
    open,
    children,
    variant,
    priority,
    dismissible,
    duration,
    onDismissRef,
    onOpenChangeRef,
  ]);

  const onClose = React.useCallback(() => {
    if (!isControlled) {
      openRef.current = false;
      for (const listener of listenersRef.current) {
        listener();
      }
    }
    onOpenChangeRef.current?.(false);
  }, [isControlled, openRef, listenersRef, onOpenChangeRef]);

  const contextValue = React.useMemo<BannerContextValue>(
    () => ({
      variant,
      dismissible,
      onClose,
    }),
    [variant, dismissible, onClose],
  );

  const rendered = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "status",
        "aria-live": "polite",
        className: cn(bannerVariants({ variant }), className),
        children,
      },
      rootProps,
    ),
    render,
    state: {
      slot: "banner",
      state: "open",
    },
  });

  if (!open || isInsideStore) return null;

  return (
    <BannerContext.Provider value={contextValue}>
      {rendered}
    </BannerContext.Provider>
  );
}

function BannerIcon(props: DivProps) {
  const { className, render, ...iconProps } = props;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("flex shrink-0 items-center [&>svg]:size-4", className),
      },
      iconProps,
    ),
    render,
    state: {
      slot: "banner-icon",
    },
  });
}

function BannerContent(props: DivProps) {
  const { className, render, ...contentProps } = props;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("flex min-w-0 flex-1 flex-col gap-1", className),
      },
      contentProps,
    ),
    render,
    state: {
      slot: "banner-content",
    },
  });
}

function BannerTitle(props: React.ComponentProps<"div">) {
  const { className, ...titleProps } = props;

  return (
    <div
      data-slot="banner-title"
      className={cn("font-medium text-sm leading-none", className)}
      {...titleProps}
    />
  );
}

function BannerDescription(props: React.ComponentProps<"div">) {
  const { className, ...descriptionProps } = props;

  return (
    <div
      data-slot="banner-description"
      className={cn("text-xs opacity-90", className)}
      {...descriptionProps}
    />
  );
}

function BannerActions(props: DivProps) {
  const { className, render, ...actionsProps } = props;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("flex items-center gap-2", className),
      },
      actionsProps,
    ),
    render,
    state: {
      slot: "banner-actions",
    },
  });
}

function BannerClose(props: React.ComponentProps<typeof Button>) {
  const { onClick: onClickProp, disabled, children, ...closeProps } = props;

  const { dismissible = DEFAULT_BANNER_DISMISSIBLE, onClose } =
    useBannerContext("BannerClose");

  const isDisabled = disabled ?? !dismissible;

  const onClick: React.ComponentProps<typeof BannerClose>["onClick"] =
    React.useCallback(
      (event) => {
        onClickProp?.(event);
        if (event.defaultPrevented || isDisabled) return;
        onClose?.();
      },
      [onClickProp, isDisabled, onClose],
    );

  return (
    <Button
      data-slot="banner-close"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={isDisabled}
      {...closeProps}
    >
      {children ?? <X className="size-3.5" />}
    </Button>
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
  useBanners,
};
