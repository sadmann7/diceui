"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

const ROOT_NAME = "TimePicker";
const LABEL_NAME = "TimePickerLabel";
const TRIGGER_NAME = "TimePickerTrigger";
const CONTENT_NAME = "TimePickerContent";
const HOUR_NAME = "TimePickerHour";
const MINUTE_NAME = "TimePickerMinute";
const SECOND_NAME = "TimePickerSecond";
const PERIOD_NAME = "TimePickerPeriod";
const SEPARATOR_NAME = "TimePickerSeparator";
const CLEAR_NAME = "TimePickerClear";

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
  onValueChange?: (value: string) => void,
  onOpenChange?: (open: boolean) => void,
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
        value: "",
        open: false,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;

      if (key === "value" && typeof value === "string") {
        state.value = value;
        onValueChange?.(value);
      } else if (key === "open" && typeof value === "boolean") {
        state.open = value;
        onOpenChange?.(value);
      } else {
        state[key] = value;
      }

      store.notify();
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

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`${consumerName} must be rendered inside TimePicker`);
  }
  return context;
}

function useStoreSelector<T>(
  store: Store,
  selector: (state: StoreState) => T,
): T {
  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface RootContextValue {
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

const RootContext = React.createContext<RootContextValue | null>(null);

function useRootContext(consumerName: string) {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(`${consumerName} must be rendered inside TimePicker`);
  }
  return context;
}

export interface RootProps extends React.ComponentPropsWithoutRef<"div"> {
  id?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
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
  asChild?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  function Root(props, forwardedRef) {
    const {
      id: idProp,
      defaultValue = "",
      value: valueProp,
      onValueChange,
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
      ...rootProps
    } = props;

    const id = React.useId();
    const generatedId = idProp ?? id;

    const listenersRef = useLazyRef(() => new Set<() => void>());
    const stateRef = useLazyRef(() => ({
      value: valueProp ?? defaultValue,
      open: false,
    }));

    const isControlled = valueProp !== undefined;

    React.useEffect(() => {
      if (isControlled && stateRef.current) {
        stateRef.current.value = valueProp;
      }
    }, [isControlled, valueProp, stateRef]);

    const store = React.useMemo(
      () => createStore(listenersRef, stateRef, onValueChange),
      [listenersRef, stateRef, onValueChange],
    );

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const rootContext: RootContextValue = React.useMemo(
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

    const Comp = asChild ? Slot : "div";

    return (
      <StoreContext.Provider value={store}>
        <RootContext.Provider value={rootContext}>
          <Comp
            ref={forwardedRef}
            className={cn("relative", className)}
            {...rootProps}
          />
        </RootContext.Provider>
      </StoreContext.Provider>
    );
  },
);

Root.displayName = ROOT_NAME;

export interface LabelProps extends React.ComponentPropsWithoutRef<"label"> {
  asChild?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  function Label(props, forwardedRef) {
    const { asChild, className, ...labelProps } = props;
    const { id } = useRootContext(LABEL_NAME);

    const Comp = asChild ? Slot : "label";

    return (
      <Comp
        ref={forwardedRef}
        htmlFor={`${id}-trigger`}
        className={cn(
          "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
        {...labelProps}
      />
    );
  },
);

Label.displayName = LABEL_NAME;

export interface TriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger(props, forwardedRef) {
    const { asChild, className, children, ...triggerProps } = props;
    const {
      id,
      disabled,
      readOnly,
      invalid,
      placeholder,
      triggerRef,
      name,
      required,
    } = useRootContext(TRIGGER_NAME);
    const store = useStoreContext(TRIGGER_NAME);

    const value = useStoreSelector(store, (state) => state.value);
    const open = useStoreSelector(store, (state) => state.open);

    const ref = useComposedRefs(forwardedRef, triggerRef);

    const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || readOnly) return;
      event.preventDefault();
      store.setState("open", !open);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled || readOnly) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        store.setState("open", !open);
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        store.setState("open", false);
      }
    };

    const Comp = asChild ? Slot : "button";

    return (
      <>
        <Comp
          ref={ref}
          id={`${id}-trigger`}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-invalid={invalid}
          disabled={disabled}
          data-state={open ? "open" : "closed"}
          data-disabled={disabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          data-invalid={invalid ? "" : undefined}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...triggerProps}
        >
          {children ?? (
            <span className={cn(!value && "text-muted-foreground")}>
              {value || placeholder}
            </span>
          )}
        </Comp>
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
  },
);

