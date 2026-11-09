"use client";

import { cn } from "cn";
import {
  Direction as DirectionPrimitive,
  Popover as PopoverPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import { useComposedRefs, useLayoutEffect } from "radix-ui/internal";
import * as React from "react";

import { useRefWithInit } from "@/registry/bases/radix/hooks/use-ref-with-init";
import { useValueAsRef } from "@/registry/bases/radix/hooks/use-value-as-ref";
import { Button } from "@/registry/bases/radix/ui/button";

const ROOT_NAME = "SelectionWheel";
const TRIGGER_NAME = "SelectionWheelTrigger";
const AREA_NAME = "SelectionWheelArea";
const CONTENT_NAME = "SelectionWheelContent";
const INDICATOR_NAME = "SelectionWheelIndicator";
const ITEM_NAME = "SelectionWheelItem";
const LABEL_NAME = "SelectionWheelLabel";
const SUB_NAME = "SelectionWheelSub";
const SUB_TRIGGER_NAME = "SelectionWheelSubTrigger";
const SUB_CONTENT_NAME = "SelectionWheelSubContent";

const ITEM_SELECT = "selectionWheel.itemSelect";
const EVENT_OPTIONS = { bubbles: true, cancelable: true };

const DEFAULT_SIZE = 240;
const DEFAULT_DEAD_ZONE = 40;
const VIEWPORT_PADDING = 8;
const PRESS_SLOP = 6;

type Direction = "ltr" | "rtl";
type WheelType = "radio" | "menu";
type Mode = "inline" | "overlay";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof SelectionWheel>;
type TriggerElement = HTMLButtonElement;
type AreaElement = React.ComponentRef<typeof SelectionWheelArea>;
type ContentElement = React.ComponentRef<typeof SelectionWheelContent>;
type ItemElement = React.ComponentRef<typeof SelectionWheelItem>;

type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
>;
type PointerDownOutsideEvent = Parameters<
  NonNullable<PopoverContentProps["onPointerDownOutside"]>
>[0];
type FocusOutsideEvent = Parameters<
  NonNullable<PopoverContentProps["onFocusOutside"]>
>[0];

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
  group: string;
  subId: string | null;
  ref: React.RefObject<ItemElement | null>;
  onSelectRef: React.RefObject<((event: Event) => void) | undefined>;
}

interface StoreState {
  open: boolean;
  value: string;
  highlightedValue: string | null;
  items: ItemData[];
  path: string[];
  origin: Point | null;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
  registerItem: (item: ItemData) => void;
  unregisterItem: (id: string) => void;
  openAt: (point: Point) => void;
  enterSub: (subId: string) => void;
  back: () => boolean;
  resetPath: () => void;
  getItem: (value: string) => ItemData | undefined;
  getSubTrigger: (subId: string) => ItemData | undefined;
  isWithin: (subId: string, value: string) => boolean;
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
  areaRef: React.RefObject<AreaElement | null>;
  contentRef: React.RefObject<ContentElement | null>;
  deadZoneRef: React.RefObject<number>;
  pressingRef: React.RefObject<boolean>;
  triggerRenderedRef: React.RefObject<boolean>;
}

const SelectionWheelContext =
  React.createContext<SelectionWheelContextValue | null>(null);

const GroupContext = React.createContext("");
const SubContext = React.createContext<string | null>(null);
const SubTriggerContext = React.createContext<string | null>(null);

