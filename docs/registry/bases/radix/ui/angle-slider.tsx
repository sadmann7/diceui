"use client";

import { clamp } from "@base-ui/utils/clamp";
import { NOOP } from "@base-ui/utils/empty";
import {
  createSelectorMemoized,
  ReactStore,
  useStore,
} from "@base-ui/utils/store";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { cn } from "cn";
import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";

import { VisuallyHiddenInput } from "@/registry/bases/radix/components/visually-hidden-input";

const ROOT_NAME = "AngleSlider";
const TRACK_NAME = "AngleSliderTrack";
const RANGE_NAME = "AngleSliderRange";
const THUMB_NAME = "AngleSliderThumb";
const VALUE_NAME = "AngleSliderValue";

const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

type Direction = "ltr" | "rtl";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = HTMLDivElement;
type ThumbElement = HTMLDivElement;

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
  valueProp: number[] | undefined;
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

interface StoreContext {
  onValueChange: (value: number[]) => void;
  onValueCommit: (value: number[]) => void;
}

function getValueFromPointer(
  state: StoreState,
  clientX: number,
  clientY: number,
  rect: DOMRect,
) {
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
}

function getAngleFromValue(state: StoreState, value: number) {
  const { min, max, inverted, startAngle, endAngle } = state;
  let percent = (value - min) / (max - min);
  if (inverted) percent = 1 - percent;

  const totalAngle = (endAngle - startAngle + 360) % 360 || 360;
  const angle = startAngle + percent * totalAngle;

  return angle;
}

function getPositionFromAngle(angle: number, size: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: size * Math.cos(radians),
    y: size * Math.sin(radians),
  };
}

function getValues(state: StoreState) {
  return state.valueProp ?? state.values;
}

const selectors = {
  values: getValues,
  min: (state: StoreState) => state.min,
  max: (state: StoreState) => state.max,
  step: (state: StoreState) => state.step,
  size: (state: StoreState) => state.size,
  thickness: (state: StoreState) => state.thickness,
  startAngle: (state: StoreState) => state.startAngle,
  endAngle: (state: StoreState) => state.endAngle,
  disabled: (state: StoreState) => state.disabled,
  angle: (state: StoreState, value: number | undefined) =>
    value === undefined ? undefined : getAngleFromValue(state, value),
  state: createSelectorMemoized(
    (state: StoreState) => state,
    getValues,
    (state, values) => (state.values === values ? state : { ...state, values }),
  ),
};

type Store = ReactStore<StoreState, StoreContext, typeof selectors>;

function addThumb(store: Store, index: number, thumbData: ThumbData) {
  store.set("thumbs", new Map(store.state.thumbs).set(index, thumbData));
}

function removeThumb(store: Store, index: number) {
  const thumbs = new Map(store.state.thumbs);
  thumbs.delete(index);
  store.set("thumbs", thumbs);
}

function updateValue(
  store: Store,
  value: number,
  atIndex: number,
  { commit = false }: { commit?: boolean } = {},
) {
  const { min, max, step, minStepsBetweenThumbs } = store.state;
  const decimalCount = getDecimalCount(step);
  const snapToStep = roundValue(
    Math.round((value - min) / step) * step + min,
    decimalCount,
  );
  const nextValue = clamp(snapToStep, min, max);

  const values = getValues(store.state);
  const nextValues = getNextSortedValues(values, nextValue, atIndex);

  if (!hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs * step)) {
    return;
  }

  store.set("valueIndexToChange", nextValues.indexOf(nextValue));
  if (String(nextValues) === String(values)) return;

  store.context.onValueChange(nextValues);
  if (commit) store.context.onValueCommit(nextValues);
  store.set("values", nextValues);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useAngleSlider<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useAngleSlider");
  return useStore(store, (state) => selector(selectors.state(state)));
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

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreContext, typeof selectors>(
        {
          values: value ?? defaultValue,
          valueProp: value,
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
        },
        { onValueChange: NOOP, onValueCommit: NOOP },
        selectors,
      ),
  );

  store.useControlledProp("valueProp", value);
  store.useContextCallback("onValueChange", onValueChange);
  store.useContextCallback("onValueCommit", onValueCommit);
  store.useSyncedValues({
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
  });

  const dir = DirectionPrimitive.useDirection(dirProp);

  const [sliderElement, setSliderElement] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useMergedRefs(ref, setSliderElement);
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

      const values = getValues(store.state);
      const closestIndex = getClosestValueIndex(values, pointerValue);
      store.set("valueIndexToChange", closestIndex);
      updateValue(store, pointerValue, closestIndex);
    },
    [store, disabled],
  );

  const onSliderMove = React.useCallback(
    (pointerValue: number) => {
      if (disabled) return;

      const valueIndexToChange = store.state.valueIndexToChange;
      updateValue(store, pointerValue, valueIndexToChange);
    },
    [store, disabled],
  );

  const onSliderEnd = React.useCallback(() => {
    if (disabled) return;

    const { valueIndexToChange } = store.state;
    const values = getValues(store.state);
    const prevValue = valuesBeforeSlideStartRef.current[valueIndexToChange];
    const nextValue = values[valueIndexToChange];
    const hasChanged = nextValue !== prevValue;

    if (hasChanged) {
      store.context.onValueCommit(values);
    }
  }, [store, disabled]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented || disabled) return;

      const { valueIndexToChange, min, max, step } = store.state;
      const values = getValues(store.state);
      const currentValue = values[valueIndexToChange] ?? min;

      if (event.key === "Home") {
        event.preventDefault();
        updateValue(store, min, 0, { commit: true });
      } else if (event.key === "End") {
        event.preventDefault();
        updateValue(store, max, values.length - 1, { commit: true });
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
        updateValue(store, currentValue + stepInDirection, valueIndexToChange, {
          commit: true,
        });
      }
    },
    [store, onKeyDownProp, disabled, inverted],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      onPointerDownProp?.(event);
      if (event.defaultPrevented || disabled) return;

      const target = event.target as HTMLElement;
      target.setPointerCapture(event.pointerId);
      event.preventDefault();

      if (!disabled) {
        valuesBeforeSlideStartRef.current = getValues(store.state);

        const thumbs = Array.from(store.state.thumbs.values());
        const clickedThumb = thumbs.find((thumb) =>
          thumb.element.contains(target),
        );

        if (clickedThumb) {
          clickedThumb.element.focus();
          store.set("valueIndexToChange", clickedThumb.index);
        } else if (sliderElement) {
          const rect = sliderElement.getBoundingClientRect();
          const pointerValue = getValueFromPointer(
            store.state,
            event.clientX,
            event.clientY,
            rect,
          );
          onSliderStart(pointerValue);
        }
      }
    },
    [store, onPointerDownProp, disabled, sliderElement, onSliderStart],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      onPointerMoveProp?.(event);
      if (event.defaultPrevented || disabled) return;

      const target = event.target as HTMLElement;
      if (target.hasPointerCapture(event.pointerId) && sliderElement) {
        const rect = sliderElement.getBoundingClientRect();
        const pointerValue = getValueFromPointer(
          store.state,
          event.clientX,
          event.clientY,
          rect,
        );
        onSliderMove(pointerValue);
      }
    },
    [store, onPointerMoveProp, disabled, sliderElement, onSliderMove],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      onPointerUpProp?.(event);
      if (event.defaultPrevented) return;

      const target = event.target as RootElement;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
        onSliderEnd();
      }
    },
    [onPointerUpProp, onSliderEnd],
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
          className={cn("cn-angle-slider", disabled && "opacity-50", className)}
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

  const store = useStoreContext(TRACK_NAME);
  const disabled = useStore(store, selectors.disabled);
  const size = useStore(store, selectors.size);
  const thickness = useStore(store, selectors.thickness);
  const startAngle = useStore(store, selectors.startAngle);
  const endAngle = useStore(store, selectors.endAngle);

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
      className={cn("cn-angle-slider-track", className)}
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
          className="cn-angle-slider-track-rail"
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
          className="cn-angle-slider-track-rail-2"
        />
      )}
      {children}
    </svg>
  );
}