Trigger.displayName = TRIGGER_NAME;

export interface ContentProps extends React.ComponentPropsWithoutRef<"div"> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  asChild?: boolean;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  function Content(props, forwardedRef) {
    const {
      asChild,
      side = "bottom",
      align = "start",
      className,
      ...contentProps
    } = props;
    const { contentRef, triggerRef, disabled } = useRootContext(CONTENT_NAME);
    const store = useStoreContext(CONTENT_NAME);

    const open = useStoreSelector(store, (state) => state.open);

    const ref = useComposedRefs(forwardedRef, contentRef);

    React.useEffect(() => {
      if (!open) return;

      function onPointerDown(event: PointerEvent) {
        const target = event.target as Node;
        if (
          contentRef.current?.contains(target) ||
          triggerRef.current?.contains(target)
        ) {
          return;
        }
        store.setState("open", false);
      }

      function onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          store.setState("open", false);
        }
      }

      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);

      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [open, store, contentRef, triggerRef]);

    if (!open || disabled) return null;

    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-state={open ? "open" : "closed"}
        data-side={side}
        data-align={align}
        className={cn(
          "absolute z-50 mt-1 min-w-[200px] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className,
        )}
        {...contentProps}
      />
    );
  },
);

Content.displayName = CONTENT_NAME;

export interface HourProps extends React.ComponentPropsWithoutRef<"div"> {
  format?: "numeric" | "2-digit";
  asChild?: boolean;
}

const Hour = React.forwardRef<HTMLDivElement, HourProps>(
  function Hour(props, forwardedRef) {
    const { asChild, format = "numeric", className, ...hourProps } = props;
    const { use12Hours, hourStep } = useRootContext(HOUR_NAME);
    const store = useStoreContext(HOUR_NAME);

    const value = useStoreSelector(store, (state) => state.value);
    const timeValue = parseTimeString(value, use12Hours);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, containerRef);

    const maxHour = use12Hours ? 12 : 23;
    const hours = Array.from(
      { length: Math.ceil((maxHour + 1) / hourStep) },
      (_, i) => {
        const hour = i * hourStep;
        return use12Hours ? (hour === 0 ? 12 : hour) : hour;
      },
    );

    const onHourSelect = (hour: number) => {
      const currentTime = timeValue ?? {
        hour: 0,
        minute: 0,
        second: 0,
        period: "AM",
      };
      const newTime = { ...currentTime, hour };
      const newValue = formatTimeValue(newTime, false, use12Hours);
      store.setState("value", newValue);
    };

    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...hourProps}
      >
        <div className="mb-1 font-medium text-muted-foreground text-xs">
          Hour
        </div>
        <div className="max-h-[200px] space-y-1 overflow-y-auto">
          {hours.map((hour) => {
            const isSelected = timeValue?.hour === hour;
            return (
              <button
                key={hour}
                type="button"
                onClick={() => onHourSelect(hour)}
                className={cn(
                  "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {format === "2-digit" ? hour.toString().padStart(2, "0") : hour}
              </button>
            );
          })}
        </div>
      </Comp>
    );
  },
);

Hour.displayName = HOUR_NAME;

export interface MinuteProps extends React.ComponentPropsWithoutRef<"div"> {
  format?: "numeric" | "2-digit";
  asChild?: boolean;
}

const Minute = React.forwardRef<HTMLDivElement, MinuteProps>(
  function Minute(props, forwardedRef) {
    const { asChild, format = "2-digit", className, ...minuteProps } = props;
    const { use12Hours, minuteStep, showSeconds } = useRootContext(MINUTE_NAME);
    const store = useStoreContext(MINUTE_NAME);

    const value = useStoreSelector(store, (state) => state.value);
    const timeValue = parseTimeString(value, use12Hours);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, containerRef);

    const minutes = Array.from(
      { length: Math.ceil(60 / minuteStep) },
      (_, i) => i * minuteStep,
    );

    const onMinuteSelect = (minute: number) => {
      const currentTime = timeValue ?? {
        hour: 0,
        minute: 0,
        second: 0,
        period: "AM",
      };
      const newTime = { ...currentTime, minute };
      const newValue = formatTimeValue(newTime, showSeconds, use12Hours);
      store.setState("value", newValue);
    };

    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...minuteProps}
      >
        <div className="mb-1 font-medium text-muted-foreground text-xs">
          Minute
        </div>
        <div className="max-h-[200px] space-y-1 overflow-y-auto">
          {minutes.map((minute) => {
            const isSelected = timeValue?.minute === minute;
            return (
              <button
                key={minute}
                type="button"
                onClick={() => onMinuteSelect(minute)}
                className={cn(
                  "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {format === "2-digit"
                  ? minute.toString().padStart(2, "0")
                  : minute}
              </button>
            );
          })}
        </div>
      </Comp>
    );
  },
);

