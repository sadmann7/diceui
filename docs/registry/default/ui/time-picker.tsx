"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

const ROOT_NAME = "TimePicker";
const LABEL_NAME = "TimePickerLabel";
const INPUT_GROUP_NAME = "TimePickerInputGroup";
const TRIGGER_NAME = "TimePickerTrigger";
const CONTENT_NAME = "TimePickerContent";
const HOUR_NAME = "TimePickerHour";
const MINUTE_NAME = "TimePickerMinute";
const SECOND_NAME = "TimePickerSecond";
const PERIOD_NAME = "TimePickerPeriod";
const CLEAR_NAME = "TimePickerClear";
const INPUT_NAME = "TimePickerInput";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

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

interface TimeValue {
  hour: number;
  minute: number;
  second: number;
  period?: "AM" | "PM";
}

function parseTimeString(
  timeString: string | undefined,
  use12Hours: boolean,
): TimeValue | null {
  if (!timeString) return null;

  const parts = timeString.split(":");
  if (parts.length < 2) return null;

  let hour = Number.parseInt(parts[0] ?? "0", 10);
  const minute = Number.parseInt(parts[1] ?? "0", 10);
  const second = parts[2] ? Number.parseInt(parts[2], 10) : 0;

  if (Number.isNaN(hour) || Number.isNaN(minute) || Number.isNaN(second)) {
    return null;
  }

  let period: "AM" | "PM" | undefined;
  if (use12Hours) {
    period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
  }

  return { hour, minute, second, period };
}

