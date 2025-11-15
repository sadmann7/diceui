"use client";

import { GripVerticalIcon } from "lucide-react";
import {
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "CompareSlider";

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

interface StoreState {
  value: number;
  isDragging: boolean;
  mode: "hover" | "drag";
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
  motionSliderPosition: MotionValue<number>;
  mode: "hover" | "drag";
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
  mode?: "hover" | "drag";
  onDragStart?: () => void;
  onDragEnd?: () => void;
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
    mode: props.mode ?? "drag",
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

  useIsomorphicLayoutEffect(() => {
    if (props.mode !== undefined) {
      stateRef.current.mode = props.mode;
    }
  }, [props.mode]);

  return (
    <StoreContext.Provider value={store}>
      <CompareSliderRootImpl {...rootProps} mode={props.mode ?? "drag"} />
    </StoreContext.Provider>
  );
}

function CompareSliderRootImpl(
  props: Omit<
    CompareSliderRootProps,
    "value" | "defaultValue" | "onValueChange"
  >,
) {
  const {
    mode = "drag",
    onDragStart,
    onDragEnd,
    className,
    children,
    ref,
    ...rootProps
  } = props;

  const store = useStoreContext(ROOT_NAME);
  const value = useStore((state) => state.value);
  const motionValue = useMotionValue(value);
  const motionSliderPosition = useSpring(motionValue, {
    bounce: 0,
    duration: 0,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  const onDragStartRef = useAsRef(onDragStart);
  const onDragEndRef = useAsRef(onDragEnd);

  // Subscribe to store changes to update motion value
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const currentValue = store.getState().value;
      if (currentValue !== motionValue.get()) {
        motionValue.set(currentValue);
      }
    });
    return unsubscribe;
  }, [store, motionValue]);

  const handleDrag = React.useCallback(
    (domRect: DOMRect, clientX: number) => {
      if (!isDraggingRef.current && mode === "drag") {
        return;
      }

      const x = clientX - domRect.left;
      const percentage = clamp((x / domRect.width) * 100, 0, 100);

      motionValue.set(percentage);
      store.updateValue(percentage);
    },
    [mode, motionValue, store],
  );

  const handleMouseDrag = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      handleDrag(containerRect, event.clientX);
    },
    [handleDrag],
  );

  const handleTouchDrag = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const touches = Array.from(event.touches);
      handleDrag(containerRect, touches.at(0)?.clientX ?? 0);
    },
    [handleDrag],
  );

  const handleDragStart = React.useCallback(() => {
    if (mode === "drag") {
      isDraggingRef.current = true;
      store.setState("isDragging", true);
      onDragStartRef.current?.();
    }
  }, [mode, store, onDragStartRef]);

  const handleDragEnd = React.useCallback(() => {
    if (mode === "drag") {
      isDraggingRef.current = false;
      store.setState("isDragging", false);
      onDragEndRef.current?.();
    }
  }, [mode, store, onDragEndRef]);

  const contextValue = React.useMemo<CompareSliderContextValue>(
    () => ({
      motionSliderPosition,
      mode,
    }),
    [motionSliderPosition, mode],
  );

  return (
    <CompareSliderContext.Provider value={contextValue}>
      <div
        ref={useComposedRefs(containerRef, ref)}
        aria-label="Comparison slider"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className={cn(
          "relative isolate w-full select-none overflow-hidden",
          className,
        )}
        onMouseDown={handleDragStart}
        onMouseLeave={handleDragEnd}
        onMouseMove={handleMouseDrag}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleTouchDrag}
        onTouchStart={handleDragStart}
        role="slider"
        tabIndex={0}
        {...rootProps}
      >
        {children}
      </div>
    </CompareSliderContext.Provider>
  );
}

interface CompareSliderBeforeProps extends React.ComponentProps<"div"> {
  label?: string;
}

function CompareSliderBefore(props: CompareSliderBeforeProps) {
  const { className, children, label, ref, ...beforeProps } = props;
  const { motionSliderPosition } = useCompareSliderContext(
    "CompareSliderBefore",
  );

  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 0 0 ${value}%)`,
  );

  const {
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...restProps
  } = beforeProps as React.ComponentProps<typeof motion.div> & {
    onDrag?: unknown;
    onDragStart?: unknown;
    onDragEnd?: unknown;
  };

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      role="img"
      style={{
        clipPath: leftClipPath,
      }}
      {...restProps}
    >
      {children}
      {label && <CompareSliderLabel side="before">{label}</CompareSliderLabel>}
    </motion.div>
  );
}

interface CompareSliderAfterProps extends React.ComponentProps<"div"> {
  label?: string;
}

function CompareSliderAfter(props: CompareSliderAfterProps) {
  const { className, children, label, ref, ...afterProps } = props;
  const { motionSliderPosition } =
    useCompareSliderContext("CompareSliderAfter");

  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`,
  );

  const {
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...restProps
  } = afterProps as React.ComponentProps<typeof motion.div> & {
    onDrag?: unknown;
    onDragStart?: unknown;
    onDragEnd?: unknown;
  };

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      role="img"
      style={{
        clipPath: rightClipPath,
      }}
      {...restProps}
    >
      {children}
      {label && <CompareSliderLabel side="after">{label}</CompareSliderLabel>}
    </motion.div>
  );
}

interface CompareSliderHandleProps extends React.ComponentProps<"div"> {
  children?: React.ReactNode;
}

function CompareSliderHandle(props: CompareSliderHandleProps) {
  const { className, children, ref, ...handleProps } = props;
  const { motionSliderPosition, mode } = useCompareSliderContext(
    "CompareSliderHandle",
  );

  const left = useTransform(motionSliderPosition, (value) => `${value}%`);

  const {
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...restProps
  } = handleProps as React.ComponentProps<typeof motion.div> & {
    onDrag?: unknown;
    onDragStart?: unknown;
    onDragEnd?: unknown;
  };

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "-translate-x-1/2 absolute top-0 z-50 flex h-full w-10 items-center justify-center",
        mode === "drag" && "cursor-grab active:cursor-grabbing",
        className,
      )}
      role="presentation"
      style={{ left }}
      {...restProps}
    >
      {children ?? (
        <>
          <div className="-translate-x-1/2 absolute left-1/2 h-full w-1 bg-background" />
          {mode === "drag" && (
            <div className="z-50 flex items-center justify-center rounded-sm bg-background px-0.5 py-1">
              <GripVerticalIcon className="h-4 w-4 select-none text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

interface CompareSliderLabelProps extends React.ComponentProps<"div"> {
  side?: "before" | "after";
}

function CompareSliderLabel(props: CompareSliderLabelProps) {
  const { className, children, side, ref, ...labelProps } = props;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-20 rounded-md border border-border bg-background/80 px-3 py-1.5 font-medium text-sm backdrop-blur-sm",
        side === "before" ? "top-2 left-2" : "top-2 right-2",
        className,
      )}
      {...labelProps}
    >
      {children}
    </div>
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
