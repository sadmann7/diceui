"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useRefWithInit } from "@base-ui/utils/useRefWithInit";
import { useValueAsRef } from "@base-ui/utils/useValueAsRef";
import { cn } from "cn";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Button } from "@/registry/bases/base/ui/button";
import { useDirection } from "@/registry/bases/base/ui/direction";

const ROOT_NAME = "SelectionWheel";
const TRIGGER_NAME = "SelectionWheelTrigger";
const CONTENT_NAME = "SelectionWheelContent";
const INDICATOR_NAME = "SelectionWheelIndicator";
const ITEM_NAME = "SelectionWheelItem";
const LABEL_NAME = "SelectionWheelLabel";

const ITEM_SELECT = "selectionWheel.itemSelect";
const INTERACT_OUTSIDE = "selectionWheel.interactOutside";
const EVENT_OPTIONS = { bubbles: true, cancelable: true };

const DEFAULT_SIZE = 240;
const DEFAULT_DEAD_ZONE = 40;
const VIEWPORT_PADDING = 8;

type Direction = "ltr" | "rtl";
type WheelType = "radio" | "menu";
type Mode = "inline" | "overlay";

interface DivProps
  extends
    Omit<React.ComponentProps<"div">, "children">,
    useRender.ComponentProps<"div"> {}

type RootElement = HTMLDivElement;
type TriggerElement = HTMLButtonElement;
type ContentElement = HTMLDivElement;
type ItemElement = HTMLDivElement;

interface InteractOutsideEvent extends CustomEvent {
  detail: {
    originalEvent: PointerEvent;
  };
}

interface Point {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Angle in degrees from the top of the wheel, clockwise, in [0, 360). */
function getAngle(from: Point, to: Point) {
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 90;
  return (angle + 360) % 360;
}

function getDistance(from: Point, to: Point) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function getIndexFromAngle(angle: number, count: number) {
  if (count === 0) return -1;
  return Math.round(angle / (360 / count)) % count;
}

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

function capturePointer(element: Element, pointerId: number) {
  if (typeof element.setPointerCapture !== "function") return;
  element.setPointerCapture(pointerId);
}

interface ItemData {
  id: string;
  value: string;
  label: string | undefined;
  disabled: boolean;
  ref: React.RefObject<ItemElement | null>;
  onSelectRef: React.RefObject<((event: Event) => void) | undefined>;
}

interface StoreState {
  open: boolean;
  value: string;
  highlightedValue: string | null;
  items: ItemData[];
  origin: Point | null;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
  registerItem: (item: ItemData) => void;
  unregisterItem: (id: string) => void;
  highlightFromPointer: (point: Point) => void;
  select: (value: string) => void;
  close: (options?: { focusTrigger?: boolean }) => void;
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

interface SelectionWheelContextValue {
  type: WheelType;
  dir: Direction;
  disabled: boolean;
  hasTrigger: boolean;
  onTriggerMount: (mounted: boolean) => void;
  contentId: string;
  rootRef: React.RefObject<RootElement | null>;
  triggerRef: React.RefObject<TriggerElement | null>;
  contentRef: React.RefObject<ContentElement | null>;
  deadZoneRef: React.RefObject<number>;
  pressingRef: React.RefObject<boolean>;
}

const SelectionWheelContext =
  React.createContext<SelectionWheelContextValue | null>(null);

function useSelectionWheelContext(consumerName: string) {
  const context = React.useContext(SelectionWheelContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface SelectionWheelProps extends Omit<DivProps, "defaultValue"> {
  type?: WheelType;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dir?: Direction;
  disabled?: boolean;
}

function SelectionWheel(props: SelectionWheelProps) {
  const {
    type = "radio",
    value: valueProp,
    defaultValue,
    onValueChange,
    open: openProp,
    defaultOpen,
    onOpenChange,
    dir: dirProp,
    disabled = false,
    render,
    className,
    ref,
    ...rootProps
  } = props;

  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;
  const contentId = React.useId();

  const rootRef = React.useRef<RootElement | null>(null);
  const composedRef = useMergedRefs(ref, rootRef);
  const triggerRef = React.useRef<TriggerElement | null>(null);
  const contentRef = React.useRef<ContentElement | null>(null);
  const deadZoneRef = React.useRef(DEFAULT_DEAD_ZONE);
  const pressingRef = React.useRef(false);

  const [hasTrigger, setHasTrigger] = React.useState(false);

  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());
  const listenersRef = useRefWithInit(() => new Set<() => void>());
  const stateRef = useRefWithInit<StoreState>(() => ({
    open: openProp ?? defaultOpen ?? false,
    value: valueProp ?? defaultValue ?? "",
    highlightedValue: null,
    items: [],
    origin: null,
  }));

  const propsRef = useValueAsRef({
    onValueChange,
    onOpenChange,
    type,
  });

  const store = React.useMemo<Store>(() => {
    const store: Store = {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "open" && typeof value === "boolean") {
          stateRef.current.open = value;
          propsRef.current.onOpenChange?.(value);
        } else if (key === "value" && typeof value === "string") {
          stateRef.current.value = value;
          propsRef.current.onValueChange?.(value);
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
      registerItem: (item) => {
        itemsRef.current.set(item.id, item);
        stateRef.current.items = getSortedItems(itemsRef.current);
        store.notify();
      },
      unregisterItem: (id) => {
        itemsRef.current.delete(id);
        stateRef.current.items = getSortedItems(itemsRef.current);
        store.notify();
      },
      highlightFromPointer: (point) => {
        const { items, origin } = stateRef.current;

        let center = origin;
        if (!center) {
          const rect = contentRef.current?.getBoundingClientRect();
          if (!rect) return;
          center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }

        let nextValue: string | null = null;
        if (getDistance(center, point) >= deadZoneRef.current) {
          const index = getIndexFromAngle(
            getAngle(center, point),
            items.length,
          );
          const item = items[index];
          if (item && !item.disabled) nextValue = item.value;
        }

        store.setState("highlightedValue", nextValue);
      },
      select: (value) => {
        const item = stateRef.current.items.find(
          (item) => item.value === value,
        );
        const element = item?.ref.current;
        if (!item || !element || item.disabled) return;

        const selectEvent = new CustomEvent(ITEM_SELECT, EVENT_OPTIONS);
        element.addEventListener(
          ITEM_SELECT,
          (event) => item.onSelectRef.current?.(event),
          { once: true },
        );
        element.dispatchEvent(selectEvent);

        if (propsRef.current.type === "radio") {
          store.setState("value", value);
        }

        if (selectEvent.defaultPrevented) return;

        store.close({ focusTrigger: true });
      },
      close: ({ focusTrigger = false } = {}) => {
        if (!stateRef.current.open) return;

        const content = contentRef.current;
        const shouldFocusTrigger =
          focusTrigger ||
          (content?.ownerDocument.activeElement &&
            content.contains(content.ownerDocument.activeElement));

        store.setState("open", false);
        store.setState("highlightedValue", null);

        if (shouldFocusTrigger) {
          triggerRef.current?.focus({ preventScroll: true });
        }
      },
    };

    return store;
  }, [listenersRef, stateRef, propsRef]);

  useIsoLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp, store]);

  useIsoLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp, store]);

  const open = useStore((state) => state.open, store);

  const contextValue = React.useMemo<SelectionWheelContextValue>(
    () => ({
      type,
      dir,
      disabled,
      hasTrigger,
      onTriggerMount: setHasTrigger,
      contentId,
      rootRef,
      triggerRef,
      contentRef,
      deadZoneRef,
      pressingRef,
    }),
    [type, dir, disabled, hasTrigger, contentId],
  );

  const element = useRender({
    defaultTagName: "div",
    ref: composedRef,
    props: mergeProps<"div">(
      {
        dir,
        className: cn("cn-selection-wheel", className),
      },
      rootProps,
    ),
    render,
    state: {
      slot: "selection-wheel",
      state: getDataState(hasTrigger ? open : true),
      disabled,
    },
  });

  return (
    <StoreContext.Provider value={store}>
      <SelectionWheelContext.Provider value={contextValue}>
        {element}
      </SelectionWheelContext.Provider>
    </StoreContext.Provider>
  );
}

function getSortedItems(items: Map<string, ItemData>) {
  return Array.from(items.values())
    .filter((item) => item.ref.current)
    .sort((a, b) => {
      const elementA = a.ref.current;
      const elementB = b.ref.current;
      if (!elementA || !elementB) return 0;
      const position = elementA.compareDocumentPosition(elementB);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
}

interface SelectionWheelTriggerProps extends Omit<
  React.ComponentProps<typeof Button>,
  | "onClick"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
> {
  onClick?: (event: React.MouseEvent<TriggerElement>) => void;
  onPointerDown?: (event: React.PointerEvent<TriggerElement>) => void;
  onPointerMove?: (event: React.PointerEvent<TriggerElement>) => void;
  onPointerUp?: (event: React.PointerEvent<TriggerElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<TriggerElement>) => void;
}

function SelectionWheelTrigger(props: SelectionWheelTriggerProps) {
  const {
    onClick: onClickProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerCancel: onPointerCancelProp,
    disabled: disabledProp,
    className,
    ref,
    ...triggerProps
  } = props;

  const store = useStoreContext(TRIGGER_NAME);
  const { type, contentId, triggerRef, pressingRef, disabled, onTriggerMount } =
    useSelectionWheelContext(TRIGGER_NAME);

  const open = useStore((state) => state.open);
  const isDisabled = disabledProp || disabled;

  const composedRef = useMergedRefs(ref, triggerRef);
  const pressRef = React.useRef<{ pointerId: number } | null>(null);

  const propsRef = useValueAsRef({
    onClick: onClickProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerCancel: onPointerCancelProp,
  });

  useIsoLayoutEffect(() => {
    onTriggerMount(true);
    return () => onTriggerMount(false);
  }, [onTriggerMount]);

  const openAt = React.useCallback(
    (origin: Point) => {
      store.setState("origin", origin);
      store.setState("highlightedValue", null);
      store.setState("open", true);
    },
    [store],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<TriggerElement>) => {
      propsRef.current.onPointerDown?.(event);
      if (event.defaultPrevented || event.button !== 0 || isDisabled) return;

      if (store.getState().open) {
        store.close();
        return;
      }

      openAt({ x: event.clientX, y: event.clientY });
      capturePointer(event.currentTarget, event.pointerId);
      pressRef.current = { pointerId: event.pointerId };
      pressingRef.current = true;
    },
    [propsRef, isDisabled, store, openAt, pressingRef],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<TriggerElement>) => {
      propsRef.current.onPointerMove?.(event);
      if (event.defaultPrevented) return;

      if (pressRef.current?.pointerId !== event.pointerId) return;

      store.highlightFromPointer({ x: event.clientX, y: event.clientY });
    },
    [propsRef, store],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<TriggerElement>) => {
      propsRef.current.onPointerUp?.(event);
      if (event.defaultPrevented) return;

      if (pressRef.current?.pointerId !== event.pointerId) return;
      pressRef.current = null;
      pressingRef.current = false;

      const { highlightedValue } = store.getState();
      if (highlightedValue !== null) {
        store.select(highlightedValue);
      }
    },
    [propsRef, store, pressingRef],
  );

  const onPointerCancel = React.useCallback(
    (event: React.PointerEvent<TriggerElement>) => {
      propsRef.current.onPointerCancel?.(event);
      pressRef.current = null;
      pressingRef.current = false;
    },
    [propsRef, pressingRef],
  );

  const onClick = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;

      // Pointer clicks are handled on pointer down; this covers keyboard and
      // programmatic clicks, which carry no coordinates.
      if (event.detail !== 0) return;

      if (store.getState().open) {
        store.close({ focusTrigger: true });
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      openAt({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    },
    [propsRef, isDisabled, store, openAt],
  );

  return (
    <Button
      type="button"
      aria-haspopup={type === "menu" ? "menu" : "dialog"}
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      data-slot="selection-wheel-trigger"
      data-state={getDataState(open)}
      disabled={isDisabled}
      {...triggerProps}
      ref={composedRef}
      className={cn("cn-selection-wheel-trigger", className)}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    />
  );
}

