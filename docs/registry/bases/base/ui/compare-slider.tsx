"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { clamp } from "@base-ui/utils/clamp";
import { NOOP } from "@base-ui/utils/empty";
import { ReactStore, useStore } from "@base-ui/utils/store";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { cn } from "cn";
import * as React from "react";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const ROOT_NAME = "CompareSlider";
const BEFORE_NAME = "CompareSliderBefore";
const AFTER_NAME = "CompareSliderAfter";
const LABEL_NAME = "CompareSliderLabel";
const HANDLE_NAME = "CompareSliderHandle";

const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

type Interaction = "hover" | "drag";
type Orientation = "horizontal" | "vertical";

type RootElement = HTMLDivElement;

interface StoreState {
  value: number;
  valueProp: number | undefined;
}

interface StoreContext {
  onValueChange: (value: number) => void;
}

const selectors = {
  value: (state: StoreState) =>
    state.valueProp === undefined
      ? state.value
      : clamp(state.valueProp, 0, 100),
};

type Store = ReactStore<StoreState, StoreContext, typeof selectors>;

function setValue(store: Store, value: number) {
  if (Object.is(store.select("value"), value)) return;
  store.context.onValueChange(value);
  store.set("value", value);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
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

interface CompareSliderProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {
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
    render,
    ref,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerDown: onPointerDownProp,
    onPointerCancel: onPointerCancelProp,
    onKeyDown: onKeyDownProp,
    ...rootProps
  } = props;

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreContext, typeof selectors>(
        { value: clamp(valueProp ?? defaultValue, 0, 100), valueProp },
        { onValueChange: NOOP },
        selectors,
      ),
  );

  store.useControlledProp("valueProp", valueProp);
  store.useContextCallback("onValueChange", onValueChange);

  const rootRef = React.useRef<RootElement | null>(null);
  const composedRef = useMergedRefs(ref, rootRef);
  const isDraggingRef = React.useRef(false);

  const value = useStore(store, selectors.value);

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      if (!isDraggingRef.current && interaction === "drag") {
        return;
      }
      if (!rootRef.current) return;

      onPointerMoveProp?.(event);
      if (event.defaultPrevented) return;

      const rootRect = rootRef.current.getBoundingClientRect();
      const isVertical = orientation === "vertical";
      const position = isVertical
        ? event.clientY - rootRect.top
        : event.clientX - rootRect.left;
      const size = isVertical ? rootRect.height : rootRect.width;
      const percentage = clamp((position / size) * 100, 0, 100);

      setValue(store, percentage);
    },
    [interaction, onPointerMoveProp, orientation, store],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      if (interaction !== "drag") return;

      onPointerDownProp?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      isDraggingRef.current = true;
    },
    [interaction, onPointerDownProp],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      if (interaction !== "drag") return;

      onPointerUpProp?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.releasePointerCapture(event.pointerId);
      isDraggingRef.current = false;
    },
    [interaction, onPointerUpProp],
  );

  const onPointerCancel = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      onPointerCancelProp?.(event);
      onPointerUp(event);
    },
    [onPointerCancelProp, onPointerUp],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      const currentValue = store.select("value");
      const isVertical = orientation === "vertical";

      if (event.key === "Home") {
        event.preventDefault();
        setValue(store, 0);
      } else if (event.key === "End") {
        event.preventDefault();
        setValue(store, 100);
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

        const stepInDirection = step * multiplier * direction;
        const newValue = clamp(currentValue + stepInDirection, 0, 100);
        setValue(store, newValue);
      }
    },
    [store, onKeyDownProp, orientation, step],
  );

  const contextValue = React.useMemo<CompareSliderContextValue>(
    () => ({
      interaction,
      orientation,
    }),
    [interaction, orientation],
  );

  const element = useRender({
    defaultTagName: "div",
    props: {
      ...mergeProps<"div">(
        {
          role: "slider",
          "aria-orientation": orientation,
          "aria-valuemax": 100,
          "aria-valuemin": 0,
          "aria-valuenow": value,
          tabIndex: 0,
          className: cn(
            "cn-compare-slider",
            orientation === "horizontal" ? "w-full" : "h-full",
            className,
          ),
          ref: composedRef,
          children,
        },
        rootProps,
      ),
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
    },
    render,
    state: {
      slot: "compare-slider",
      orientation,
    },
  });

  return (
    <StoreContext.Provider value={store}>
      <CompareSliderContext.Provider value={contextValue}>
        {element}
      </CompareSliderContext.Provider>
    </StoreContext.Provider>
  );
}

interface CompareSliderBeforeProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {
  label?: string;
}