function formatTimeValue(
  value: TimeValue,
  showSeconds: boolean,
  use12Hours: boolean,
): string {
  let hour = value.hour;

  if (use12Hours) {
    const isPM = value.period === "PM";
    hour = hour === 12 ? (isPM ? 12 : 0) : isPM ? hour + 12 : hour;
  }

  const hourStr = hour.toString().padStart(2, "0");
  const minuteStr = value.minute.toString().padStart(2, "0");
  const secondStr = value.second.toString().padStart(2, "0");

  if (showSeconds) {
    return `${hourStr}:${minuteStr}:${secondStr}`;
  }
  return `${hourStr}:${minuteStr}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface StoreState {
  value: string;
  open: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  propsRef: React.RefObject<{
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
  }>,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      listenersRef.current?.add(cb);
      return () => listenersRef.current?.delete(cb);
    },
    getState: () => stateRef.current,
    setState: (key, value) => {
      if (!stateRef.current || Object.is(stateRef.current[key], value)) return;

      if (key === "value" && typeof value === "string") {
        stateRef.current.value = value;
        propsRef.current.onValueChange?.(value);
      } else if (key === "open" && typeof value === "boolean") {
        stateRef.current.open = value;
        propsRef.current.onOpenChange?.(value);
      } else {
        stateRef.current[key] = value;
      }

      store.notify();
    },
    notify: () => {
      for (const cb of listenersRef.current ?? []) {
        cb();
      }
    },
  };

  return store;
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

interface TimePickerContextValue {
  id: string;
  name?: string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  showSeconds: boolean;
  use12Hours: boolean;
  minuteStep: number;
  secondStep: number;
  hourStep: number;
  placeholder: string;
  min?: string;
  max?: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const TimePickerContext = React.createContext<TimePickerContextValue | null>(
  null,
);

function useTimePickerContext(consumerName: string) {
  const context = React.useContext(TimePickerContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

interface SpanProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

interface LabelProps extends React.ComponentProps<"label"> {
  asChild?: boolean;
}

interface InputProps extends React.ComponentProps<"input"> {
  asChild?: boolean;
}

export interface TimePickerRootProps extends DivProps {
  id?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  min?: string;
  max?: string;
  showSeconds?: boolean;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  hourStep?: number;
  placeholder?: string;
}

function TimePickerRoot(props: TimePickerRootProps) {
  const {
    value,
    defaultValue = "",
    onValueChange,
    onOpenChange,
    ...rootProps
  } = props;

  const stateRef = useLazyRef<StoreState>(() => ({
    value: value ?? defaultValue,
    open: false,
  }));
  const listenersRef = useLazyRef(() => new Set<() => void>());
  const propsRef = useAsRef({ onValueChange, onOpenChange });

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef, propsRef),
    [listenersRef, stateRef, propsRef],
  );

  return (
    <StoreContext.Provider value={store}>
      <TimePickerRootImpl {...rootProps} value={value} />
    </StoreContext.Provider>
  );
}

interface TimePickerRootImplProps
  extends Omit<
    TimePickerRootProps,
    "defaultValue" | "onValueChange" | "onOpenChange"
  > {}

function TimePickerRootImpl(props: TimePickerRootImplProps) {
  const {
    id: idProp,
    value,
    name,
    disabled = false,
    readOnly = false,
    required = false,
    invalid = false,
    min,
    max,
    showSeconds = false,
    use12Hours = false,
    minuteStep = 1,
    secondStep = 1,
    hourStep = 1,
    placeholder = "Select time",
    asChild,
    className,
    ref,
    children,
    ...rootProps
  } = props;

  const store = useStoreContext("RootImpl");

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.setState("value", value);
    }
  }, [value, store]);

  const id = React.useId();
  const generatedId = idProp ?? id;

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const rootContext: TimePickerContextValue = React.useMemo(
    () => ({
      id: generatedId,
      name,
      disabled,
      readOnly,
      required,
      invalid,
      showSeconds,
      use12Hours,
      minuteStep,
      secondStep,
      hourStep,
      placeholder,
      min,
      max,
      triggerRef,
      contentRef,
    }),
    [
      generatedId,
      name,
      disabled,
      readOnly,
      required,
      invalid,
      showSeconds,
      use12Hours,
      minuteStep,
      secondStep,
      hourStep,
      placeholder,
      min,
      max,
    ],
  );

  const open = useStore((state) => state.open);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <TimePickerContext.Provider value={rootContext}>
      <Popover
        open={open}
        onOpenChange={(newOpen: boolean) => store.setState("open", newOpen)}
      >
        <RootPrimitive
          ref={ref}
          className={cn("relative", className)}
          {...rootProps}
        >
          {children}
        </RootPrimitive>
      </Popover>
    </TimePickerContext.Provider>
  );
}

interface TimePickerLabelProps extends LabelProps {}

function TimePickerLabel(props: TimePickerLabelProps) {
  const { asChild, className, ref, ...labelProps } = props;
  const { id } = useTimePickerContext(LABEL_NAME);

  const LabelPrimitive = asChild ? Slot : "label";

  return (
    <LabelPrimitive
      ref={ref}
      htmlFor={`${id}-input-group`}
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...labelProps}
    />
  );
}

interface TimePickerInputGroupProps extends DivProps {}

function TimePickerInputGroup(props: TimePickerInputGroupProps) {
  const { asChild, className, ref, children, ...groupProps } = props;
  const { id, disabled, invalid } = useTimePickerContext(INPUT_GROUP_NAME);

  const InputGroupPrimitive = asChild ? Slot : "div";

  return (
    <PopoverAnchor asChild>
      <InputGroupPrimitive
        ref={ref}
        id={`${id}-input-group`}
        data-slot="input-group"
        role="group"
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        className={cn(
          "flex h-10 w-full items-center gap-1 rounded-md border border-input bg-background px-3 py-2 shadow-xs outline-none transition-shadow",
          "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50",
          invalid && "border-destructive ring-destructive/20",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...groupProps}
      >
        {children}
      </InputGroupPrimitive>
    </PopoverAnchor>
  );
}

interface TimePickerTriggerProps extends ButtonProps {}

function TimePickerTrigger(props: TimePickerTriggerProps) {
  const { asChild, className, children, ref, ...triggerProps } = props;
  const {
    id,
    disabled,
    readOnly,
    triggerRef: contextTriggerRef,
    name,
    required,
  } = useTimePickerContext(TRIGGER_NAME);

  const value = useStore((state) => state.value);

  const composedRef = useComposedRefs(ref, contextTriggerRef);

  const TriggerPrimitive = asChild ? Slot : "button";

  return (
    <>
      <PopoverTrigger asChild disabled={disabled || readOnly}>
        <TriggerPrimitive
          ref={composedRef}
          id={`${id}-trigger`}
          type="button"
          className={cn(
            "ml-auto flex items-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none [&>svg:not([class*='size-'])]:size-4",
            className,
          )}
          {...triggerProps}
        >
          {children ?? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
        </TriggerPrimitive>
      </PopoverTrigger>
      {name && (
        <VisuallyHiddenInput
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          control={null}
        />
      )}
    </>
  );
}

interface TimePickerContentProps extends DivProps {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

function TimePickerContent(props: TimePickerContentProps) {
  const {
    side = "bottom",
    align = "start",
    sideOffset = 4,
    className,
    ref,
    ...contentProps
  } = props;
  const { contentRef: contextContentRef } = useTimePickerContext(CONTENT_NAME);

  const composedRef = useComposedRefs(ref, contextContentRef);

  return (
    <PopoverContent
      ref={composedRef}
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn("w-auto max-w-(--radix-popover-trigger-width)", className)}
      {...contentProps}
    />
  );
}

interface TimePickerColumnContextValue {
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  items: Array<{
    value: number;
    ref: React.RefObject<HTMLButtonElement | null>;
  }>;
  registerItem: (
    value: number,
    ref: React.RefObject<HTMLButtonElement | null>,
  ) => void;
  unregisterItem: (value: number) => void;
}

const TimePickerColumnContext =
  React.createContext<TimePickerColumnContextValue | null>(null);

function useTimePickerColumnContext(consumerName: string) {
  const context = React.useContext(TimePickerColumnContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within a column`);
  }
  return context;
}