interface SelectionWheelContentProps extends DivProps {
  size?: number;
  deadZone?: number;
  forceMount?: boolean;
  container?: Element | DocumentFragment | null;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
}

function SelectionWheelContent(props: SelectionWheelContentProps) {
  const {
    size = DEFAULT_SIZE,
    deadZone = DEFAULT_DEAD_ZONE,
    forceMount = false,
    container,
    onEscapeKeyDown,
    onInteractOutside,
    onKeyDown: onKeyDownProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerLeave: onPointerLeaveProp,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    render,
    className,
    style,
    ref,
    ...contentProps
  } = props;

  const store = useStoreContext(CONTENT_NAME);
  const {
    type,
    dir,
    disabled,
    hasTrigger,
    contentId,
    rootRef,
    contentRef,
    deadZoneRef,
    pressingRef,
  } = useSelectionWheelContext(CONTENT_NAME);

  const mode: Mode = hasTrigger ? "overlay" : "inline";

  const storeOpen = useStore((state) => state.open);
  const open = mode === "inline" || storeOpen;
  const items = useStore((state) => state.items);
  const highlightedValue = useStore((state) => state.highlightedValue);
  const origin = useStore((state) => state.origin);

  const composedRef = useMergedRefs(ref, contentRef);
  const pressRef = React.useRef<{ pointerId: number } | null>(null);

  const propsRef = useValueAsRef({
    onEscapeKeyDown,
    onInteractOutside,
    onKeyDown: onKeyDownProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerLeave: onPointerLeaveProp,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
  });

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useIsoLayoutEffect(() => {
    deadZoneRef.current = deadZone;
  }, [deadZoneRef, deadZone]);

  // Keep the whole wheel on screen, and keep the stored origin in sync with
  // where it actually renders so pointer angles stay correct.
  useIsoLayoutEffect(() => {
    if (mode !== "overlay" || !open || !origin) return;

    const half = size / 2 + VIEWPORT_PADDING;
    const next = {
      x: clamp(origin.x, half, window.innerWidth - half),
      y: clamp(origin.y, half, window.innerHeight - half),
    };

    if (next.x !== origin.x || next.y !== origin.y) {
      store.setState("origin", next);
    }
  }, [mode, open, origin, size, store]);

  React.useEffect(() => {
    if (mode !== "overlay" || !open) return;
    contentRef.current?.focus({ preventScroll: true });
  }, [mode, open, contentRef]);

  React.useEffect(() => {
    if (mode !== "overlay" || !open) return;

    const ownerDocument =
      contentRef.current?.ownerDocument ?? globalThis?.document;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      propsRef.current.onEscapeKeyDown?.(event);
      if (event.defaultPrevented) return;

      store.close({ focusTrigger: true });
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const isInside =
        contentRef.current?.contains(target) ||
        rootRef.current?.contains(target);
      if (isInside) return;

      const interactEvent = new CustomEvent(INTERACT_OUTSIDE, {
        ...EVENT_OPTIONS,
        detail: { originalEvent: event },
      }) as InteractOutsideEvent;

      propsRef.current.onInteractOutside?.(interactEvent);
      if (interactEvent.defaultPrevented) return;

      store.close();
    };

    ownerDocument.addEventListener("keydown", onKeyDown);
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("keydown", onKeyDown);
      ownerDocument.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mode, open, contentRef, rootRef, propsRef, store]);

  const getEnabledItems = React.useCallback(
    () => store.getState().items.filter((item) => !item.disabled),
    [store],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<ContentElement>) => {
      propsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;

      const { items, highlightedValue, value } = store.getState();
      const enabledItems = getEnabledItems();
      if (enabledItems.length === 0) return;

      const currentIndex = enabledItems.findIndex(
        (item) => item.value === (highlightedValue ?? value),
      );

      const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const prevKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";

      let nextIndex: number | null = null;

      switch (event.key) {
        case nextKey:
        case "ArrowDown":
          nextIndex = (currentIndex + 1) % enabledItems.length;
          break;
        case prevKey:
        case "ArrowUp":
          nextIndex =
            currentIndex <= 0 ? enabledItems.length - 1 : currentIndex - 1;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = enabledItems.length - 1;
          break;
        case "Enter":
        case " ": {
          event.preventDefault();
          if (highlightedValue !== null) store.select(highlightedValue);
          return;
        }
        case "Escape": {
          if (mode === "inline" && highlightedValue !== null) {
            event.preventDefault();
            store.setState("highlightedValue", null);
          }
          return;
        }
        default: {
          if (/^[1-9]$/.test(event.key)) {
            const item = items[Number(event.key) - 1];
            if (item && !item.disabled) {
              event.preventDefault();
              store.setState("highlightedValue", item.value);
            }
          }
          return;
        }
      }

      event.preventDefault();
      const nextItem = enabledItems[nextIndex];
      if (nextItem) store.setState("highlightedValue", nextItem.value);
    },
    [propsRef, disabled, store, getEnabledItems, dir, mode],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<ContentElement>) => {
      propsRef.current.onPointerDown?.(event);
      if (event.defaultPrevented || event.button !== 0 || disabled) return;

      capturePointer(event.currentTarget, event.pointerId);
      pressRef.current = { pointerId: event.pointerId };
      store.highlightFromPointer({ x: event.clientX, y: event.clientY });
    },
    [propsRef, disabled, store],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<ContentElement>) => {
      propsRef.current.onPointerMove?.(event);
      if (event.defaultPrevented || disabled) return;

      store.highlightFromPointer({ x: event.clientX, y: event.clientY });
    },
    [propsRef, disabled, store],
  );

  const onPointerLeave = React.useCallback(
    (event: React.PointerEvent<ContentElement>) => {
      propsRef.current.onPointerLeave?.(event);
      if (event.defaultPrevented || pressRef.current) return;

      const ownerDocument = event.currentTarget.ownerDocument;
      if (event.currentTarget.contains(ownerDocument.activeElement)) return;

      store.setState("highlightedValue", null);
    },
    [propsRef, store],
  );

  const onClick = React.useCallback(
    (event: React.MouseEvent<ContentElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || disabled) return;

      pressRef.current = null;

      const { highlightedValue, items } = store.getState();
      if (highlightedValue !== null) {
        store.select(highlightedValue);
        return;
      }

      // Clicks without usable coordinates (assistive tech, tests) land on the
      // item element itself.
      const target = event.target as Node;
      const item = items.find((item) => item.ref.current?.contains(target));
      if (item) store.select(item.value);
    },
    [propsRef, disabled, store],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ContentElement>) => {
      propsRef.current.onFocus?.(event);
      if (event.defaultPrevented || event.target !== event.currentTarget) {
        return;
      }

      // A press on the trigger focuses the wheel too. Nothing is highlighted
      // until the pointer moves, so releasing in place picks nothing.
      if (pressingRef.current) return;

      const { highlightedValue, value } = store.getState();
      if (highlightedValue !== null) return;

      const enabledItems = getEnabledItems();
      const initial =
        enabledItems.find((item) => item.value === value) ?? enabledItems[0];
      if (initial) store.setState("highlightedValue", initial.value);
    },
    [propsRef, store, getEnabledItems, pressingRef],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<ContentElement>) => {
      propsRef.current.onBlur?.(event);
      if (event.defaultPrevented) return;

      if (event.currentTarget.contains(event.relatedTarget)) return;

      store.setState("highlightedValue", null);
    },
    [propsRef, store],
  );

  const highlightedItem = items.find((item) => item.value === highlightedValue);
  const slice = items.length > 0 ? 360 / items.length : 360;
  const radius = (deadZone + size / 2) / 2;

  const contentStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--selection-wheel-size": `${size}px`,
      "--selection-wheel-dead-zone": `${deadZone}px`,
      "--selection-wheel-radius": `${radius}px`,
      "--selection-wheel-count": items.length,
      "--selection-wheel-slice": `${slice}deg`,
      ...(mode === "overlay" && origin
        ? { left: origin.x, top: origin.y }
        : undefined),
      ...style,
    }),
    [size, deadZone, radius, items.length, slice, mode, origin, style],
  );

  const element = useRender({
    defaultTagName: "div",
    ref: composedRef,
    props: {
      ...mergeProps<"div">(
        {
          role: type === "menu" ? "menu" : "radiogroup",
          id: contentId,
          "aria-activedescendant": highlightedItem?.id,
          "aria-disabled": disabled || undefined,
          tabIndex: disabled ? -1 : 0,
          dir,
          className: cn(
            "group/selection-wheel cn-selection-wheel-content",
            className,
          ),
          style: contentStyle,
        },
        contentProps,
      ),
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerLeave,
      onClick,
      onFocus,
      onBlur,
    },
    render,
    state: {
      slot: "selection-wheel-content",
      state: getDataState(open),
      mode,
      disabled,
    },
  });

  if (mode === "inline") return element;

  if (!mounted || (!open && !forceMount)) return null;

  return ReactDOM.createPortal(element, container ?? document.body);
}