function useSubContext(consumerName: string) {
  const context = React.useContext(SubContext);
  if (context === null) {
    throw new Error(`\`${consumerName}\` must be used within \`${SUB_NAME}\``);
  }
  return context;
}

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
    asChild,
    className,
    ref,
    ...rootProps
  } = props;

  const dir = DirectionPrimitive.useDirection(dirProp);
  const contentId = React.useId();

  const rootRef = React.useRef<RootElement | null>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const triggerRef = React.useRef<TriggerElement | null>(null);
  const areaRef = React.useRef<AreaElement | null>(null);
  const contentRef = React.useRef<ContentElement | null>(null);
  const deadZoneRef = React.useRef(DEFAULT_DEAD_ZONE);
  const pressingRef = React.useRef(false);
  const triggerRenderedRef = React.useRef(false);

  const [hasTrigger, setHasTrigger] = React.useState(false);

  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());
  const listenersRef = useRefWithInit(() => new Set<() => void>());
  const stateRef = useRefWithInit<StoreState>(() => ({
    open: openProp ?? defaultOpen ?? false,
    value: valueProp ?? defaultValue ?? "",
    highlightedValue: null,
    items: [],
    path: [],
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
        stateRef.current.items = getSortedItems(
          itemsRef.current,
          getActiveGroup(stateRef.current.path),
        );
        store.notify();
      },
      unregisterItem: (id) => {
        itemsRef.current.delete(id);
        stateRef.current.items = getSortedItems(
          itemsRef.current,
          getActiveGroup(stateRef.current.path),
        );
        store.notify();
      },
      enterSub: (subId) => {
        const path = [...stateRef.current.path, subId];
        stateRef.current.path = path;
        stateRef.current.items = getSortedItems(itemsRef.current, subId);
        stateRef.current.highlightedValue = null;
        store.notify();
      },
      back: () => {
        if (stateRef.current.path.length === 0) return false;
        const path = stateRef.current.path.slice(0, -1);
        stateRef.current.path = path;
        stateRef.current.items = getSortedItems(
          itemsRef.current,
          getActiveGroup(path),
        );
        stateRef.current.highlightedValue = null;
        store.notify();
        return true;
      },
      resetPath: () => {
        if (stateRef.current.path.length === 0) return;
        stateRef.current.path = [];
        stateRef.current.items = getSortedItems(itemsRef.current, "");
        store.notify();
      },
      getItem: (value) => {
        for (const item of itemsRef.current.values()) {
          if (item.value === value && item.subId === null) return item;
        }
        return undefined;
      },
      getSubTrigger: (subId) => {
        for (const item of itemsRef.current.values()) {
          if (item.subId === subId) return item;
        }
        return undefined;
      },
      isWithin: (subId, value) => {
        let group = store.getItem(value)?.group;
        while (group) {
          if (group === subId) return true;
          group = store.getSubTrigger(group)?.group;
        }
        return false;
      },
      openAt: (point) => {
        store.resetPath();
        store.setState("origin", point);
        store.setState("highlightedValue", null);
        store.setState("open", true);
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

        if (item.subId !== null) {
          store.enterSub(item.subId);
          return;
        }

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
          (triggerRef.current ?? areaRef.current)?.focus({
            preventScroll: true,
          });
        }
      },
    };

    return store;
  }, [listenersRef, stateRef, propsRef]);

  useLayoutEffect(() => {
    if (openProp === undefined) return;

    if (!openProp) {
      store.close();
      return;
    }

    if (!store.getState().open) {
      store.resetPath();
      store.setState("origin", null);
    }
    store.setState("open", true);
  }, [openProp, store]);

  useLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp, store]);

  const open = useStore((state) => state.open, store);

  const onPopoverOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) store.close();
    },
    [store],
  );

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
      areaRef,
      contentRef,
      deadZoneRef,
      pressingRef,
      triggerRenderedRef,
    }),
    [type, dir, disabled, hasTrigger, contentId],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <SelectionWheelContext.Provider value={contextValue}>
        <PopoverPrimitive.Root
          open={hasTrigger && open}
          onOpenChange={onPopoverOpenChange}
        >
          <RootPrimitive
            data-slot="selection-wheel"
            data-state={getDataState(hasTrigger ? open : true)}
            data-disabled={disabled ? "" : undefined}
            dir={dir}
            {...rootProps}
            ref={composedRef}
            className={cn("cn-selection-wheel", className)}
          />
        </PopoverPrimitive.Root>
      </SelectionWheelContext.Provider>
    </StoreContext.Provider>
  );
}

function getActiveGroup(path: string[]) {
  return path[path.length - 1] ?? "";
}