function AngleSliderRange(props: React.ComponentProps<"path">) {
  const { className, ...rangeProps } = props;

  const store = useStoreContext(RANGE_NAME);
  const values = useStore(store, selectors.values);
  const min = useStore(store, selectors.min);
  const max = useStore(store, selectors.max);
  const disabled = useStore(store, selectors.disabled);
  const size = useStore(store, selectors.size);
  const thickness = useStore(store, selectors.thickness);
  const startAngle = useStore(store, selectors.startAngle);
  const endAngle = useStore(store, selectors.endAngle);

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
      className={cn("cn-angle-slider-range", className)}
    />
  );
}

interface AngleSliderThumbProps extends DivProps {
  index?: number;
}

function AngleSliderThumb(props: AngleSliderThumbProps) {
  const {
    index: indexProp,
    onFocus: onFocusProp,
    className,
    asChild,
    ref,
    ...thumbProps
  } = props;

  const context = useSliderContext(THUMB_NAME);
  const store = useStoreContext(THUMB_NAME);
  const values = useStore(store, selectors.values);
  const min = useStore(store, selectors.min);
  const max = useStore(store, selectors.max);
  const step = useStore(store, selectors.step);
  const disabled = useStore(store, selectors.disabled);
  const size = useStore(store, selectors.size);

  const thumbId = React.useId();
  const [thumbElement, setThumbElement] = React.useState<ThumbElement | null>(
    null,
  );
  const composedRef = useMergedRefs(ref, setThumbElement);

  const isFormControl = thumbElement
    ? context.form || !!thumbElement.closest("form")
    : true;

  const index = indexProp ?? 0;
  const value = values[index];
  const angle = useStore(store, selectors.angle, value);

  React.useEffect(() => {
    if (thumbElement && value !== undefined) {
      addThumb(store, index, {
        id: thumbId,
        element: thumbElement,
        index,
        value,
      });

      return () => {
        removeThumb(store, index);
      };
    }
  }, [thumbElement, thumbId, index, value, store]);

  const thumbStyle = React.useMemo<React.CSSProperties>(() => {
    if (value === undefined) return {};

    const position = getPositionFromAngle(angle ?? 0, size);
    const center = size + 20;

    return {
      position: "absolute",
      left: `${center + position.x}px`,
      top: `${center + position.y}px`,
      transform: "translate(-50%, -50%)",
    };
  }, [value, angle, size]);

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ThumbElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      store.set("valueIndexToChange", index);
    },
    [onFocusProp, store, index],
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
        className={cn("cn-angle-slider-thumb", className)}
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

  const store = useStoreContext(VALUE_NAME);
  const values = useStore(store, selectors.values);
  const size = useStore(store, selectors.size);
  const disabled = useStore(store, selectors.disabled);

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
      className={cn("cn-angle-slider-value", className)}
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
  type AngleSliderProps,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
  useAngleSlider,
};
