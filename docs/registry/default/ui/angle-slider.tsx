"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

const ROOT_NAME = "AngleSlider";
const THUMB_NAME = "AngleSliderThumb";

const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

function clamp(value: number, [min, max]: [number, number]) {
  return Math.min(max, Math.max(min, value));
}

function getNextSortedValues(
  prevValues: number[] = [],
  nextValue: number,
  atIndex: number,
) {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}

function getStepsBetweenValues(values: number[]) {
  return values.slice(0, -1).map((value, index) => {
    const nextValue = values[index + 1];
    return nextValue !== undefined ? nextValue - value : 0;
  });
}

function hasMinStepsBetweenValues(
  values: number[],
  minStepsBetweenValues: number,
) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values);
    const actualMinStepsBetweenValues =
      stepsBetweenValues.length > 0 ? Math.min(...stepsBetweenValues) : 0;
    return actualMinStepsBetweenValues >= minStepsBetweenValues;
  }
  return true;
}

function getDecimalCount(value: number) {
  return (String(value).split(".")[1] ?? "").length;
}

function roundValue(value: number, decimalCount: number) {
  const rounder = 10 ** decimalCount;
  return Math.round(value * rounder) / rounder;
}

function getClosestValueIndex(values: number[], nextValue: number) {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

type Direction = "ltr" | "rtl";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof AngleSliderRoot>;
type ThumbElement = React.ComponentRef<typeof AngleSliderThumb>;

interface ThumbData {
  id: string;
  element: ThumbElement;
  index: number;
  value: number;
}

interface StoreState {
  values: number[];
  thumbs: Map<number, ThumbData>;
  valueIndexToChange: number;
  min: number;
  max: number;
  step: number;
  minStepsBetweenThumbs: number;
  disabled: boolean;
  inverted: boolean;
  radius: number;
  startAngle: number;
  endAngle: number;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
  addThumb: (index: number, thumbData: ThumbData) => void;
  removeThumb: (index: number) => void;
  updateValue: (
    value: number,
    atIndex: number,
    options?: { commit?: boolean },
  ) => void;
  getValueFromPointer: (
    clientX: number,
    clientY: number,
    rect: DOMRect,
  ) => number;
  getAngleFromValue: (value: number) => number;
  getPositionFromAngle: (angle: number) => { x: number; y: number };
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  onValueChange?: (value: number[]) => void,
  onValueCommit?: (value: number[]) => void,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      return () => {};
    },
    getState: () =>
      stateRef.current ?? {
        values: [0],
        thumbs: new Map(),
        valueIndexToChange: 0,
        min: 0,
        max: 100,
        step: 1,
        minStepsBetweenThumbs: 0,
        disabled: false,
        inverted: false,
        radius: 80,
        startAngle: -90,
        endAngle: 270,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;

      if (key === "values" && Array.isArray(value)) {
        const hasChanged = String(state.values) !== String(value);
        state.values = value;
        if (hasChanged) {
          onValueChange?.(value);
        }
      } else {
        state[key] = value;
      }

      store.notify();
    },
    addThumb: (index, thumbData) => {
      const state = stateRef.current;
      if (state) {
        state.thumbs.set(index, thumbData);
        store.notify();
      }
    },
    removeThumb: (index) => {
      const state = stateRef.current;
      if (state) {
        state.thumbs.delete(index);
        store.notify();
      }
    },
    updateValue: (value, atIndex, { commit = false } = {}) => {
      const state = stateRef.current;
      if (!state) return;

      const { min, max, step, minStepsBetweenThumbs } = state;
      const decimalCount = getDecimalCount(step);
      const snapToStep = roundValue(
        Math.round((value - min) / step) * step + min,
        decimalCount,
      );
      const nextValue = clamp(snapToStep, [min, max]);

      const nextValues = getNextSortedValues(state.values, nextValue, atIndex);

      if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs * step)) {
        state.valueIndexToChange = nextValues.indexOf(nextValue);
        const hasChanged = String(nextValues) !== String(state.values);

        if (hasChanged) {
          state.values = nextValues;
          onValueChange?.(nextValues);
          if (commit) onValueCommit?.(nextValues);
          store.notify();
        }
      }
    },
    getValueFromPointer: (clientX, clientY, rect) => {
      const state = stateRef.current;
      if (!state) return 0;

      const { min, max, inverted, startAngle, endAngle } = state;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      let angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      if (angle < 0) angle += 360;

      angle = (angle - startAngle + 360) % 360;

      const totalAngle = (endAngle - startAngle + 360) % 360 || 360;

      let percent = angle / totalAngle;
      if (inverted) percent = 1 - percent;

      return min + percent * (max - min);
    },
    getAngleFromValue: (value) => {
      const state = stateRef.current;
      if (!state) return 0;

      const { min, max, inverted, startAngle, endAngle } = state;
      let percent = (value - min) / (max - min);
      if (inverted) percent = 1 - percent;

      const totalAngle = (endAngle - startAngle + 360) % 360 || 360;
      const angle = startAngle + percent * totalAngle;

      return angle;
    },
    getPositionFromAngle: (angle) => {
      const state = stateRef.current;
      if (!state) return { x: 0, y: 0 };

      const { radius } = state;
      const radians = (angle * Math.PI) / 180;

      return {
        x: radius * Math.cos(radians),
        y: radius * Math.sin(radians),
      };
    },
    notify: () => {
      if (listenersRef.current) {
        for (const cb of listenersRef.current) {
          cb();
        }
      }
    },
  };

  return store;
}

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
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