function CompareSliderBefore(props: CompareSliderBeforeProps) {
  const { className, children, style, label, render, ...beforeProps } = props;

  const value = useStore(useStoreContext(BEFORE_NAME), selectors.value);
  const { orientation } = useCompareSliderContext(BEFORE_NAME);

  const labelId = React.useId();

  const isVertical = orientation === "vertical";
  const clipPath = isVertical
    ? `inset(${value}% 0 0 0)`
    : `inset(0 0 0 ${value}%)`;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "img",
        "aria-labelledby": label ? labelId : undefined,
        "aria-hidden": label ? undefined : "true",
        className: cn("cn-compare-slider-before", className),
        style: {
          clipPath,
          ...style,
        },
        children: (
          <>
            {children}
            {label && (
              <CompareSliderLabel id={labelId} side="before">
                {label}
              </CompareSliderLabel>
            )}
          </>
        ),
      },
      beforeProps,
    ),
    render,
    state: {
      slot: "compare-slider-before",
      orientation,
    },
  });
}

interface CompareSliderAfterProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {
  label?: string;
}

function CompareSliderAfter(props: CompareSliderAfterProps) {
  const { className, children, style, label, render, ...afterProps } = props;

  const value = useStore(useStoreContext(AFTER_NAME), selectors.value);
  const { orientation } = useCompareSliderContext(AFTER_NAME);

  const labelId = React.useId();

  const isVertical = orientation === "vertical";
  const clipPath = isVertical
    ? `inset(0 0 ${100 - value}% 0)`
    : `inset(0 ${100 - value}% 0 0)`;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "img",
        "aria-labelledby": label ? labelId : undefined,
        "aria-hidden": label ? undefined : "true",
        className: cn("cn-compare-slider-after", className),
        style: {
          clipPath,
          ...style,
        },
        children: (
          <>
            {children}
            {label && (
              <CompareSliderLabel id={labelId} side="after">
                {label}
              </CompareSliderLabel>
            )}
          </>
        ),
      },
      afterProps,
    ),
    render,
    state: {
      slot: "compare-slider-after",
      orientation,
    },
  });
}

interface CompareSliderHandleProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function CompareSliderHandle(props: CompareSliderHandleProps) {
  const { className, children, style, render, ...handleProps } = props;

  const value = useStore(useStoreContext(HANDLE_NAME), selectors.value);
  const { interaction, orientation } = useCompareSliderContext(HANDLE_NAME);

  const isVertical = orientation === "vertical";

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "presentation",
        "aria-hidden": "true",
        className: cn(
          "cn-compare-slider-handle",
          isVertical
            ? "left-0 h-10 w-full -translate-y-1/2"
            : "top-0 h-full w-10 [translate:-50%_0]",
          interaction === "drag" && "cursor-grab active:cursor-grabbing",
          className,
        ),
        style: {
          [isVertical ? "top" : "left"]: `${value}%`,
          ...style,
        },
        children:
          children ??
          (() => (
            <>
              <div
                className={cn(
                  "cn-compare-slider-handle-2",
                  isVertical
                    ? "top-1/2 h-1 w-full -translate-y-1/2"
                    : "left-1/2 h-full w-1 -translate-x-1/2",
                )}
              />
              {interaction === "drag" && (
                <div className="cn-compare-slider-handle-3">
                  {isVertical ? (
                    <div className="cn-compare-slider-handle-4">
                      <IconPlaceholder
                        lucide="ChevronUpIcon"
                        tabler="IconChevronUp"
                        hugeicons="ArrowUp01Icon"
                        phosphor="CaretUpIcon"
                        remixicon="RiArrowUpSLine"
                      />
                      <IconPlaceholder
                        lucide="ChevronDownIcon"
                        tabler="IconChevronDown"
                        hugeicons="ArrowDown01Icon"
                        phosphor="CaretDownIcon"
                        remixicon="RiArrowDownSLine"
                      />
                    </div>
                  ) : (
                    <div className="cn-compare-slider-handle-5">
                      <IconPlaceholder
                        lucide="ChevronLeftIcon"
                        tabler="IconChevronLeft"
                        hugeicons="ArrowLeft01Icon"
                        phosphor="CaretLeftIcon"
                        remixicon="RiArrowLeftSLine"
                      />
                      <IconPlaceholder
                        lucide="ChevronRightIcon"
                        tabler="IconChevronRight"
                        hugeicons="ArrowRight01Icon"
                        phosphor="CaretRightIcon"
                        remixicon="RiArrowRightSLine"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ))(),
      },
      handleProps,
    ),
    render,
    state: {
      slot: "compare-slider-handle",
      orientation,
    },
  });
}

interface CompareSliderLabelProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {
  side?: "before" | "after";
}

function CompareSliderLabel(props: CompareSliderLabelProps) {
  const { className, children, side, render, ...labelProps } = props;

  const { orientation } = useCompareSliderContext(LABEL_NAME);
  const isVertical = orientation === "vertical";

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "cn-compare-slider-label",
          isVertical
            ? side === "before"
              ? "top-2 left-2"
              : "bottom-2 left-2"
            : side === "before"
              ? "top-2 left-2"
              : "top-2 right-2",
          className,
        ),
        children,
      },
      labelProps,
    ),
    render,
    state: {
      slot: "compare-slider-label",
    },
  });
}

export {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
  CompareSliderLabel,
  type CompareSliderProps,
};
