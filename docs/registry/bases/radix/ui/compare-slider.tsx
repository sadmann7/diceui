"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/radix/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/radix/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";

const ROOT_NAME = "CompareSlider";
const BEFORE_NAME = "CompareSliderBefore";
const AFTER_NAME = "CompareSliderAfter";
const LABEL_NAME = "CompareSliderLabel";
const HANDLE_NAME = "CompareSliderHandle";

const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

type Interaction = "hover" | "drag";
type Orientation = "horizontal" | "vertical";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof CompareSlider>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface StoreState {
  value: number;
  isDragging: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

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

interface CompareSliderProps extends DivProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  step?: number;
  interaction?: Interaction;
  orientation?: Orientation;
}

function CompareSlider(props: CompareSliderProps) {
  const {
    value: valueProp,
    defaultValue = 50,
    onValueChange,
    step = 1,
    interaction = "drag",
    orientation = "horizontal",
    className,
    children,
    ref,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerDown: onPointerDownProp,
    onKeyDown: onKeyDownProp,
    asChild,
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
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, onValueChangeRef]);

  const rootRef = React.useRef<RootElement | null>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const isDraggingRef = React.useRef(false);

  const propsRef = useAsRef({
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerDown: onPointerDownProp,
    onKeyDown: onKeyDownProp,
    interaction,
    orientation,
    step,
  });

  const value = useStore((state) => state.value, store);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", clamp(valueProp, 0, 100));
    }
  }, [valueProp]);

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      if (!isDraggingRef.current && propsRef.current.interaction === "drag") {
        return;
      }
      if (!rootRef.current) return;

      propsRef.current.onPointerMove?.(event);
      if (event.defaultPrevented) return;

      const rootRect = rootRef.current.getBoundingClientRect();
      const isVertical = propsRef.current.orientation === "vertical";
      const position = isVertical
        ? event.clientY - rootRect.top
        : event.clientX - rootRect.left;
      const size = isVertical ? rootRect.height : rootRect.width;
      const percentage = clamp((position / size) * 100, 0, 100);

      store.setState("value", percentage);
    },
    [propsRef, store],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
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
    (event: React.PointerEvent<RootElement>) => {
      if (propsRef.current.interaction !== "drag") return;

      propsRef.current.onPointerUp?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.releasePointerCapture(event.pointerId);
      isDraggingRef.current = false;
      store.setState("isDragging", false);
    },
    [store, propsRef],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      propsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const currentValue = store.getState().value;
      const isVertical = propsRef.current.orientation === "vertical";

      if (event.key === "Home") {
        event.preventDefault();
        store.setState("value", 0);
      } else if (event.key === "End") {
        event.preventDefault();
        store.setState("value", 100);
      } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
        event.preventDefault();

        const isPageKey = PAGE_KEYS.includes(event.key);
        const isSkipKey =
          isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key));
        const multiplier = isSkipKey ? 10 : 1;

        let direction = 0;
        if (isVertical) {
          const isDecreaseKey = ["ArrowUp", "PageUp"].includes(event.key);
          direction = isDecreaseKey ? -1 : 1;
        } else {
          const isDecreaseKey = ["ArrowLeft", "PageUp"].includes(event.key);
          direction = isDecreaseKey ? -1 : 1;
        }

        const stepInDirection = propsRef.current.step * multiplier * direction;
        const newValue = clamp(currentValue + stepInDirection, 0, 100);
        store.setState("value", newValue);
      }
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

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <CompareSliderContext.Provider value={contextValue}>
        <RootPrimitive
          role="slider"
          aria-orientation={orientation}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={value}
          data-slot="compare-slider"
          data-orientation={orientation}
          {...rootProps}
          ref={composedRef}
          tabIndex={0}
          className={cn(
            "relative isolate touch-none select-none overflow-hidden outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            orientation === "horizontal" ? "w-full" : "h-full",
            className,
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          {children}
        </RootPrimitive>
      </CompareSliderContext.Provider>
    </StoreContext.Provider>
  );
}