interface SliderContextValue {
  id: string;
  dir: Direction;
  name?: string;
  form?: string;
}

const SliderContext = React.createContext<SliderContextValue | null>(null);

function useSliderContext(consumerName: string) {
  const context = React.useContext(SliderContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface AngleSliderRootProps extends Omit<DivProps, "defaultValue"> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  dir?: Direction;
  disabled?: boolean;
  inverted?: boolean;
  form?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

function AngleSliderRoot(props: AngleSliderRootProps) {
  const {
    value,
    defaultValue = [0],
    onValueChange,
    onValueCommit,
    name,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    id: idProp,
    dir: dirProp,
    disabled = false,
    inverted = false,
    form,
    radius = 80,
    startAngle = -90,
    endAngle = 270,
    asChild,
    className,
    children,
    ref,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    values: value ?? defaultValue,
    thumbs: new Map(),
    valueIndexToChange: 0,
    min,
    max,
    step,
    minStepsBetweenThumbs,
    disabled,
    inverted,
    radius,
    startAngle,
    endAngle,
  }));

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef, onValueChange, onValueCommit),
    [listenersRef, stateRef, onValueChange, onValueCommit],
  );

  React.useEffect(() => {
    if (value !== undefined) {
      store.setState("values", value);
    }
  }, [value, store]);

  React.useEffect(() => {
    store.setState("min", min);
    store.setState("max", max);
    store.setState("step", step);
    store.setState("minStepsBetweenThumbs", minStepsBetweenThumbs);
    store.setState("disabled", disabled);
    store.setState("inverted", inverted);
    store.setState("radius", radius);
    store.setState("startAngle", startAngle);
    store.setState("endAngle", endAngle);
  }, [
    min,
    max,
    step,
    minStepsBetweenThumbs,
    disabled,
    inverted,
    radius,
    startAngle,
    endAngle,
    store,
  ]);

  const dir = useDirection(dirProp);
  const id = React.useId();
  const rootId = idProp ?? id;

  const [sliderElement, setSliderElement] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, setSliderElement);
  const valuesBeforeSlideStartRef = React.useRef(value ?? defaultValue);

  const contextValue = React.useMemo<SliderContextValue>(
    () => ({
      id: rootId,
      dir,
      name,
      form,
    }),
    [rootId, dir, name, form],
  );

  const onSliderStart = React.useCallback(
    (pointerValue: number) => {
      if (disabled) return;

      const values = store.getState().values;
      const closestIndex = getClosestValueIndex(values, pointerValue);
      store.setState("valueIndexToChange", closestIndex);
      store.updateValue(pointerValue, closestIndex);
    },
    [store, disabled],
  );

  const onSliderMove = React.useCallback(
    (pointerValue: number) => {
      if (disabled) return;

      const valueIndexToChange = store.getState().valueIndexToChange;
      store.updateValue(pointerValue, valueIndexToChange);
    },
    [store, disabled],
  );

  const onSliderEnd = React.useCallback(() => {
    if (disabled) return;

    const state = store.getState();
    const prevValue =
      valuesBeforeSlideStartRef.current[state.valueIndexToChange];
    const nextValue = state.values[state.valueIndexToChange];
    const hasChanged = nextValue !== prevValue;

    if (hasChanged) {
      onValueCommit?.(state.values);
    }
  }, [store, disabled, onValueCommit]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      rootProps.onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;

      const state = store.getState();
      const { values, valueIndexToChange, min, max, step } = state;
      const currentValue = values[valueIndexToChange] ?? min;

      if (event.key === "Home") {
        event.preventDefault();
        store.updateValue(min, 0, { commit: true });
      } else if (event.key === "End") {
        event.preventDefault();
        store.updateValue(max, values.length - 1, { commit: true });
      } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
        event.preventDefault();

        const isPageKey = PAGE_KEYS.includes(event.key);
        const isSkipKey =
          isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key));
        const multiplier = isSkipKey ? 10 : 1;

        let direction = 0;
        const isDecreaseKey = ["ArrowLeft", "ArrowUp", "PageUp"].includes(
          event.key,
        );
        direction = isDecreaseKey ? -1 : 1;
        if (inverted) direction *= -1;

        const stepInDirection = step * multiplier * direction;
        store.updateValue(currentValue + stepInDirection, valueIndexToChange, {
          commit: true,
        });
      }
    },
    [rootProps.onKeyDown, disabled, store, inverted],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      rootProps.onPointerDown?.(event);
      if (event.defaultPrevented || disabled) return;

      const target = event.target as HTMLElement;
      target.setPointerCapture(event.pointerId);
      event.preventDefault();

      if (!disabled) {
        valuesBeforeSlideStartRef.current = store.getState().values;

        const thumbs = Array.from(store.getState().thumbs.values());
        const clickedThumb = thumbs.find((thumb) =>
          thumb.element.contains(target),
        );

        if (clickedThumb) {
          clickedThumb.element.focus();
          store.setState("valueIndexToChange", clickedThumb.index);
        } else if (sliderElement) {
          const rect = sliderElement.getBoundingClientRect();
          const pointerValue = store.getValueFromPointer(
            event.clientX,
            event.clientY,
            rect,
          );
          onSliderStart(pointerValue);
        }
      }
    },
    [rootProps.onPointerDown, disabled, store, sliderElement, onSliderStart],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      rootProps.onPointerMove?.(event);
      if (event.defaultPrevented || disabled) return;

      const target = event.target as HTMLElement;
      if (target.hasPointerCapture(event.pointerId) && sliderElement) {
        const rect = sliderElement.getBoundingClientRect();
        const pointerValue = store.getValueFromPointer(
          event.clientX,
          event.clientY,
          rect,
        );
        onSliderMove(pointerValue);
      }
    },
    [rootProps.onPointerMove, disabled, sliderElement, store, onSliderMove],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      rootProps.onPointerUp?.(event);
      if (event.defaultPrevented) return;

      const target = event.target as RootElement;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
        onSliderEnd();
      }
    },
    [rootProps.onPointerUp, onSliderEnd],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <SliderContext.Provider value={contextValue}>
        <RootPrimitive
          id={rootId}
          data-disabled={disabled ? "" : undefined}
          data-slot="slider"
          dir={dir}
          {...rootProps}
          ref={composedRef}
          className={cn(
            "relative touch-none select-none",
            disabled && "opacity-50",
            className,
          )}
          style={{
            width: `${radius * 2 + 40}px`,
            height: `${radius * 2 + 40}px`,
          }}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {children}
        </RootPrimitive>
      </SliderContext.Provider>
    </StoreContext.Provider>
  );
}

