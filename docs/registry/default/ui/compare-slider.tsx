"use client";

import { Slot } from "@radix-ui/react-slot";
import { GripVerticalIcon } from "lucide-react";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import type {
  AfterProps,
  BeforeProps,
  HandleProps,
  LabelProps,
  RootProps,
} from "@/types/docs/compare-slider";

const ROOT_NAME = "CompareSlider";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props);

  useIsomorphicLayoutEffect(() => {
    ref.current = props;
  });

  return ref;
}

interface StoreState {
  value: number;
  isDragging: boolean;
  orientation: "horizontal" | "vertical";
  min: number;
  max: number;
  step: number;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  updateValue: (value: number) => void;
}

const CompareSliderContext = React.createContext<Store | null>(null);

function useCompareSliderContext() {
  const context = React.useContext(CompareSliderContext);
  if (!context) {
    throw new Error(
      `CompareSlider components must be used within ${ROOT_NAME}`,
    );
  }
  return context;
}

function CompareSlider(props: RootProps) {
  const {
    value: valueProp,
    defaultValue = 50,
    onValueChange,
    orientation = "horizontal",
    disabled = false,
    min = 0,
    max = 100,
    step = 1,
    className,
    children,
    ref,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    value: clamp(valueProp ?? defaultValue, min, max),
    isDragging: false,
    orientation,
    min,
    max,
    step,
  }));
  const onValueChangeRef = useAsRef(onValueChange);

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (callback: () => void) => {
        listenersRef.current.add(callback);
        return () => listenersRef.current.delete(callback);
      },
      getState: () => stateRef.current,
      setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => {
        if (Object.is(stateRef.current[key], value)) return;
        stateRef.current[key] = value;

        if (key === "value") {
          onValueChangeRef.current?.(value as number);
        }

        for (const cb of listenersRef.current) {
          cb();
        }
      },
      updateValue: (newValue: number) => {
        const clampedValue = clamp(newValue, min, max);
        if (Object.is(stateRef.current.value, clampedValue)) return;
        stateRef.current.value = clampedValue;
        onValueChangeRef.current?.(clampedValue);
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, onValueChangeRef, min, max]);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      const clampedValue = clamp(valueProp, min, max);
      if (!Object.is(stateRef.current.value, clampedValue)) {
        stateRef.current.value = clampedValue;
        for (const cb of listenersRef.current) {
          cb();
        }
      }
    }
  }, [valueProp, min, max, stateRef, listenersRef]);

  useIsomorphicLayoutEffect(() => {
    stateRef.current.orientation = orientation;
    stateRef.current.min = min;
    stateRef.current.max = max;
    stateRef.current.step = step;
  }, [orientation, min, max, step, stateRef]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const getPositionFromEvent = React.useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();
      const isHorizontal = orientation === "horizontal";

      let clientPos: number;
      if ("touches" in event) {
        clientPos = isHorizontal
          ? (event.touches[0]?.clientX ?? 0)
          : (event.touches[0]?.clientY ?? 0);
      } else {
        clientPos = isHorizontal ? event.clientX : event.clientY;
      }

      const containerPos = isHorizontal ? rect.left : rect.top;
      const containerSize = isHorizontal ? rect.width : rect.height;
      const position = ((clientPos - containerPos) / containerSize) * 100;

      return clamp(position, min, max);
    },
    [orientation, min, max],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      event.preventDefault();
      store.setState("isDragging", true);

      const updatePosition = (e: MouseEvent | TouchEvent) => {
        const position = getPositionFromEvent(e);
        if (position !== null) {
          store.updateValue(position);
        }
      };

      const onPointerMove = (e: MouseEvent | TouchEvent) => {
        updatePosition(e);
      };

      const onPointerUp = () => {
        store.setState("isDragging", false);
        document.removeEventListener("mousemove", onPointerMove);
        document.removeEventListener("mouseup", onPointerUp);
        document.removeEventListener("touchmove", onPointerMove);
        document.removeEventListener("touchend", onPointerUp);
      };

      updatePosition(event.nativeEvent);

      document.addEventListener("mousemove", onPointerMove);
      document.addEventListener("mouseup", onPointerUp);
      document.addEventListener("touchmove", onPointerMove, {
        passive: false,
      });
      document.addEventListener("touchend", onPointerUp);
    },
    [disabled, store, getPositionFromEvent],
  );

  return (
    <CompareSliderContext.Provider value={store}>
      <div
        ref={useComposedRefs(containerRef, ref)}
        className={cn(
          "relative flex w-full touch-none select-none overflow-hidden",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          disabled && "opacity-50",
          className,
        )}
        onPointerDown={onPointerDown}
        {...rootProps}
      >
        {children}
      </div>
    </CompareSliderContext.Provider>
  );
}