function getSortedItems(items: Map<string, ItemData>, group: string) {
  return Array.from(items.values())
    .filter((item) => item.group === group && item.ref.current)
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

interface SelectionWheelTriggerProps extends React.ComponentProps<
  typeof Button
> {}

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
  const {
    type,
    contentId,
    triggerRef,
    contentRef,
    pressingRef,
    triggerRenderedRef,
    disabled,
    onTriggerMount,
  } = useSelectionWheelContext(TRIGGER_NAME);

  triggerRenderedRef.current = true;

  const open = useStore((state) => state.open);
  const isDisabled = disabledProp || disabled;

  const composedRef = useComposedRefs(ref, triggerRef);
  const pressRef = React.useRef<{
    pointerId: number;
    start: Point;
    moved: boolean;
  } | null>(null);

  const propsRef = useValueAsRef({
    onClick: onClickProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerCancel: onPointerCancelProp,
  });

  useLayoutEffect(() => {
    onTriggerMount(true);
    return () => {
      triggerRenderedRef.current = false;
      onTriggerMount(false);
    };
  }, [onTriggerMount, triggerRenderedRef]);

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<TriggerElement>) => {
      propsRef.current.onPointerDown?.(event);
      if (event.defaultPrevented || event.button !== 0 || isDisabled) return;

      if (store.getState().open) {
        store.close();
        return;
      }

      store.openAt({ x: event.clientX, y: event.clientY });
      capturePointer(event.currentTarget, event.pointerId);
      pressRef.current = {
        pointerId: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
        moved: false,
      };
      pressingRef.current = true;
    },
    [propsRef, isDisabled, store, pressingRef],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<TriggerElement>) => {
      propsRef.current.onPointerMove?.(event);
      if (event.defaultPrevented) return;

      const press = pressRef.current;
      if (press?.pointerId !== event.pointerId) return;

      const point = { x: event.clientX, y: event.clientY };

      if (!press.moved) {
        if (getDistance(press.start, point) < PRESS_SLOP) return;
        press.moved = true;
      }

      store.highlightFromPointer(point);
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
      if (highlightedValue !== null) store.select(highlightedValue);

      if (store.getState().open) {
        contentRef.current?.focus({ preventScroll: true });
      }
    },
    [propsRef, store, pressingRef, contentRef],
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
      store.openAt({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    },
    [propsRef, isDisabled, store],
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

interface SelectionWheelAreaProps extends DivProps {
  openKey?: string;
  disabled?: boolean;
}

function SelectionWheelArea(props: SelectionWheelAreaProps) {
  const {
    openKey,
    disabled: disabledProp,
    onContextMenu: onContextMenuProp,
    onKeyDown: onKeyDownProp,
    onPointerMove: onPointerMoveProp,
    asChild,
    className,
    ref,
    ...areaProps
  } = props;

  const store = useStoreContext(AREA_NAME);
  const {
    areaRef,
    contentRef,
    pressingRef,
    triggerRenderedRef,
    disabled,
    onTriggerMount,
  } = useSelectionWheelContext(AREA_NAME);

  triggerRenderedRef.current = true;

  const open = useStore((state) => state.open);
  const isDisabled = disabledProp || disabled;

  const composedRef = useComposedRefs(ref, areaRef);
  const pointRef = React.useRef<Point | null>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  const propsRef = useValueAsRef({
    onContextMenu: onContextMenuProp,
    onKeyDown: onKeyDownProp,
    onPointerMove: onPointerMoveProp,
  });

  useLayoutEffect(() => {
    onTriggerMount(true);
    return () => {
      triggerRenderedRef.current = false;
      onTriggerMount(false);
    };
  }, [onTriggerMount, triggerRenderedRef]);

  React.useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  const track = React.useCallback(
    (start: Point, key?: string) => {
      cleanupRef.current?.();

      const ownerDocument = areaRef.current?.ownerDocument ?? document;
      let moved = false;
      pressingRef.current = true;

      const onPointerMove = (event: PointerEvent) => {
        const point = { x: event.clientX, y: event.clientY };
        if (!moved) {
          if (getDistance(start, point) < PRESS_SLOP) return;
          moved = true;
        }
        store.highlightFromPointer(point);
      };

      const finish = () => {
        cleanup();
        pressingRef.current = false;

        const { highlightedValue } = store.getState();
        if (highlightedValue !== null) {
          store.select(highlightedValue);
        } else if (key) {
          store.close({ focusTrigger: true });
          return;
        }

        if (store.getState().open) {
          contentRef.current?.focus({ preventScroll: true });
        }
      };

      const onRelease = (event: PointerEvent | KeyboardEvent) => {
        if (key && (!("key" in event) || event.key !== key)) return;
        finish();
      };

      const releaseEvent = key ? "keyup" : "pointerup";

      function cleanup() {
        ownerDocument.removeEventListener("pointermove", onPointerMove);
        ownerDocument.removeEventListener(releaseEvent, onRelease);
        cleanupRef.current = null;
      }

      ownerDocument.addEventListener("pointermove", onPointerMove);
      ownerDocument.addEventListener(releaseEvent, onRelease);
      cleanupRef.current = () => {
        cleanup();
        pressingRef.current = false;
      };
    },
    [areaRef, contentRef, pressingRef, store],
  );

  const onContextMenu = React.useCallback(
    (event: React.MouseEvent<AreaElement>) => {
      propsRef.current.onContextMenu?.(event);
      if (event.defaultPrevented || isDisabled) return;

      event.preventDefault();

      const point = { x: event.clientX, y: event.clientY };
      store.openAt(point);

      if (event.buttons !== 0) track(point);
    },
    [propsRef, isDisabled, store, track],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<AreaElement>) => {
      propsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented || isDisabled || !openKey) return;
      if (event.key !== openKey) return;

      event.preventDefault();
      if (event.repeat || store.getState().open) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const point = pointRef.current ?? {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      store.openAt(point);
      track(point, openKey);
    },
    [propsRef, isDisabled, openKey, store, track],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<AreaElement>) => {
      propsRef.current.onPointerMove?.(event);
      pointRef.current = { x: event.clientX, y: event.clientY };
    },
    [propsRef],
  );

  const AreaPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <AreaPrimitive
      tabIndex={openKey && !isDisabled ? 0 : undefined}
      data-slot="selection-wheel-area"
      data-state={getDataState(open)}
      data-disabled={isDisabled ? "" : undefined}
      {...areaProps}
      ref={composedRef}
      className={cn("cn-selection-wheel-area", className)}
      onContextMenu={onContextMenu}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
    />
  );
}

