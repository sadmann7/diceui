"use client";

import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/bases/radix/components/visually-hidden-input";
import { useAsRef } from "@/registry/bases/radix/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/radix/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";

const ROOT_NAME = "AngleSlider";
const THUMB_NAME = "AngleSliderThumb";

const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

type Direction = "ltr" | "rtl";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof AngleSlider>;
type ThumbElement = React.ComponentRef<typeof AngleSliderThumb>;

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
  size: number;
  thickness: number;
  startAngle: number;
  endAngle: number;
  minStepsBetweenThumbs: number;
  disabled: boolean;
  inverted: boolean;
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

interface AngleSliderProps extends Omit<DivProps, "defaultValue"> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  dir?: Direction;
  form?: string;
  name?: string;
  disabled?: boolean;
  inverted?: boolean;
}

function AngleSlider(props: AngleSliderProps) {
  const {
    value,
    defaultValue = [0],
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    size = 60,
    thickness = 8,
    startAngle = -90,
    endAngle = 270,
    dir: dirProp,
    form,
    name,
    disabled = false,
    inverted = false,
    asChild,
    className,
    ref,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerDown: onPointerDownProp,
    onKeyDown: onKeyDownProp,
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
    size,
    thickness,
    startAngle,
    endAngle,
  }));

  const propsRef = useAsRef({
    onValueChange,
    onValueCommit,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerDown: onPointerDownProp,
    onKeyDown: onKeyDownProp,
  });

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "values" && Array.isArray(value)) {
          const hasChanged = String(stateRef.current.values) !== String(value);
          stateRef.current.values = value;
          if (hasChanged) {
            propsRef.current.onValueChange?.(value);
          }
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      addThumb: (index, thumbData) => {
        stateRef.current.thumbs.set(index, thumbData);
        store.notify();
      },
      removeThumb: (index) => {
        stateRef.current.thumbs.delete(index);
        store.notify();
      },
      updateValue: (value, atIndex, { commit = false } = {}) => {
        const { min, max, step, minStepsBetweenThumbs } = stateRef.current;
        const decimalCount = getDecimalCount(step);
        const snapToStep = roundValue(
          Math.round((value - min) / step) * step + min,
          decimalCount,
        );
        const nextValue = clamp(snapToStep, [min, max]);

        const nextValues = getNextSortedValues(
          stateRef.current.values,
          nextValue,
          atIndex,
        );

        if (
          hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs * step)
        ) {
          stateRef.current.valueIndexToChange = nextValues.indexOf(nextValue);
          const hasChanged =
            String(nextValues) !== String(stateRef.current.values);

          if (hasChanged) {
            stateRef.current.values = nextValues;
            propsRef.current.onValueChange?.(nextValues);
            if (commit) propsRef.current.onValueCommit?.(nextValues);
            store.notify();
          }
        }
      },
      getValueFromPointer: (clientX, clientY, rect) => {
        const { min, max, inverted, startAngle, endAngle } = stateRef.current;
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
        const { min, max, inverted, startAngle, endAngle } = stateRef.current;
        let percent = (value - min) / (max - min);
        if (inverted) percent = 1 - percent;

        const totalAngle = (endAngle - startAngle + 360) % 360 || 360;
        const angle = startAngle + percent * totalAngle;

        return angle;
      },
      getPositionFromAngle: (angle) => {
        const { size } = stateRef.current;
        const radians = (angle * Math.PI) / 180;

        return {
          x: size * Math.cos(radians),
          y: size * Math.sin(radians),
        };
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.setState("values", value);
    }
  }, [value, store]);

  useIsomorphicLayoutEffect(() => {
    const currentState = store.getState();

    if (currentState.min !== min) {
      store.setState("min", min);
    }
    if (currentState.max !== max) {
      store.setState("max", max);
    }
    if (currentState.step !== step) {
      store.setState("step", step);
    }
    if (currentState.minStepsBetweenThumbs !== minStepsBetweenThumbs) {
      store.setState("minStepsBetweenThumbs", minStepsBetweenThumbs);
    }
    if (currentState.size !== size) {
      store.setState("size", size);
    }
    if (currentState.thickness !== thickness) {
      store.setState("thickness", thickness);
    }
    if (currentState.startAngle !== startAngle) {
      store.setState("startAngle", startAngle);
    }
    if (currentState.endAngle !== endAngle) {
      store.setState("endAngle", endAngle);
    }
    if (currentState.disabled !== disabled) {
      store.setState("disabled", disabled);
    }
    if (currentState.inverted !== inverted) {
      store.setState("inverted", inverted);
    }
  }, [
    store,
    min,
    max,
    step,
    minStepsBetweenThumbs,
    size,
    thickness,
    startAngle,
    endAngle,
    disabled,
    inverted,
  ]);

  const dir = DirectionPrimitive.useDirection(dirProp);

  const [sliderElement, setSliderElement] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, setSliderElement);
  const valuesBeforeSlideStartRef = React.useRef(value ?? defaultValue);

  const contextValue = React.useMemo<SliderContextValue>(
    () => ({
      dir,
      name,
      form,
    }),
    [dir, name, form],
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
      propsRef.current.onKeyDown?.(event);
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
    [store, propsRef, disabled, inverted],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      propsRef.current.onPointerDown?.(event);
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
    [store, propsRef, disabled, sliderElement, onSliderStart],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      propsRef.current.onPointerMove?.(event);
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
    [store, propsRef, disabled, sliderElement, onSliderMove],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      propsRef.current.onPointerUp?.(event);
      if (event.defaultPrevented) return;

      const target = event.target as RootElement;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
        onSliderEnd();
      }
    },
    [propsRef, onSliderEnd],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <SliderContext.Provider value={contextValue}>
        <RootPrimitive
          data-disabled={disabled ? "" : undefined}
          data-slot="angle-slider"
          dir={dir}
          {...rootProps}
          ref={composedRef}
          className={cn(
            "relative touch-none select-none",
            disabled && "opacity-50",
            className,
          )}
          style={{
            width: `${size * 2 + 40}px`,
            height: `${size * 2 + 40}px`,
          }}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </SliderContext.Provider>
    </StoreContext.Provider>
  );
}

