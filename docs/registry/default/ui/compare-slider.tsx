"use client";

import { Slot } from "@radix-ui/react-slot";
import { GripHorizontalIcon, GripVerticalIcon } from "lucide-react";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "CompareSlider";
const HANDLE_NAME = "CompareSliderHandle";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props);

  useIsomorphicLayoutEffect(() => {
    ref.current = props;
  });

  return ref;
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type Interaction = "hover" | "drag";
type Orientation = "horizontal" | "vertical";

interface StoreState {
  value: number;
  isDragging: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  updateValue: (value: number) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface CompareSliderContextValue {
  interaction: Interaction;
  orientation: Orientation;
}

const CompareSliderContext =
  React.createContext<CompareSliderContextValue | null>(null);

function useCompareSliderContext(consumerName: string) {
  const context = React.useContext(CompareSliderContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface CompareSliderRootProps extends React.ComponentProps<"div"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  interaction?: Interaction;
  orientation?: Orientation;
  asChild?: boolean;
}

function CompareSliderRoot(props: CompareSliderRootProps) {
  const {
    value: valueProp,
    defaultValue = 50,
    onValueChange,
    ...rootProps
  } = props;

  const stateRef = useLazyRef<StoreState>(() => ({
    value: clamp(valueProp ?? defaultValue, 0, 100),
    isDragging: false,
  }));
  const listenersRef = useLazyRef(() => new Set<() => void>());
  const onValueChangeRef = useAsRef(onValueChange);

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => {
        if (Object.is(stateRef.current[key], value)) return;
        stateRef.current[key] = value;

        if (key === "value") {
          onValueChangeRef.current?.(value as number);
        }

        store.notify();
      },
      updateValue: (newValue: number) => {
        const clampedValue = clamp(newValue, 0, 100);
        if (Object.is(stateRef.current.value, clampedValue)) return;
        stateRef.current.value = clampedValue;
        onValueChangeRef.current?.(clampedValue);
        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, onValueChangeRef]);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      const clampedValue = clamp(valueProp, 0, 100);
      if (!Object.is(stateRef.current.value, clampedValue)) {
        stateRef.current.value = clampedValue;
        store.notify();
      }
    }
  }, [valueProp, store]);

  return (
    <StoreContext.Provider value={store}>
      <CompareSliderRootImpl {...rootProps} />
    </StoreContext.Provider>
  );
}

type RootImplElement = React.ComponentRef<typeof CompareSliderRootImpl>;

function CompareSliderRootImpl(
  props: Omit<
    CompareSliderRootProps,
    "value" | "defaultValue" | "onValueChange"
  >,
) {
  const {
    interaction = "drag",
    orientation = "horizontal",
    className,
    children,
    ref,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerDown: onPointerDownProp,
    asChild,
    ...rootProps
  } = props;

  const store = useStoreContext(ROOT_NAME);
  const value = useStore((state) => state.value);

  const containerRef = React.useRef<RootImplElement>(null);
  const composedRef = useComposedRefs(ref, containerRef);
  const isDraggingRef = React.useRef(false);

  const propsRef = useAsRef({
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerDown: onPointerDownProp,
    interaction,
    orientation,
  });

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<RootImplElement>) => {
      if (!isDraggingRef.current && propsRef.current.interaction === "drag") {
        return;
      }
      if (!containerRef.current) return;

      propsRef.current.onPointerMove?.(event);
      if (event.defaultPrevented) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const isVertical = propsRef.current.orientation === "vertical";
      const position = isVertical
        ? event.clientY - containerRect.top
        : event.clientX - containerRect.left;
      const size = isVertical ? containerRect.height : containerRect.width;
      const percentage = clamp((position / size) * 100, 0, 100);

      store.updateValue(percentage);
    },
    [propsRef, store],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<RootImplElement>) => {
      if (propsRef.current.interaction !== "drag") return;

      propsRef.current.onPointerDown?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      isDraggingRef.current = true;
      store.setState("isDragging", true);
    },
    [store, propsRef],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<RootImplElement>) => {
      if (propsRef.current.interaction !== "drag") return;

      propsRef.current.onPointerUp?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.releasePointerCapture(event.pointerId);
      isDraggingRef.current = false;
      store.setState("isDragging", false);
    },
    [store, propsRef],
  );

  const contextValue = React.useMemo<CompareSliderContextValue>(
    () => ({
      interaction,
      orientation,
    }),
    [interaction, orientation],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <CompareSliderContext.Provider value={contextValue}>
      <RootPrimitive
        role="slider"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        data-slot="compare-slider"
        {...rootProps}
        ref={composedRef}
        tabIndex={0}
        className={cn(
          "relative isolate select-none overflow-hidden",
          orientation === "horizontal" ? "w-full" : "h-full w-auto",
          className,
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </RootPrimitive>
    </CompareSliderContext.Provider>
  );
}

interface CompareSliderBeforeProps extends React.ComponentProps<"div"> {
  label?: string;
  asChild?: boolean;
}

function CompareSliderBefore(props: CompareSliderBeforeProps) {
  const { className, children, style, label, asChild, ref, ...beforeProps } =
    props;

  const value = useStore((state) => state.value);
  const { orientation } = useCompareSliderContext("CompareSliderBefore");

  const isVertical = orientation === "vertical";
  const clipPath = isVertical
    ? `inset(${value}% 0 0 0)`
    : `inset(0 0 0 ${value}%)`;

  const BeforePrimitive = asChild ? Slot : "div";

  return (
    <BeforePrimitive
      role="img"
      aria-hidden="true"
      data-slot="compare-slider-before"
      {...beforeProps}
      ref={ref}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{
        clipPath,
        ...style,
      }}
    >
      {children}
      {label && <CompareSliderLabel side="before">{label}</CompareSliderLabel>}
    </BeforePrimitive>
  );
}