interface SelectionWheelContentProps extends DivProps {
  size?: number;
  deadZone?: number;
  forceMount?: boolean;
  container?: Element | DocumentFragment | null;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: PointerDownOutsideEvent) => void;
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
    onPointerUp: onPointerUpProp,
    onPointerCancel: onPointerCancelProp,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    asChild,
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
    triggerRef,
    areaRef,
    pressingRef,
    triggerRenderedRef,
  } = useSelectionWheelContext(CONTENT_NAME);

  const mode: Mode =
    hasTrigger || triggerRenderedRef.current ? "overlay" : "inline";

  const storeOpen = useStore((state) => state.open);
  const open = mode === "inline" || storeOpen;
  const items = useStore((state) => state.items);
  const highlightedValue = useStore((state) => state.highlightedValue);
  const origin = useStore((state) => state.origin);

  const composedRef = useComposedRefs(ref, contentRef);
  const pressRef = React.useRef<{ pointerId: number; start: Point } | null>(
    null,
  );
  const skipClickRef = React.useRef(false);

  const propsRef = useValueAsRef({
    onEscapeKeyDown,
    onInteractOutside,
    onKeyDown: onKeyDownProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerLeave: onPointerLeaveProp,
    onPointerUp: onPointerUpProp,
    onPointerCancel: onPointerCancelProp,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
  });

  useLayoutEffect(() => {
    deadZoneRef.current = deadZone;
  }, [deadZoneRef, deadZone]);

  useLayoutEffect(() => {
    if (mode !== "overlay" || !open || origin) return;

    const rect = (
      triggerRef.current ?? areaRef.current
    )?.getBoundingClientRect();
    store.setState(
      "origin",
      rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    );
  }, [mode, open, origin, triggerRef, areaRef, store]);

  // Keep the whole wheel on screen, and keep the stored origin in sync with
  // where it actually renders so pointer angles stay correct.
  useLayoutEffect(() => {
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

  const anchorRef = React.useRef({
    getBoundingClientRect: () => {
      const { x, y } = store.getState().origin ?? { x: 0, y: 0 };
      return DOMRect.fromRect({ x, y, width: 0, height: 0 });
    },
  });

  const onOpenAutoFocus = React.useCallback(
    (event: Event) => {
      event.preventDefault();
      contentRef.current?.focus({ preventScroll: true });
    },
    [contentRef],
  );

  const onCloseAutoFocus = React.useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  const onEscapeKeyDownHandler = React.useCallback(
    (event: KeyboardEvent) => {
      if (store.back()) {
        event.preventDefault();
        return;
      }
      propsRef.current.onEscapeKeyDown?.(event);
    },
    [propsRef, store],
  );

  const onPointerDownOutside = React.useCallback(
    (event: PointerDownOutsideEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        event.preventDefault();
        return;
      }

      propsRef.current.onInteractOutside?.(event);
    },
    [rootRef, propsRef],
  );

  const onFocusOutside = React.useCallback(
    (event: FocusOutsideEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        event.preventDefault();
      }
    },
    [rootRef],
  );

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
        case "Tab": {
          if (mode === "overlay") {
            event.preventDefault();
            store.close({ focusTrigger: true });
          }
          return;
        }
        case "Backspace": {
          if (store.back()) event.preventDefault();
          return;
        }
        case "Escape": {
          if (store.back()) {
            event.preventDefault();
            return;
          }
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
      pressRef.current = {
        pointerId: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
      };
      skipClickRef.current = false;
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

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<ContentElement>) => {
      propsRef.current.onPointerUp?.(event);
      if (event.defaultPrevented || disabled) return;

      const press = pressRef.current;
      if (press?.pointerId !== event.pointerId) return;

      if (event.pointerType === "mouse") return;

      const point = { x: event.clientX, y: event.clientY };
      if (getDistance(press.start, point) < PRESS_SLOP) return;

      pressRef.current = null;

      const { highlightedValue } = store.getState();
      if (highlightedValue === null) return;

      skipClickRef.current = true;
      store.select(highlightedValue);
    },
    [propsRef, disabled, store],
  );

  const onPointerCancel = React.useCallback(
    (event: React.PointerEvent<ContentElement>) => {
      propsRef.current.onPointerCancel?.(event);
      pressRef.current = null;

      const ownerDocument = event.currentTarget.ownerDocument;
      if (event.currentTarget.contains(ownerDocument.activeElement)) return;

      store.setState("highlightedValue", null);
    },
    [propsRef, store],
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

      if (skipClickRef.current) {
        skipClickRef.current = false;
        return;
      }

      const { highlightedValue, items, path } = store.getState();
      if (highlightedValue !== null) {
        store.select(highlightedValue);
        return;
      }

      // Clicks without usable coordinates (assistive tech, tests) land on the
      // item element itself.
      const target = event.target as Node;
      const item = items.find((item) => item.ref.current?.contains(target));
      if (item) {
        store.select(item.value);
        return;
      }

      if (path.length > 0 && event.detail !== 0) {
        const rect = event.currentTarget.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        const point = { x: event.clientX, y: event.clientY };
        if (getDistance(center, point) < deadZone) store.back();
      }
    },
    [propsRef, disabled, store, deadZone],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ContentElement>) => {
      propsRef.current.onFocus?.(event);
      if (event.defaultPrevented || event.target !== event.currentTarget) {
        return;
      }

      // A press on the trigger focuses the wheel too. Nothing is highlighted
      // until the pointer moves, so releasing in place picks nothing.
      if (pressingRef.current || pressRef.current) return;

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
      ...style,
    }),
    [size, deadZone, radius, items.length, slice, style],
  );

  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";

  const content = (
    <ContentPrimitive
      role={type === "menu" ? "menu" : "radiogroup"}
      id={contentId}
      aria-activedescendant={highlightedItem?.id}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      data-slot="selection-wheel-content"
      data-state={getDataState(open)}
      data-mode={mode}
      data-disabled={disabled ? "" : undefined}
      dir={dir}
      {...contentProps}
      ref={composedRef}
      className={cn(
        "group/selection-wheel cn-selection-wheel-content",
        className,
      )}
      style={contentStyle}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );

  if (mode === "inline") return content;

  return (
    <>
      <PopoverPrimitive.Anchor virtualRef={anchorRef} />
      <PopoverPrimitive.Portal
        container={container}
        forceMount={forceMount || undefined}
      >
        <PopoverPrimitive.Content
          asChild
          forceMount={forceMount || undefined}
          side="bottom"
          sideOffset={-size / 2}
          align="center"
          avoidCollisions={false}
          updatePositionStrategy="always"
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          onEscapeKeyDown={onEscapeKeyDownHandler}
          onPointerDownOutside={onPointerDownOutside}
          onFocusOutside={onFocusOutside}
        >
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </>
  );
}