function SelectionWheelIndicator(props: DivProps) {
  const { render, className, style, ...indicatorProps } = props;

  useSelectionWheelContext(INDICATOR_NAME);
  const items = useStore((state) => state.items);
  const highlightedValue = useStore((state) => state.highlightedValue);

  const index = items.findIndex((item) => item.value === highlightedValue);
  const slice = items.length > 0 ? 360 / items.length : 360;
  const target = index < 0 ? null : index * slice;

  // Accumulate the rotation so the indicator takes the short way around when
  // the highlight wraps from the last slice to the first.
  const [rotation, setRotation] = React.useState({ target, angle: 0 });
  if (target !== null && target !== rotation.target) {
    const current = ((rotation.angle % 360) + 360) % 360;
    const delta = ((target - current + 540) % 360) - 180;
    setRotation({ target, angle: rotation.angle + delta });
  } else if (target === null && rotation.target !== null) {
    setRotation({ target: null, angle: rotation.angle });
  }

  const indicatorStyle = React.useMemo<React.CSSProperties>(
    () => ({
      rotate: `${rotation.angle}deg`,
      maskImage:
        "conic-gradient(from calc(var(--selection-wheel-slice) / -2), #000 var(--selection-wheel-slice), transparent 0), radial-gradient(circle, transparent var(--selection-wheel-dead-zone), #000 calc(var(--selection-wheel-dead-zone) + 1px))",
      maskComposite: "intersect",
      ...style,
    }),
    [rotation.angle, style],
  );

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "aria-hidden": "true",
        className: cn("cn-selection-wheel-indicator", className),
        style: indicatorStyle,
      },
      indicatorProps,
    ),
    render,
    state: {
      slot: "selection-wheel-indicator",
      state: target === null ? "inactive" : "active",
    },
  });
}