interface TimePickerColumnProps extends DivProps {}

function TimePickerColumn(props: TimePickerColumnProps) {
  const { children, className, ref, ...columnProps } = props;

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const itemsRef = React.useRef<
    Map<number, React.RefObject<HTMLButtonElement | null>>
  >(new Map());

  const registerItem = React.useCallback(
    (value: number, ref: React.RefObject<HTMLButtonElement | null>) => {
      itemsRef.current.set(value, ref);
    },
    [],
  );

  const unregisterItem = React.useCallback((value: number) => {
    itemsRef.current.delete(value);
  }, []);

  const contextValue = React.useMemo<TimePickerColumnContextValue>(
    () => ({
      activeIndex,
      setActiveIndex,
      items: Array.from(itemsRef.current.entries()).map(([value, ref]) => ({
        value,
        ref,
      })),
      registerItem,
      unregisterItem,
    }),
    [activeIndex, registerItem, unregisterItem],
  );

  return (
    <TimePickerColumnContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...columnProps}
      >
        {children}
      </div>
    </TimePickerColumnContext.Provider>
  );
}

interface TimePickerColumnItemProps extends ButtonProps {
  value: number;
  selected?: boolean;
  format?: "numeric" | "2-digit";
}

function TimePickerColumnItem(props: TimePickerColumnItemProps) {
  const {
    value,
    selected = false,
    format = "numeric",
    className,
    ref,
    ...itemProps
  } = props;

  const itemRef = React.useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const columnContext = useTimePickerColumnContext("TimePickerColumnItem");

  React.useEffect(() => {
    columnContext.registerItem(value, itemRef);
    return () => columnContext.unregisterItem(value);
  }, [value, columnContext]);

  React.useEffect(() => {
    if (selected && itemRef.current) {
      itemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [selected]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      itemProps.onClick?.(event);
      if (event.defaultPrevented) return;

      itemRef.current?.focus();
    },
    [itemProps.onClick],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      itemProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const items = Array.from(columnContext.items).sort(
          (a, b) => a.value - b.value,
        );
        const currentIndex = items.findIndex((item) => item.value === value);

        let nextIndex: number;
        if (event.key === "ArrowUp") {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        } else {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }

        const nextItem = items[nextIndex];
        nextItem?.ref.current?.focus();
        nextItem?.ref.current?.click();
      }
    },
    [itemProps.onKeyDown, columnContext.items, value],
  );

  const formattedValue =
    format === "2-digit" ? value.toString().padStart(2, "0") : value.toString();

  return (
    <button
      ref={composedRef}
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      {...itemProps}
    >
      {formattedValue}
    </button>
  );
}

interface TimePickerHourProps extends DivProps {
  format?: "numeric" | "2-digit";
}

function TimePickerHour(props: TimePickerHourProps) {
  const { asChild, format = "numeric", className, ref, ...hourProps } = props;
  const { use12Hours, hourStep, showSeconds } = useTimePickerContext(HOUR_NAME);
  const store = useStoreContext(HOUR_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value, use12Hours);

  const maxHour = use12Hours ? 12 : 23;
  const hours = Array.from(
    { length: Math.ceil((maxHour + 1) / hourStep) },
    (_, i) => {
      const hour = i * hourStep;
      return use12Hours ? (hour === 0 ? 12 : hour) : hour;
    },
  );

  const onHourSelect = React.useCallback(
    (hour: number) => {
      const currentTime = timeValue ?? {
        hour: 0,
        minute: 0,
        second: 0,
        period: "AM" as const,
      };
      const newTime = { ...currentTime, hour };
      const newValue = formatTimeValue(newTime, showSeconds, use12Hours);
      store.setState("value", newValue);
    },
    [timeValue, showSeconds, use12Hours, store],
  );

  const HourPrimitive = asChild ? Slot : TimePickerColumn;

  return (
    <HourPrimitive ref={ref} className={cn(className)} {...hourProps}>
      <div className="mb-1 font-medium text-muted-foreground text-xs">Hour</div>
      <div className="max-h-[200px] space-y-1 overflow-y-auto">
        {hours.map((hour) => (
          <TimePickerColumnItem
            key={hour}
            value={hour}
            selected={timeValue?.hour === hour}
            format={format}
            onClick={() => onHourSelect(hour)}
          />
        ))}
      </div>
    </HourPrimitive>
  );
}