Minute.displayName = MINUTE_NAME;

export interface SecondProps extends React.ComponentPropsWithoutRef<"div"> {
  format?: "numeric" | "2-digit";
  asChild?: boolean;
}

const Second = React.forwardRef<HTMLDivElement, SecondProps>(
  function Second(props, forwardedRef) {
    const { asChild, format = "2-digit", className, ...secondProps } = props;
    const { use12Hours, secondStep } = useRootContext(SECOND_NAME);
    const store = useStoreContext(SECOND_NAME);

    const value = useStoreSelector(store, (state) => state.value);
    const timeValue = parseTimeString(value, use12Hours);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, containerRef);

    const seconds = Array.from(
      { length: Math.ceil(60 / secondStep) },
      (_, i) => i * secondStep,
    );

    const onSecondSelect = (second: number) => {
      const currentTime = timeValue ?? {
        hour: 0,
        minute: 0,
        second: 0,
        period: "AM",
      };
      const newTime = { ...currentTime, second };
      const newValue = formatTimeValue(newTime, true, use12Hours);
      store.setState("value", newValue);
    };

    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...secondProps}
      >
        <div className="mb-1 font-medium text-muted-foreground text-xs">
          Second
        </div>
        <div className="max-h-[200px] space-y-1 overflow-y-auto">
          {seconds.map((second) => {
            const isSelected = timeValue?.second === second;
            return (
              <button
                key={second}
                type="button"
                onClick={() => onSecondSelect(second)}
                className={cn(
                  "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {format === "2-digit"
                  ? second.toString().padStart(2, "0")
                  : second}
              </button>
            );
          })}
        </div>
      </Comp>
    );
  },
);

Second.displayName = SECOND_NAME;

export interface PeriodProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const Period = React.forwardRef<HTMLDivElement, PeriodProps>(
  function Period(props, forwardedRef) {
    const { asChild, className, ...periodProps } = props;
    const { use12Hours } = useRootContext(PERIOD_NAME);
    const store = useStoreContext(PERIOD_NAME);

    const value = useStoreSelector(store, (state) => state.value);
    const timeValue = parseTimeString(value, use12Hours);

    if (!use12Hours) return null;

    const onPeriodToggle = (period: "AM" | "PM") => {
      const currentTime = timeValue ?? {
        hour: 12,
        minute: 0,
        second: 0,
        period: "AM",
      };
      const newTime = { ...currentTime, period };
      const newValue = formatTimeValue(newTime, false, use12Hours);
      store.setState("value", newValue);
    };

    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={forwardedRef}
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
                  "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {period}
              </button>
            );
          })}
        </div>
      </Comp>
    );
  },
);

Period.displayName = PERIOD_NAME;

export interface SeparatorProps extends React.ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
}

const Separator = React.forwardRef<HTMLSpanElement, SeparatorProps>(
  function Separator(props, forwardedRef) {
    const { asChild, className, children, ...separatorProps } = props;

    const Comp = asChild ? Slot : "span";

    return (
      <Comp
        ref={forwardedRef}
        aria-hidden="true"
        className={cn("text-muted-foreground", className)}
        {...separatorProps}
      >
        {children ?? ":"}
      </Comp>
    );
  },
);

Separator.displayName = SEPARATOR_NAME;

export interface ClearProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const Clear = React.forwardRef<HTMLButtonElement, ClearProps>(
  function Clear(props, forwardedRef) {
    const { asChild, className, children, ...clearProps } = props;
    const { disabled, readOnly } = useRootContext(CLEAR_NAME);
    const store = useStoreContext(CLEAR_NAME);

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (disabled || readOnly) return;
      store.setState("value", "");
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={forwardedRef}
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
      </Comp>
    );
  },
);

Clear.displayName = CLEAR_NAME;

export {
  Root,
  Label,
  Trigger,
  Content,
  Hour,
  Minute,
  Second,
  Period,
  Separator,
  Clear,
};