interface CompareSliderAfterProps extends React.ComponentProps<"div"> {
  label?: string;
  asChild?: boolean;
}

function CompareSliderAfter(props: CompareSliderAfterProps) {
  const { className, children, style, label, asChild, ref, ...afterProps } =
    props;

  const value = useStore((state) => state.value);
  const { orientation } = useCompareSliderContext("CompareSliderAfter");

  const isVertical = orientation === "vertical";
  const clipPath = isVertical
    ? `inset(0 0 ${100 - value}% 0)`
    : `inset(0 ${100 - value}% 0 0)`;

  const AfterPrimitive = asChild ? Slot : "div";

  return (
    <AfterPrimitive
      role="img"
      aria-hidden="true"
      data-slot="compare-slider-after"
      {...afterProps}
      ref={ref}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{
        clipPath,
        ...style,
      }}
    >
      {children}
      {label && <CompareSliderLabel side="after">{label}</CompareSliderLabel>}
    </AfterPrimitive>
  );
}

interface CompareSliderHandleProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function CompareSliderHandle(props: CompareSliderHandleProps) {
  const { className, children, style, asChild, ref, ...handleProps } = props;

  const value = useStore((state) => state.value);
  const { interaction, orientation } = useCompareSliderContext(HANDLE_NAME);

  const isVertical = orientation === "vertical";

  const HandlePrimitive = asChild ? Slot : "div";

  return (
    <HandlePrimitive
      role="presentation"
      aria-hidden="true"
      data-slot="compare-slider-handle"
      {...handleProps}
      ref={ref}
      className={cn(
        "absolute z-50 flex items-center justify-center",
        isVertical
          ? "-translate-y-1/2 left-0 h-10 w-full"
          : "-translate-x-1/2 top-0 h-full w-10",
        interaction === "drag" && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        [isVertical ? "top" : "left"]: `${value}%`,
        ...style,
      }}
    >
      {children ?? (
        <>
          <div
            className={cn(
              "absolute bg-background",
              isVertical
                ? "-translate-y-1/2 top-1/2 h-1 w-full"
                : "-translate-x-1/2 left-1/2 h-full w-1",
            )}
          />
          {interaction === "drag" && (
            <div className="z-50 flex items-center justify-center rounded-sm bg-background px-0.5 py-1">
              {isVertical ? (
                <GripHorizontalIcon className="size-4 select-none text-muted-foreground" />
              ) : (
                <GripVerticalIcon className="size-4 select-none text-muted-foreground" />
              )}
            </div>
          )}
        </>
      )}
    </HandlePrimitive>
  );
}

interface CompareSliderLabelProps extends React.ComponentProps<"div"> {
  side?: "before" | "after";
  asChild?: boolean;
}

function CompareSliderLabel(props: CompareSliderLabelProps) {
  const { className, children, side, asChild, ref, ...labelProps } = props;

  const { orientation } = useCompareSliderContext("CompareSliderLabel");
  const isVertical = orientation === "vertical";

  const LabelPrimitive = asChild ? Slot : "div";

  return (
    <LabelPrimitive
      ref={ref}
      data-slot="compare-slider-label"
      className={cn(
        "absolute z-20 rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-sm backdrop-blur-sm",
        isVertical
          ? side === "before"
            ? "top-2 left-2"
            : "bottom-2 left-2"
          : side === "before"
            ? "top-2 left-2"
            : "top-2 right-2",
        className,
      )}
      {...labelProps}
    >
      {children}
    </LabelPrimitive>
  );
}

export {
  CompareSliderRoot as Root,
  CompareSliderAfter as After,
  CompareSliderBefore as Before,
  CompareSliderHandle as Handle,
  CompareSliderLabel as Label,
  //
  CompareSliderRoot as CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
  CompareSliderLabel,
};