function AngleSliderTrack(props: React.ComponentProps<"svg">) {
  const { className, children, ...trackProps } = props;

  const disabled = useStore((state) => state.disabled);
  const size = useStore((state) => state.size);
  const thickness = useStore((state) => state.thickness);
  const startAngle = useStore((state) => state.startAngle);
  const endAngle = useStore((state) => state.endAngle);

  const center = size + 20;
  const trackRadius = size;

  const totalAngle = (endAngle - startAngle + 360) % 360 || 360;
  const isFullCircle = totalAngle >= 359;

  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;

  const startX = center + trackRadius * Math.cos(startRadians);
  const startY = center + trackRadius * Math.sin(startRadians);
  const endX = center + trackRadius * Math.cos(endRadians);
  const endY = center + trackRadius * Math.sin(endRadians);

  const largeArcFlag = totalAngle > 180 ? 1 : 0;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-disabled={disabled ? "" : undefined}
      data-slot="angle-slider-track"
      width={center * 2}
      height={center * 2}
      {...trackProps}
      className={cn("absolute inset-0", className)}
    >
      {isFullCircle ? (
        <circle
          data-slot="angle-slider-track-rail"
          cx={center}
          cy={center}
          r={trackRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-muted"
        />
      ) : (
        <path
          data-slot="angle-slider-track-rail"
          d={`M ${startX} ${startY} A ${trackRadius} ${trackRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-muted"
        />
      )}
      {children}
    </svg>
  );
}

function AngleSliderRange(props: React.ComponentProps<"path">) {
  const { className, ...rangeProps } = props;

  const values = useStore((state) => state.values);
  const min = useStore((state) => state.min);
  const max = useStore((state) => state.max);
  const disabled = useStore((state) => state.disabled);
  const size = useStore((state) => state.size);
  const thickness = useStore((state) => state.thickness);
  const startAngle = useStore((state) => state.startAngle);
  const endAngle = useStore((state) => state.endAngle);

  const center = size + 20;
  const trackRadius = size;

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

  if (rangeStart === rangeEnd) return null;

  return (
    <path
      data-disabled={disabled ? "" : undefined}
      data-slot="angle-slider-range"
      d={`M ${startX} ${startY} A ${trackRadius} ${trackRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={thickness}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      {...rangeProps}
      className={cn("stroke-primary", className)}
    />
  );
}

interface AngleSliderThumbProps extends DivProps {
  index?: number;
}

function AngleSliderThumb(props: AngleSliderThumbProps) {
  const { index: indexProp, className, asChild, ref, ...thumbProps } = props;

  const context = useSliderContext(THUMB_NAME);
  const store = useStoreContext(THUMB_NAME);
  const values = useStore((state) => state.values);
  const min = useStore((state) => state.min);
  const max = useStore((state) => state.max);
  const step = useStore((state) => state.step);
  const disabled = useStore((state) => state.disabled);
  const size = useStore((state) => state.size);

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
    const center = size + 20;

    return {
      position: "absolute",
      left: `${center + position.x}px`,
      top: `${center + position.y}px`,
      transform: "translate(-50%, -50%)",
    };
  }, [value, store, size]);

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ThumbElement>) => {
      props.onFocus?.(event);
      if (event.defaultPrevented) return;

      store.setState("valueIndexToChange", index);
    },
    [props.onFocus, store, index],
  );

  const ThumbPrimitive = asChild ? SlotPrimitive.Slot : "div";

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
        data-slot="angle-slider-thumb"
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
            context.name
              ? context.name + (values.length > 1 ? "[]" : "")
              : undefined
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
  const size = useStore((state) => state.size);
  const disabled = useStore((state) => state.disabled);

  const center = size + 20;

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

  const ValuePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ValuePrimitive
      data-disabled={disabled ? "" : undefined}
      data-slot="angle-slider-value"
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
  AngleSlider,
  AngleSliderTrack,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderValue,
  //
  useStore as useAngleSlider,
  //
  type AngleSliderProps,
};