function CompareSliderBefore(props: BeforeProps) {
  const { className, children, label, ref, ...beforeProps } = props;
  const store = useCompareSliderContext();
  const state = store.getState();
  const position = state.value;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        state.orientation === "horizontal" ? "h-full" : "w-full",
        className,
      )}
      style={{
        [state.orientation === "horizontal" ? "width" : "height"]:
          `${position}%`,
      }}
      {...beforeProps}
    >
      {children}
      {label && <CompareSliderLabel side="before">{label}</CompareSliderLabel>}
    </div>
  );
}

function CompareSliderAfter(props: AfterProps) {
  const { className, children, label, ref, ...afterProps } = props;
  const store = useCompareSliderContext();
  const state = store.getState();
  const position = state.value;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        state.orientation === "horizontal" ? "h-full" : "w-full",
        className,
      )}
      style={{
        [state.orientation === "horizontal" ? "width" : "height"]:
          `${100 - position}%`,
      }}
      {...afterProps}
    >
      {children}
      {label && <CompareSliderLabel side="after">{label}</CompareSliderLabel>}
    </div>
  );
}

function CompareSliderHandle(props: HandleProps) {
  const { className, children, ref, ...handleProps } = props;
  const store = useCompareSliderContext();
  const state = store.getState();
  const position = state.value;
  const isHorizontal = state.orientation === "horizontal";

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (state.isDragging) return;

      let delta = 0;

      if (
        (isHorizontal && event.key === "ArrowLeft") ||
        (!isHorizontal && event.key === "ArrowUp")
      ) {
        delta = -state.step;
      } else if (
        (isHorizontal && event.key === "ArrowRight") ||
        (!isHorizontal && event.key === "ArrowDown")
      ) {
        delta = state.step;
      } else if (event.key === "Home") {
        store.updateValue(state.min);
        return;
      } else if (event.key === "End") {
        store.updateValue(state.max);
        return;
      } else {
        return;
      }

      event.preventDefault();
      store.updateValue(clamp(position + delta, state.min, state.max));
    },
    [isHorizontal, position, state, store],
  );

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-10 flex cursor-grab items-center justify-center rounded-full border border-border bg-background shadow-lg transition-shadow active:cursor-grabbing",
        isHorizontal
          ? "-translate-x-1/2 top-0 h-full w-1"
          : "-translate-y-1/2 left-0 h-1 w-full",
        state.isDragging && "shadow-xl",
        className,
      )}
      style={{
        [isHorizontal ? "left" : "top"]: `${position}%`,
      }}
      tabIndex={0}
      role="slider"
      aria-valuemin={state.min}
      aria-valuemax={state.max}
      aria-valuenow={position}
      aria-orientation={state.orientation}
      onKeyDown={onKeyDown}
      {...handleProps}
    >
      {children ?? (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted",
            isHorizontal ? "h-8 w-8" : "h-8 w-8 rotate-90",
          )}
        >
          <GripVerticalIcon className="size-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function CompareSliderLabel(props: LabelProps) {
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
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
  CompareSliderLabel,
};
