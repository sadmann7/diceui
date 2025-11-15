"use client";

import { Slot } from "@radix-ui/react-slot";
import { GripVerticalIcon } from "lucide-react";
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
  onDragStart?: () => void;
  onDragEnd?: () => void;
  interaction?: Interaction;
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
    onDragStart: onDragStartProp,
    onDragEnd: onDragEndProp,
    className,
    children,
    ref,
    asChild,
    ...rootProps
  } = props;

  const store = useStoreContext(ROOT_NAME);
  const value = useStore((state) => state.value);

  const containerRef = React.useRef<RootImplElement>(null);
  const composedRef = useComposedRefs(ref, containerRef);
  const isDraggingRef = React.useRef(false);

  const propsRef = useAsRef({
    onDragStart: onDragStartProp,
    onDragEnd: onDragEndProp,
    interaction,
  });

  const onDrag = React.useCallback(
    (domRect: DOMRect, clientX: number) => {
      if (!isDraggingRef.current && propsRef.current.interaction === "drag") {
        return;
      }

      const x = clientX - domRect.left;
      const percentage = clamp((x / domRect.width) * 100, 0, 100);

      store.updateValue(percentage);
    },
    [propsRef, store],
  );

  const onMouseDrag = React.useCallback(
    (event: React.MouseEvent<RootImplElement>) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      onDrag(containerRect, event.clientX);
    },
    [onDrag],
  );

  const onTouchDrag = React.useCallback(
    (event: React.TouchEvent<RootImplElement>) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const touches = Array.from(event.touches);
      onDrag(containerRect, touches.at(0)?.clientX ?? 0);
    },
    [onDrag],
  );

  const onDragStart = React.useCallback(() => {
    if (propsRef.current.interaction === "drag") {
      isDraggingRef.current = true;
      store.setState("isDragging", true);
      propsRef.current.onDragStart?.();
    }
  }, [store, propsRef]);

  const onDragEnd = React.useCallback(() => {
    if (propsRef.current.interaction === "drag") {
      isDraggingRef.current = false;
      store.setState("isDragging", false);
      propsRef.current.onDragEnd?.();
    }
  }, [store, propsRef]);

  const contextValue = React.useMemo<CompareSliderContextValue>(
    () => ({
      interaction,
    }),
    [interaction],
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
          "relative isolate w-full select-none overflow-hidden",
          className,
        )}
        onMouseDown={onDragStart}
        onMouseLeave={onDragEnd}
        onMouseMove={onMouseDrag}
        onMouseUp={onDragEnd}
        onTouchEnd={onDragEnd}
        onTouchMove={onTouchDrag}
        onTouchStart={onDragStart}
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
        clipPath: `inset(0 0 0 ${value}%)`,
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
        clipPath: `inset(0 ${100 - value}% 0 0)`,
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
  const { interaction } = useCompareSliderContext(HANDLE_NAME);

  const HandlePrimitive = asChild ? Slot : "div";

  return (
    <HandlePrimitive
      role="presentation"
      aria-hidden="true"
      data-slot="compare-slider-handle"
      {...handleProps}
      ref={ref}
      className={cn(
        "-translate-x-1/2 absolute top-0 z-50 flex h-full w-10 items-center justify-center",
        interaction === "drag" && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        left: `${value}%`,
        ...style,
      }}
    >
      {children ?? (
        <>
          <div className="-translate-x-1/2 absolute left-1/2 h-full w-1 bg-background" />
          {interaction === "drag" && (
            <div className="z-50 flex items-center justify-center rounded-sm bg-background px-0.5 py-1">
              <GripVerticalIcon className="size-4 select-none text-muted-foreground" />
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

  const LabelPrimitive = asChild ? Slot : "div";

  return (
    <LabelPrimitive
      ref={ref}
      data-slot="compare-slider-label"
      className={cn(
        "absolute z-20 rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-sm backdrop-blur-sm",
        side === "before" ? "top-2 left-2" : "top-2 right-2",
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