interface TimePickerMinuteProps extends DivProps {
  format?: "numeric" | "2-digit";
}

function TimePickerMinute(props: TimePickerMinuteProps) {
  const { asChild, format = "2-digit", className, ref, ...minuteProps } = props;
  const { use12Hours, minuteStep, showSeconds } =
    useTimePickerContext(MINUTE_NAME);
  const store = useStoreContext(MINUTE_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value, use12Hours);

  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep,
  );

  const onMinuteSelect = React.useCallback(
    (minute: number) => {
      const currentTime = timeValue ?? {
        hour: 0,
        minute: 0,
        second: 0,
        period: "AM" as const,
      };
      const newTime = { ...currentTime, minute };
      const newValue = formatTimeValue(newTime, showSeconds, use12Hours);
      store.setState("value", newValue);
    },
    [timeValue, showSeconds, use12Hours, store],
  );

  const MinutePrimitive = asChild ? Slot : TimePickerColumn;

  return (
    <MinutePrimitive ref={ref} className={cn(className)} {...minuteProps}>
      <div className="mb-1 font-medium text-muted-foreground text-xs">
        Minute
      </div>
      <div className="max-h-[200px] space-y-1 overflow-y-auto">
        {minutes.map((minute) => (
          <TimePickerColumnItem
            key={minute}
            value={minute}
            selected={timeValue?.minute === minute}
            format={format}
            onClick={() => onMinuteSelect(minute)}
          />
        ))}
      </div>
    </MinutePrimitive>
  );
}

interface TimePickerSecondProps extends DivProps {
  format?: "numeric" | "2-digit";
}

function TimePickerSecond(props: TimePickerSecondProps) {
  const { asChild, format = "2-digit", className, ref, ...secondProps } = props;
  const { use12Hours, secondStep } = useTimePickerContext(SECOND_NAME);
  const store = useStoreContext(SECOND_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value, use12Hours);

  const seconds = Array.from(
    { length: Math.ceil(60 / secondStep) },
    (_, i) => i * secondStep,
  );

  const onSecondSelect = React.useCallback(
    (second: number) => {
      const currentTime = timeValue ?? {
        hour: 0,
        minute: 0,
        second: 0,
        period: "AM" as const,
      };
      const newTime = { ...currentTime, second };
      const newValue = formatTimeValue(newTime, true, use12Hours);
      store.setState("value", newValue);
    },
    [timeValue, use12Hours, store],
  );

  const SecondPrimitive = asChild ? Slot : TimePickerColumn;

  return (
    <SecondPrimitive ref={ref} className={cn(className)} {...secondProps}>
      <div className="mb-1 font-medium text-muted-foreground text-xs">
        Second
      </div>
      <div className="max-h-[200px] space-y-1 overflow-y-auto">
        {seconds.map((second) => (
          <TimePickerColumnItem
            key={second}
            value={second}
            selected={timeValue?.second === second}
            format={format}
            onClick={() => onSecondSelect(second)}
          />
        ))}
      </div>
    </SecondPrimitive>
  );
}

interface TimePickerPeriodProps extends DivProps {}