interface AngleSliderTrackProps extends React.ComponentProps<"svg"> {
  asChild?: boolean;
}

function AngleSliderTrack(props: AngleSliderTrackProps) {
  const { className, asChild, children, ...trackProps } = props;

  const disabled = useStore((state) => state.disabled);
  const radius = useStore((state) => state.radius);
  const startAngle = useStore((state) => state.startAngle);
  const endAngle = useStore((state) => state.endAngle);

  const center = radius + 20;
  const strokeWidth = 8;
  const trackRadius = radius;

  const totalAngle = (endAngle - startAngle + 360) % 360 || 360;
  const isFullCircle = totalAngle >= 359;

  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;

  const startX = center + trackRadius * Math.cos(startRadians);
  const startY = center + trackRadius * Math.sin(startRadians);
  const endX = center + trackRadius * Math.cos(endRadians);
  const endY = center + trackRadius * Math.sin(endRadians);

  const largeArcFlag = totalAngle > 180 ? 1 : 0;

  if (asChild) {
    return <>{children}</>;
  }

  return (
    <svg
      data-disabled={disabled ? "" : undefined}
      data-slot="slider-track"
      {...trackProps}
      className={cn("absolute inset-0", className)}
      width={center * 2}
      height={center * 2}
    >
      {isFullCircle ? (
        <circle
          cx={center}
          cy={center}
          r={trackRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
      ) : (
        <path
          d={`M ${startX} ${startY} A ${trackRadius} ${trackRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-muted"
        />
      )}
      {children}
    </svg>
  );
}

interface AngleSliderRangeProps extends React.SVGProps<SVGPathElement> {
  asChild?: boolean;
}

function AngleSliderRange(props: AngleSliderRangeProps) {
  const { className, asChild, children, ...rangeProps } = props;

  const values = useStore((state) => state.values);
  const min = useStore((state) => state.min);
  const max = useStore((state) => state.max);
  const disabled = useStore((state) => state.disabled);
  const radius = useStore((state) => state.radius);
  const startAngle = useStore((state) => state.startAngle);
  const endAngle = useStore((state) => state.endAngle);

  const center = radius + 20;
  const strokeWidth = 8;
  const trackRadius = radius;

  const sortedValues = [...values].sort((a, b) => a - b);

  const rangeStart = values.length <= 1 ? min : (sortedValues[0] ?? min);
  const rangeEnd =
    values.length <= 1
      ? (sortedValues[0] ?? min)
      : (sortedValues[sortedValues.length - 1] ?? max);

  const rangeStartPercent = (rangeStart - min) / (max - min);
  const rangeEndPercent = (rangeEnd - min) / (max - min);

  const totalAngle = (endAngle - startAngle + 360) % 360 || 360;
  const rangeStartAngle = startAngle + rangeStartPercent * totalAngle;
  const rangeEndAngle = startAngle + rangeEndPercent * totalAngle;

  const rangeStartRadians = (rangeStartAngle * Math.PI) / 180;
  const rangeEndRadians = (rangeEndAngle * Math.PI) / 180;

  const startX = center + trackRadius * Math.cos(rangeStartRadians);
  const startY = center + trackRadius * Math.sin(rangeStartRadians);
  const endX = center + trackRadius * Math.cos(rangeEndRadians);
  const endY = center + trackRadius * Math.sin(rangeEndRadians);

  const rangeAngle = (rangeEndAngle - rangeStartAngle + 360) % 360;
  const largeArcFlag = rangeAngle > 180 ? 1 : 0;

  if (asChild) {
    return <>{children}</>;
  }

  if (rangeStart === rangeEnd) {
    return null;
  }

  return (
    <path
      data-disabled={disabled ? "" : undefined}
      data-slot="slider-range"
      {...rangeProps}
      d={`M ${startX} ${startY} A ${trackRadius} ${trackRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={cn("text-primary", className)}
    />
  );
}

interface AngleSliderThumbProps extends DivProps {
  index?: number;
  name?: string;
}

function AngleSliderThumb(props: AngleSliderThumbProps) {
  const {
    index: indexProp,
    name: nameProp,
    className,
    asChild,
    ref,
    ...thumbProps
  } = props;

  const context = useSliderContext(THUMB_NAME);
  const store = useStoreContext(THUMB_NAME);
  const values = useStore((state) => state.values);
  const min = useStore((state) => state.min);
  const max = useStore((state) => state.max);
  const step = useStore((state) => state.step);
  const disabled = useStore((state) => state.disabled);
  const radius = useStore((state) => state.radius);

  const thumbId = React.useId();
  const [thumbElement, setThumbElement] = React.useState<ThumbElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, setThumbElement);

  const isFormControl = thumbElement
    ? context.form || !!thumbElement.closest("form")
    : true;

  const index = indexProp ?? 0;
  const value = values[index];

  React.useEffect(() => {
    if (thumbElement && value !== undefined) {
      store.addThumb(index, {
        id: thumbId,
        element: thumbElement,
        index,
        value,
      });

      return () => {
        store.removeThumb(index);
      };
    }
  }, [thumbElement, thumbId, index, value, store]);

  const thumbStyle = React.useMemo<React.CSSProperties>(() => {
    if (value === undefined) return {};

    const angle = store.getAngleFromValue(value);
    const position = store.getPositionFromAngle(angle);
    const center = radius + 20;

    return {
      position: "absolute",
      left: `${center + position.x}px`,
      top: `${center + position.y}px`,
      transform: "translate(-50%, -50%)",
    };
  }, [value, store, radius]);

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ThumbElement>) => {
      props.onFocus?.(event);
      if (event.defaultPrevented) return;

      store.setState("valueIndexToChange", index);
    },
    [props.onFocus, store, index],
  );

  const ThumbPrimitive = asChild ? Slot : "div";

  if (value === undefined) return null;

  return (
    <span style={thumbStyle}>
      <ThumbPrimitive
        id={thumbId}
        role="slider"
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuemax={max}
        aria-orientation="vertical"
        data-disabled={disabled ? "" : undefined}
        data-slot="slider-thumb"
        tabIndex={disabled ? undefined : 0}
        {...thumbProps}
        ref={composedRef}
        className={cn(
          "block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        onFocus={onFocus}
      />
      {isFormControl && value !== undefined && (
        <VisuallyHiddenInput
          key={index}
          control={thumbElement}
          name={
            nameProp ??
            (context.name
              ? context.name + (values.length > 1 ? "[]" : "")
              : undefined)
          }
          form={context.form}
          value={value.toString()}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
      )}
    </span>
  );
}

interface AngleSliderValueProps extends DivProps {
  unit?: string;
  formatValue?: (value: number | number[]) => string;
}

function AngleSliderValue(props: AngleSliderValueProps) {
  const {
    unit = "°",
    formatValue,
    className,
    style,
    asChild,
    children,
    ...valueProps
  } = props;

  const values = useStore((state) => state.values);
  const radius = useStore((state) => state.radius);
  const disabled = useStore((state) => state.disabled);

  const center = radius + 20;

  const displayValue = React.useMemo(() => {
    if (formatValue) {
      return formatValue(values.length === 1 ? (values[0] ?? 0) : values);
    }

    if (values.length === 1) {
      return `${values[0] ?? 0}${unit}`;
    }

    const sortedValues = [...values].sort((a, b) => a - b);
    return `${sortedValues[0]}${unit} - ${sortedValues[sortedValues.length - 1]}${unit}`;
  }, [values, formatValue, unit]);

  const valueStyle = React.useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      left: `${center}px`,
      top: `${center}px`,
      transform: "translate(-50%, -50%)",
    }),
    [center],
  );

  const ValuePrimitive = asChild ? Slot : "div";

  return (
    <ValuePrimitive
      data-disabled={disabled ? "" : undefined}
      data-slot="slider-value"
      {...valueProps}
      className={cn(
        "pointer-events-none flex select-none items-center justify-center font-medium text-foreground text-sm",
        className,
      )}
      style={{
        ...valueStyle,
        ...style,
      }}
    >
      {children ?? displayValue}
    </ValuePrimitive>
  );
}

export {
  AngleSliderRoot as Root,
  AngleSliderTrack as Track,
  AngleSliderRange as Range,
  AngleSliderThumb as Thumb,
  AngleSliderValue as Value,
  //
  AngleSliderRoot as AngleSlider,
  AngleSliderTrack,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderValue,
  //
  useStore as useAngleSlider,
  //
  type AngleSliderRootProps as AngleSliderProps,
};
