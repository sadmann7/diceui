"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ReactStore, useStore } from "@base-ui/utils/store";
import { useAnimationFrame } from "@base-ui/utils/useAnimationFrame";
import { useControlled } from "@base-ui/utils/useControlled";
import { useStableCallback } from "@base-ui/utils/useStableCallback";
import { useTimeout } from "@base-ui/utils/useTimeout";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Button } from "@/registry/bases/base/ui/button";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const BANNER_ANIMATION_DURATION = 400;
const DEFAULT_BANNER_PRIORITY = 0;
const DEFAULT_BANNER_DISMISSIBLE = true;

type BannerVariant = "default" | "info" | "success" | "warning" | "destructive";
type BannerSide = "top" | "bottom";
type BannerStrategy = "fixed" | "static" | "sticky" | "absolute";

interface DivProps
  extends useRender.ComponentProps<"div">, React.ComponentProps<"div"> {}

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
  duration?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
}

interface StoreState {
  banners: BannerData[];
  removing: Set<string>;
  heights: Map<string, number>;
}

interface StoreController {
  timeouts: Map<string, ReturnType<typeof setTimeout>>;
}

const selectors = {
  banners: (state: StoreState) => state.banners,
  heights: (state: StoreState) => state.heights,
  isRemoving: (state: StoreState, id: string) => state.removing.has(id),
};

type Store = ReactStore<StoreState, StoreController, typeof selectors>;

function addBanner(store: Store, banner: Omit<BannerData, "id">) {
  const id = crypto.randomUUID();
  const newBanner: BannerData = { ...banner, id };
  const priority = banner.priority ?? DEFAULT_BANNER_PRIORITY;

  const banners = [...store.state.banners];
  const insertIndex = banners.findIndex(
    (b) => (b.priority ?? DEFAULT_BANNER_PRIORITY) < priority,
  );

  if (insertIndex === -1) {
    banners.push(newBanner);
  } else {
    banners.splice(insertIndex, 0, newBanner);
  }

  store.set("banners", banners);

  if (banner.duration && banner.duration > 0) {
    const timeoutId = setTimeout(() => {
      setRemoving(store, id, true);
      store.context.timeouts.delete(id);
    }, banner.duration);
    store.context.timeouts.set(id, timeoutId);
  }

  return id;
}

function removeBanner(store: Store, id: string) {
  const banner = store.state.banners.find((b) => b.id === id);
  if (!banner) return;

  const timeoutId = store.context.timeouts.get(id);
  if (timeoutId) {
    clearTimeout(timeoutId);
    store.context.timeouts.delete(id);
  }

  const removing = new Set(store.state.removing);
  removing.delete(id);

  banner.onDismiss?.();
  store.update({
    removing,
    banners: store.state.banners.filter((b) => b.id !== id),
  });
}

function clearBanners(store: Store) {
  for (const timeoutId of store.context.timeouts.values()) {
    clearTimeout(timeoutId);
  }
  store.context.timeouts.clear();
  store.update({ removing: new Set(), heights: new Map(), banners: [] });
}

function setRemoving(store: Store, id: string, value: boolean) {
  const removing = new Set(store.state.removing);
  if (value) {
    removing.add(id);
  } else {
    removing.delete(id);
  }
  store.set("removing", removing);
}

function setHeight(store: Store, id: string, height: number) {
  if (store.state.heights.get(id) === height) return;
  store.set("heights", new Map(store.state.heights).set(id, height));
}

function removeHeight(store: Store, id: string) {
  if (!store.state.heights.has(id)) return;
  const heights = new Map(store.state.heights);
  heights.delete(id);
  store.set("heights", heights);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`Banners\``);
  }
  return context;
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
      id && storeContext ? () => removeBanner(storeContext, id) : undefined;

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
  strategy?: BannerStrategy;
  container?: Element | DocumentFragment | null;
}