function SelectionWheelIndicator(props: DivProps) {
  const { asChild, className, style, ...indicatorProps } = props;

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

  const IndicatorPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <IndicatorPrimitive
      aria-hidden="true"
      data-slot="selection-wheel-indicator"
      data-state={target === null ? "inactive" : "active"}
      {...indicatorProps}
      className={cn("cn-selection-wheel-indicator", className)}
      style={indicatorStyle}
    />
  );
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
    asChild,
    className,
    style,
    id: idProp,
    ref,
    ...itemProps
  } = props;

  const store = useStoreContext(ITEM_NAME);
  const { type, disabled: rootDisabled } = useSelectionWheelContext(ITEM_NAME);
  const group = React.useContext(GroupContext);
  const subId = React.useContext(SubTriggerContext);

  const instanceId = React.useId();
  const id = idProp ?? instanceId;
  const isDisabled = disabledProp || rootDisabled;

  const itemRef = React.useRef<ItemElement | null>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const onSelectRef = useValueAsRef(onSelect);

  useLayoutEffect(() => {
    store.registerItem({
      id,
      value,
      label,
      disabled: isDisabled,
      group,
      subId,
      ref: itemRef,
      onSelectRef,
    });
    return () => store.unregisterItem(id);
  }, [store, id, value, label, isDisabled, group, subId, onSelectRef]);

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
      (state) =>
        type === "radio" &&
        (subId === null
          ? state.value === value
          : store.isWithin(subId, state.value)),
      [type, value, subId, store],
    ),
  );
  const isActiveGroup = useStore(
    React.useCallback((state) => getActiveGroup(state.path) === group, [group]),
  );

  const slice = count > 0 ? 360 / count : 360;

  const itemStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--selection-wheel-angle": `${Math.max(index, 0) * slice}deg`,
      ...(!isActiveGroup
        ? { display: "none" }
        : index < 0
          ? { visibility: "hidden" }
          : undefined),
      ...style,
    }),
    [index, slice, isActiveGroup, style],
  );

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPrimitive
      role={type === "menu" ? "menuitem" : "radio"}
      id={id}
      aria-label={label}
      aria-checked={type === "radio" ? isChecked : undefined}
      aria-haspopup={subId !== null && type === "menu" ? "menu" : undefined}
      aria-disabled={isDisabled || undefined}
      aria-posinset={index >= 0 ? index + 1 : undefined}
      aria-setsize={count > 0 ? count : undefined}
      tabIndex={-1}
      data-slot="selection-wheel-item"
      data-value={value}
      data-state={isChecked ? "checked" : "unchecked"}
      data-highlighted={isHighlighted ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      data-sub={subId !== null ? "" : undefined}
      {...itemProps}
      ref={composedRef}
      className={cn("cn-selection-wheel-item", className)}
      style={itemStyle}
    />
  );
}