function TimePickerPeriod(props: TimePickerPeriodProps) {
  const { asChild, className, ref, ...periodProps } = props;
  const { use12Hours, showSeconds } = useTimePickerContext(PERIOD_NAME);
  const store = useStoreContext(PERIOD_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value, use12Hours);

  const onPeriodToggle = React.useCallback(
    (period: "AM" | "PM") => {
      const currentTime = timeValue ?? {
        hour: 12,
        minute: 0,
        second: 0,
        period: "AM" as const,
      };
      const newTime = { ...currentTime, period };
      const newValue = formatTimeValue(newTime, showSeconds, use12Hours);
      store.setState("value", newValue);
    },
    [timeValue, showSeconds, use12Hours, store],
  );

  if (!use12Hours) return null;

  const PeriodPrimitive = asChild ? Slot : "div";

  return (
    <PeriodPrimitive
      ref={ref}
      className={cn("flex flex-col gap-1", className)}
      {...periodProps}
    >
      <div className="mb-1 font-medium text-muted-foreground text-xs">
        Period
      </div>
      <div className="space-y-1">
        {(["AM", "PM"] as const).map((period) => {
          const isSelected = timeValue?.period === period;
          return (
            <button
              key={period}
              type="button"
              onClick={() => onPeriodToggle(period)}
              className={cn(
                "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {period}
            </button>
          );
        })}
      </div>
    </PeriodPrimitive>
  );
}

interface TimePickerSeparatorProps extends SpanProps {}

function TimePickerSeparator(props: TimePickerSeparatorProps) {
  const { asChild, className, children, ref, ...separatorProps } = props;

  const SeparatorPrimitive = asChild ? Slot : "span";

  return (
    <SeparatorPrimitive
      ref={ref}
      aria-hidden="true"
      className={cn("text-muted-foreground", className)}
      {...separatorProps}
    >
      {children ?? ":"}
    </SeparatorPrimitive>
  );
}

interface TimePickerClearProps extends ButtonProps {}

function TimePickerClear(props: TimePickerClearProps) {
  const { asChild, className, children, ref, ...clearProps } = props;
  const { disabled, readOnly } = useTimePickerContext(CLEAR_NAME);
  const store = useStoreContext(CLEAR_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      clearProps.onClick?.(event);
      if (event.defaultPrevented) return;

      event.preventDefault();
      if (disabled || readOnly) return;
      store.setState("value", "");
    },
    [clearProps.onClick, disabled, readOnly, store],
  );

  const ClearPrimitive = asChild ? Slot : "button";

  return (
    <ClearPrimitive
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled || readOnly}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...clearProps}
    >
      {children ?? "Clear"}
    </ClearPrimitive>
  );
}

type SegmentType = "hour" | "minute" | "second" | "period";

interface TimePickerInputProps extends Omit<InputProps, "type" | "value"> {
  segment?: SegmentType;
}