function Banners(props: BannersProps) {
  const {
    children,
    maxVisible = 1,
    side = "top",
    strategy = "fixed",
    container: containerProp,
  } = props;

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreController, typeof selectors>(
        { banners: [], removing: new Set(), heights: new Map() },
        { timeouts: new Map() },
        selectors,
      ),
  );

  const banners = useStore(store, selectors.banners);
  const heights = useStore(store, selectors.heights);
  const visibleBanners = banners.slice(0, maxVisible);

  const withPortal = strategy === "fixed" || strategy === "absolute";
  const container = withPortal
    ? (containerProp ?? globalThis.document?.body ?? null)
    : null;

  const totalHeight = React.useMemo(() => {
    let total = 0;
    for (const banner of visibleBanners) {
      total += heights.get(banner.id) ?? 0;
    }
    return total;
  }, [visibleBanners, heights]);

  const bannerContainer = visibleBanners.length > 0 && (
    <div
      data-slot="banner-container"
      data-side={side}
      data-strategy={strategy}
      className={cn(
        "cn-banner-container",
        strategy === "fixed" && "fixed",
        strategy === "static" && "relative",
        strategy === "sticky" && "sticky",
        strategy === "absolute" && "absolute",
        side === "top" ? "top-0" : "bottom-0",
      )}
      style={{
        height: totalHeight > 0 ? totalHeight : "auto",
        transition: `height ${BANNER_ANIMATION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
      }}
    >
      {visibleBanners.map((banner, index) => (
        <BannerImpl key={banner.id} banner={banner} side={side} index={index} />
      ))}
    </div>
  );

  return (
    <StoreContext.Provider value={store}>
      {strategy === "static" || strategy === "sticky" ? (
        <>
          {side === "top" && bannerContainer}
          {children}
          {side === "bottom" && bannerContainer}
        </>
      ) : (
        <>
          {children}
          {container &&
            bannerContainer &&
            ReactDOM.createPortal(bannerContainer, container)}
        </>
      )}
    </StoreContext.Provider>
  );
}

function useBanners() {
  const store = useStoreContext("useBanners");
  const banners = useStore(store, selectors.banners);

  return React.useMemo(
    () => ({
      onBannerAdd: (banner: Omit<BannerData, "id">) => addBanner(store, banner),
      onBannerRemove: (id: string) => removeBanner(store, id),
      onBannersClear: () => clearBanners(store),
      banners,
    }),
    [store, banners],
  );
}

const bannerVariants = cva("cn-banner", {
  variants: {
    variant: {
      default: "cn-banner-variant-default",
      info: "cn-banner-variant-info",
      success: "cn-banner-variant-success",
      warning: "cn-banner-variant-warning",
      destructive: "cn-banner-variant-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BannerImplProps {
  banner: BannerData;
  side: BannerSide;
  index: number;
}

function BannerImpl(props: BannerImplProps) {
  const { banner, side, index } = props;

  const store = useStoreContext("BannerImpl");
  const removing = useStore(store, selectors.isRemoving, banner.id);
  const banners = useStore(store, selectors.banners);
  const heights = useStore(store, selectors.heights);

  const [mounted, setMounted] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement>(null);

  const offset = React.useMemo(() => {
    let total = 0;
    for (const b of banners) {
      if (b.id === banner.id) break;
      total += heights.get(b.id) ?? 0;
    }
    return total;
  }, [banners, heights, banner.id]);

  const [offsetBeforeRemove, setOffsetBeforeRemove] = React.useState(offset);

  if (!removing && offsetBeforeRemove !== offset) {
    setOffsetBeforeRemove(offset);
  }

  const mountFrame = useAnimationFrame();
  const removeTimeout = useTimeout();

  React.useEffect(() => {
    mountFrame.request(() => setMounted(true));
    return mountFrame.cancel;
  }, [mountFrame]);

  React.useLayoutEffect(() => {
    if (!bannerRef.current || removing) return;
    const height = bannerRef.current.getBoundingClientRect().height;
    setHeight(store, banner.id, height);
  }, [store, banner.id, removing]);

  React.useEffect(() => {
    if (!removing) return;
    removeHeight(store, banner.id);
    removeTimeout.start(BANNER_ANIMATION_DURATION, () =>
      removeBanner(store, banner.id),
    );
    return removeTimeout.clear;
  }, [removing, store, banner.id, removeTimeout]);

  const onClose = React.useCallback(
    () => setRemoving(store, banner.id, true),
    [store, banner.id],
  );

  const onRemove = React.useCallback(
    () => removeBanner(store, banner.id),
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

  const currentOffset = removing ? offsetBeforeRemove : offset;
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
  duration?: number;
  dismissible?: boolean;
}

function Banner(props: BannerProps) {
  const {
    className,
    variant = "default",
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    onDismiss,
    priority,
    duration,
    dismissible = DEFAULT_BANNER_DISMISSIBLE,
    children,
    render,
    ...rootProps
  } = props;

  const store = React.useContext(StoreContext);

  const isInsideStore = store !== null;

  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen,
    name: "Banner",
    state: "open",
  });
  const bannerIdRef = React.useRef<string | null>(null);
  const onQueuedDismiss = useStableCallback(() => {
    onDismiss?.();
    onOpenChange?.(false);
  });

  React.useEffect(() => {
    if (!isInsideStore || !store || !open) return;

    const id = addBanner(store, {
      content: children,
      variant: variant ?? undefined,
      priority,
      dismissible,
      duration,
      onDismiss: onQueuedDismiss,
    });
    bannerIdRef.current = id;

    return () => {
      if (bannerIdRef.current) {
        removeBanner(store, bannerIdRef.current);
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
    onQueuedDismiss,
  ]);

  const onClose = React.useCallback(() => {
    onOpenChange?.(false);
    setOpenState(false);
  }, [onOpenChange, setOpenState]);

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
        className: cn("cn-banner-icon", className),
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
        className: cn("cn-banner-content", className),
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
      className={cn("cn-banner-title cn-font-heading", className)}
      {...titleProps}
    />
  );
}

function BannerDescription(props: React.ComponentProps<"div">) {
  const { className, ...descriptionProps } = props;

  return (
    <div
      data-slot="banner-description"
      className={cn("cn-banner-description", className)}
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
        className: cn("cn-banner-actions", className),
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
      {children ?? (
        <IconPlaceholder
          lucide="X"
          tabler="IconX"
          hugeicons="Cancel01Icon"
          phosphor="XIcon"
          remixicon="RiCloseLine"
          className="cn-banner-close"
        />
      )}
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