interface SelectionWheelItemProps extends Omit<DivProps, "onSelect"> {
  value: string;
  label?: string;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
}

function SelectionWheelItem(props: SelectionWheelItemProps) {
  const {
    value,
    label,
    disabled: disabledProp,
    onSelect,
    render,
    className,
    style,
    id: idProp,
    ref,
    ...itemProps
  } = props;

  const store = useStoreContext(ITEM_NAME);
  const { type, disabled: rootDisabled } = useSelectionWheelContext(ITEM_NAME);

  const instanceId = React.useId();
  const id = idProp ?? instanceId;
  const isDisabled = disabledProp || rootDisabled;

  const itemRef = React.useRef<ItemElement | null>(null);
  const composedRef = useMergedRefs(ref, itemRef);
  const onSelectRef = useValueAsRef(onSelect);

  useIsoLayoutEffect(() => {
    store.registerItem({
      id,
      value,
      label,
      disabled: isDisabled,
      ref: itemRef,
      onSelectRef,
    });
    return () => store.unregisterItem(id);
  }, [store, id, value, label, isDisabled, onSelectRef]);

  const index = useStore(
    React.useCallback(
      (state) => state.items.findIndex((item) => item.id === id),
      [id],
    ),
  );
  const count = useStore((state) => state.items.length);
  const isHighlighted = useStore(
    React.useCallback((state) => state.highlightedValue === value, [value]),
  );
  const isChecked = useStore(
    React.useCallback(
      (state) => type === "radio" && state.value === value,
      [type, value],
    ),
  );

  const slice = count > 0 ? 360 / count : 360;

  const itemStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--selection-wheel-angle": `${Math.max(index, 0) * slice}deg`,
      ...style,
    }),
    [index, slice, style],
  );

  return useRender({
    defaultTagName: "div",
    ref: composedRef,
    props: mergeProps<"div">(
      {
        role: type === "menu" ? "menuitem" : "radio",
        id,
        "aria-label": label,
        "aria-checked": type === "radio" ? isChecked : undefined,
        "aria-disabled": isDisabled || undefined,
        "aria-posinset": index >= 0 ? index + 1 : undefined,
        "aria-setsize": count > 0 ? count : undefined,
        tabIndex: -1,
        className: cn("cn-selection-wheel-item", className),
        style: itemStyle,
      },
      itemProps,
    ),
    render,
    state: {
      slot: "selection-wheel-item",
      value,
      state: isChecked ? "checked" : "unchecked",
      highlighted: isHighlighted,
      disabled: isDisabled,
    },
  });
}

function SelectionWheelLabel(props: DivProps) {
  const { render, className, children, ...labelProps } = props;

  const { type } = useSelectionWheelContext(LABEL_NAME);

  const label = useStore(
    React.useCallback(
      (state) => {
        const current =
          state.items.find((item) => item.value === state.highlightedValue) ??
          (type === "radio"
            ? state.items.find((item) => item.value === state.value)
            : undefined);
        return current?.label ?? current?.value ?? null;
      },
      [type],
    ),
  );

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "aria-hidden": "true",
        className: cn("cn-selection-wheel-label", className),
        children: label ?? children,
      },
      labelProps,
    ),
    render,
    state: {
      slot: "selection-wheel-label",
      state: label === null ? "empty" : "filled",
    },
  });
}

export {
  SelectionWheel,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
  type SelectionWheelProps,
  SelectionWheelTrigger,
};