interface CompareSliderBeforeProps extends DivProps {
  label?: string;
}

function CompareSliderBefore(props: CompareSliderBeforeProps) {
  const { className, children, style, label, asChild, ref, ...beforeProps } =
    props;

  const value = useStore((state) => state.value);
  const { orientation } = useCompareSliderContext(BEFORE_NAME);

  const labelId = React.useId();

  const isVertical = orientation === "vertical";
  const clipPath = isVertical
    ? `inset(${value}% 0 0 0)`
    : `inset(0 0 0 ${value}%)`;

  const BeforePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <BeforePrimitive
      role="img"
      aria-labelledby={label ? labelId : undefined}
      aria-hidden={label ? undefined : "true"}
      data-slot="compare-slider-before"
      data-orientation={orientation}
      {...beforeProps}
      ref={ref}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{
        clipPath,
        ...style,
      }}
    >
      {children}
      {label && (
        <CompareSliderLabel id={labelId} side="before">
          {label}
        </CompareSliderLabel>
      )}
    </BeforePrimitive>
  );
}

interface CompareSliderAfterProps extends DivProps {
  label?: string;
}

function CompareSliderAfter(props: CompareSliderAfterProps) {
  const { className, children, style, label, asChild, ref, ...afterProps } =
    props;

  const value = useStore((state) => state.value);
  const { orientation } = useCompareSliderContext(AFTER_NAME);

  const labelId = React.useId();

  const isVertical = orientation === "vertical";
  const clipPath = isVertical
    ? `inset(0 0 ${100 - value}% 0)`
    : `inset(0 ${100 - value}% 0 0)`;

  const AfterPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <AfterPrimitive
      role="img"
      aria-labelledby={label ? labelId : undefined}
      aria-hidden={label ? undefined : "true"}
      data-slot="compare-slider-after"
      data-orientation={orientation}
      {...afterProps}
      ref={ref}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{
        clipPath,
        ...style,
      }}
    >
      {children}
      {label && (
        <CompareSliderLabel id={labelId} side="after">
          {label}
        </CompareSliderLabel>
      )}
    </AfterPrimitive>
  );
}

function CompareSliderHandle(props: DivProps) {
  const { className, children, style, asChild, ref, ...handleProps } = props;

  const value = useStore((state) => state.value);
  const { interaction, orientation } = useCompareSliderContext(HANDLE_NAME);

  const isVertical = orientation === "vertical";

  const HandlePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <HandlePrimitive
      role="presentation"
      aria-hidden="true"
      data-slot="compare-slider-handle"
      data-orientation={orientation}
      {...handleProps}
      ref={ref}
      className={cn(
        "absolute z-50 flex items-center justify-center",
        isVertical
          ? "left-0 h-10 w-full -translate-y-1/2"
          : "top-0 h-full w-10 -translate-x-1/2",
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
                ? "top-1/2 h-1 w-full -translate-y-1/2"
                : "left-1/2 h-full w-1 -translate-x-1/2",
            )}
          />
          {interaction === "drag" && (
            <div className="z-50 flex aspect-square size-11 shrink-0 items-center justify-center rounded-full bg-background p-2 [&_svg]:size-4 [&_svg]:select-none [&_svg]:stroke-3 [&_svg]:text-muted-foreground">
              {isVertical ? (
                <div className="flex flex-col items-center">
                  <ChevronUpIcon />
                  <ChevronDownIcon />
                </div>
              ) : (
                <div className="flex items-center">
                  <ChevronLeftIcon />
                  <ChevronRightIcon />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </HandlePrimitive>
  );
}

interface CompareSliderLabelProps extends DivProps {
  side?: "before" | "after";
}

function CompareSliderLabel(props: CompareSliderLabelProps) {
  const { className, children, side, asChild, ref, ...labelProps } = props;

  const { orientation } = useCompareSliderContext(LABEL_NAME);
  const isVertical = orientation === "vertical";

  const LabelPrimitive = asChild ? SlotPrimitive.Slot : "div";

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
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
  CompareSliderLabel,
  //
  type CompareSliderProps,
};