function SelectionWheelLabel(props: DivProps) {
  const { asChild, className, children, ...labelProps } = props;

  const store = useStoreContext(LABEL_NAME);
  const { type } = useSelectionWheelContext(LABEL_NAME);

  const label = useStore(
    React.useCallback(
      (state) => {
        const sub = state.path[state.path.length - 1];
        const current =
          state.items.find((item) => item.value === state.highlightedValue) ??
          (sub ? store.getSubTrigger(sub) : undefined) ??
          (type === "radio" ? store.getItem(state.value) : undefined);
        return current?.label ?? current?.value ?? null;
      },
      [type, store],
    ),
  );

  const LabelPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <LabelPrimitive
      aria-hidden="true"
      data-slot="selection-wheel-label"
      data-state={label === null ? "empty" : "filled"}
      {...labelProps}
      className={cn("cn-selection-wheel-label", className)}
    >
      {label ?? children}
    </LabelPrimitive>
  );
}

interface SelectionWheelSubProps {
  children?: React.ReactNode;
}

function SelectionWheelSub(props: SelectionWheelSubProps) {
  useSelectionWheelContext(SUB_NAME);
  const subId = React.useId();

  return (
    <SubContext.Provider value={subId}>{props.children}</SubContext.Provider>
  );
}

interface SelectionWheelSubTriggerProps extends Omit<
  SelectionWheelItemProps,
  "onSelect"
> {}

function SelectionWheelSubTrigger(props: SelectionWheelSubTriggerProps) {
  const subId = useSubContext(SUB_TRIGGER_NAME);

  return (
    <SubTriggerContext.Provider value={subId}>
      <SelectionWheelItem {...props} />
    </SubTriggerContext.Provider>
  );
}

interface SelectionWheelSubContentProps {
  children?: React.ReactNode;
}

function SelectionWheelSubContent(props: SelectionWheelSubContentProps) {
  const subId = useSubContext(SUB_CONTENT_NAME);

  return (
    <GroupContext.Provider value={subId}>
      {props.children}
    </GroupContext.Provider>
  );
}

export {
  SelectionWheel,
  SelectionWheelArea,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
  type SelectionWheelProps,
  SelectionWheelSub,
  SelectionWheelSubContent,
  SelectionWheelSubTrigger,
  SelectionWheelTrigger,
};