function TimePickerInput(props: TimePickerInputProps) {
  const {
    segment,
    className,
    ref,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    onKeyDown: onKeyDownProp,
    ...inputProps
  } = props;
  const { use12Hours, showSeconds, disabled, readOnly } =
    useTimePickerContext(INPUT_NAME);
  const store = useStoreContext(INPUT_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value, use12Hours);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);

  const getSegmentValue = React.useCallback(() => {
    if (!timeValue) return "";
    switch (segment) {
      case "hour":
        return timeValue.hour.toString().padStart(2, "0");
      case "minute":
        return timeValue.minute.toString().padStart(2, "0");
      case "second":
        return timeValue.second.toString().padStart(2, "0");
      case "period":
        return timeValue.period ?? "AM";
      default:
        return "";
    }
  }, [timeValue, segment]);

  const [editValue, setEditValue] = React.useState(getSegmentValue());
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(getSegmentValue());
    }
  }, [getSegmentValue, isEditing]);

  const updateTimeValue = React.useCallback(
    (newSegmentValue: string) => {
      const currentTime = timeValue ?? {
        hour: use12Hours ? 12 : 0,
        minute: 0,
        second: 0,
        period: "AM" as const,
      };

      const newTime = { ...currentTime };

      switch (segment) {
        case "hour": {
          const hour = Number.parseInt(newSegmentValue, 10);
          if (!Number.isNaN(hour)) {
            const maxHour = use12Hours ? 12 : 23;
            const minHour = use12Hours ? 1 : 0;
            const clampedHour = clamp(hour, minHour, maxHour);
            newTime.hour = clampedHour;
          }
          break;
        }
        case "minute": {
          const minute = Number.parseInt(newSegmentValue, 10);
          if (!Number.isNaN(minute)) {
            newTime.minute = clamp(minute, 0, 59);
          }
          break;
        }
        case "second": {
          const second = Number.parseInt(newSegmentValue, 10);
          if (!Number.isNaN(second)) {
            newTime.second = clamp(second, 0, 59);
          }
          break;
        }
        case "period": {
          if (newSegmentValue === "AM" || newSegmentValue === "PM") {
            newTime.period = newSegmentValue;
          }
          break;
        }
      }

      const newValue = formatTimeValue(newTime, showSeconds, use12Hours);
      store.setState("value", newValue);
    },
    [timeValue, segment, use12Hours, showSeconds, store],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      setIsEditing(true);
      // Always select the entire content like native time picker
      queueMicrotask(() => event.target.select());
    },
    [onFocusProp],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;

      setIsEditing(false);
      if (editValue) {
        updateTimeValue(editValue);
      }
      setEditValue(getSegmentValue());
    },
    [onBlurProp, editValue, updateTimeValue, getSegmentValue],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Enter") {
        event.preventDefault();
        inputRef.current?.blur();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setEditValue(getSegmentValue());
        inputRef.current?.blur();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentValue = Number.parseInt(editValue, 10);
        if (!Number.isNaN(currentValue)) {
          let newValue: number;
          switch (segment) {
            case "hour":
              newValue = use12Hours
                ? currentValue === 12
                  ? 1
                  : currentValue + 1
                : currentValue === 23
                  ? 0
                  : currentValue + 1;
              break;
            case "minute":
            case "second":
              newValue = currentValue === 59 ? 0 : currentValue + 1;
              break;
            default:
              return;
          }
          const formattedValue = newValue.toString().padStart(2, "0");
          setEditValue(formattedValue);
          updateTimeValue(formattedValue);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentValue = Number.parseInt(editValue, 10);
        if (!Number.isNaN(currentValue)) {
          let newValue: number;
          switch (segment) {
            case "hour":
              newValue = use12Hours
                ? currentValue === 1
                  ? 12
                  : currentValue - 1
                : currentValue === 0
                  ? 23
                  : currentValue - 1;
              break;
            case "minute":
            case "second":
              newValue = currentValue === 0 ? 59 : currentValue - 1;
              break;
            default:
              return;
          }
          const formattedValue = newValue.toString().padStart(2, "0");
          setEditValue(formattedValue);
          updateTimeValue(formattedValue);
        }
      } else if (segment === "period") {
        const key = event.key.toLowerCase();
        if (key === "a" || key === "p") {
          event.preventDefault();
          const newPeriod = key === "a" ? "AM" : "PM";
          setEditValue(newPeriod);
          updateTimeValue(newPeriod);
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          const currentPeriod = editValue || "AM";
          const newPeriod = currentPeriod === "AM" ? "PM" : "AM";
          setEditValue(newPeriod);
          updateTimeValue(newPeriod);
        }
      }
    },
    [
      onKeyDownProp,
      editValue,
      segment,
      use12Hours,
      getSegmentValue,
      updateTimeValue,
    ],
  );

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // For period, just accept 'a', 'A', 'p', 'P' and convert immediately
      if (segment === "period") {
        const firstChar = newValue.charAt(0).toUpperCase();
        if (firstChar === "A") {
          setEditValue("AM");
          updateTimeValue("AM");
        } else if (firstChar === "P") {
          setEditValue("PM");
          updateTimeValue("PM");
        }
        return;
      }

      setEditValue(newValue);
    },
    [segment, updateTimeValue],
  );

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      // Select all on click, like native time picker
      event.currentTarget.select();
    },
    [],
  );

  const displayValue = isEditing ? editValue : getSegmentValue();

  return (
    <input
      ref={composedRef}
      type="text"
      value={displayValue}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={onClick}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(
        "inline-flex h-full min-w-[2.5ch] items-center justify-center rounded border-0 bg-transparent px-0.5 text-center text-sm tabular-nums focus:bg-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        segment === "period" && "min-w-[3ch]",
        className,
      )}
      {...inputProps}
    />
  );
}

export {
  TimePickerRoot as Root,
  TimePickerLabel as Label,
  TimePickerInputGroup as InputGroup,
  TimePickerTrigger as Trigger,
  TimePickerContent as Content,
  TimePickerHour as Hour,
  TimePickerMinute as Minute,
  TimePickerSecond as Second,
  TimePickerPeriod as Period,
  TimePickerSeparator as Separator,
  TimePickerClear as Clear,
  TimePickerInput as Input,
  //
  TimePickerRoot as TimePicker,
  TimePickerRoot,
  TimePickerLabel,
  TimePickerInputGroup,
  TimePickerTrigger,
  TimePickerContent,
  TimePickerHour,
  TimePickerMinute,
  TimePickerSecond,
  TimePickerPeriod,
  TimePickerSeparator,
  TimePickerClear,
  TimePickerInput,
  //
  type TimePickerRootProps as TimePickerProps,
};
