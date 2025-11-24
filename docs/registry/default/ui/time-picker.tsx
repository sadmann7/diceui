"use client";

import { Slot } from "@radix-ui/react-slot";
import { Clock } from "lucide-react";
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
const COLUMN_ITEM_NAME = "TimePickerColumnItem";
const HOUR_NAME = "TimePickerHour";
const MINUTE_NAME = "TimePickerMinute";
const SECOND_NAME = "TimePickerSecond";
const PERIOD_NAME = "TimePickerPeriod";
const CLEAR_NAME = "TimePickerClear";
const INPUT_NAME = "TimePickerInput";

type Segment = "hour" | "minute" | "second" | "period";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof TimePickerRoot>;
type ColumnItemElement = React.ComponentRef<typeof TimePickerColumnItem>;
type InputElement = React.ComponentRef<typeof TimePickerInput>;

const PERIODS = ["AM", "PM"] as const;
type Period = (typeof PERIODS)[number];

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

function getIs12Hour(locale?: string): boolean {
  const testDate = new Date(2000, 0, 1, 13, 0, 0);
  const formatted = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).format(testDate);

  return /am|pm/i.test(formatted) || !formatted.includes("13");
}

interface TimeValue {
  hour: number;
  minute: number;
  second: number;
}

function parseTimeString(timeString: string | undefined): TimeValue | null {
  if (!timeString) return null;

  const parts = timeString.split(":");
  if (parts.length < 2) return null;

  const hour = Number.parseInt(parts[0] ?? "0", 10);
  const minute = Number.parseInt(parts[1] ?? "0", 10);
  const second = parts[2] ? Number.parseInt(parts[2], 10) : 0;

  if (Number.isNaN(hour) || Number.isNaN(minute) || Number.isNaN(second)) {
    return null;
  }

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  return { hour, minute, second };
}

function formatTimeValue(value: TimeValue, showSeconds: boolean): string {
  const hourStr = value.hour.toString().padStart(2, "0");
  const minuteStr = value.minute.toString().padStart(2, "0");
  const secondStr = value.second.toString().padStart(2, "0");

  if (showSeconds) {
    return `${hourStr}:${minuteStr}:${secondStr}`;
  }
  return `${hourStr}:${minuteStr}`;
}

function to12Hour(hour24: number): { hour: number; period: Period } {
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;
  return { hour, period };
}

function to24Hour(hour12: number, period: Period): number {
  if (hour12 === 12) {
    return period === "PM" ? 12 : 0;
  }
  return period === "PM" ? hour12 + 12 : hour12;
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
  inputGroupId: string;
  labelId: string;
  triggerId: string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  showSeconds: boolean;
  is12Hour: boolean;
  minuteStep: number;
  secondStep: number;
  hourStep: number;
  placeholder: string;
  min?: string;
  max?: string;
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

interface TimePickerRootProps extends DivProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  min?: string;
  max?: string;
  showSeconds?: boolean;
  locale?: string;
  minuteStep?: number;
  secondStep?: number;
  hourStep?: number;
  placeholder?: string;
}

function TimePickerRoot(props: TimePickerRootProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    value: value ?? defaultValue ?? "",
    open: open ?? defaultOpen ?? false,
  }));
  const propsRef = useAsRef({ onValueChange, onOpenChange });

  const store: Store = React.useMemo(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

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
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  return (
    <StoreContext.Provider value={store}>
      <TimePickerRootImpl {...rootProps} value={value} open={open} />
    </StoreContext.Provider>
  );
}

interface TimePickerRootImplProps
  extends Omit<
    TimePickerRootProps,
    "defaultValue" | "defaultOpen" | "onValueChange" | "onOpenChange"
  > {}

function TimePickerRootImpl(props: TimePickerRootImplProps) {
  const {
    value,
    open: openProp,
    id: idProp,
    name,
    disabled = false,
    readOnly = false,
    required = false,
    invalid = false,
    min,
    max,
    showSeconds = false,
    locale,
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

  const store = useStoreContext("TimePickerRootImpl");

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.setState("value", value);
    }
  }, [value]);

  useIsomorphicLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp]);

  const instanceId = React.useId();
  const rootId = idProp ?? instanceId;
  const inputGroupId = React.useId();
  const labelId = React.useId();
  const triggerId = React.useId();

  const [formTrigger, setFormTrigger] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));

  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const open = useStore((state) => state.open);

  const onPopoverOpenChange = React.useCallback(
    (newOpen: boolean) => store.setState("open", newOpen),
    [store],
  );

  const is12Hour = React.useMemo(() => getIs12Hour(locale), [locale]);

  const rootContext = React.useMemo<TimePickerContextValue>(
    () => ({
      id: rootId,
      inputGroupId,
      labelId,
      triggerId,
      disabled,
      readOnly,
      required,
      invalid,
      showSeconds,
      is12Hour,
      minuteStep,
      secondStep,
      hourStep,
      placeholder,
      min,
      max,
    }),
    [
      rootId,
      inputGroupId,
      labelId,
      triggerId,
      disabled,
      readOnly,
      required,
      invalid,
      showSeconds,
      is12Hour,
      minuteStep,
      secondStep,
      hourStep,
      placeholder,
      min,
      max,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <>
      <TimePickerContext.Provider value={rootContext}>
        <Popover open={open} onOpenChange={onPopoverOpenChange}>
          <RootPrimitive
            data-slot="time-picker"
            data-disabled={disabled ? "" : undefined}
            data-invalid={invalid ? "" : undefined}
            ref={composedRef}
            {...rootProps}
            className={cn("relative", className)}
          >
            {children}
          </RootPrimitive>
        </Popover>
      </TimePickerContext.Provider>
      {isFormControl && (
        <VisuallyHiddenInput
          type="hidden"
          control={formTrigger}
          name={name}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      )}
    </>
  );
}

interface TimePickerLabelProps extends React.ComponentProps<"label"> {
  asChild?: boolean;
}

function TimePickerLabel(props: TimePickerLabelProps) {
  const { asChild, className, ...labelProps } = props;

  const { labelId } = useTimePickerContext(LABEL_NAME);

  const LabelPrimitive = asChild ? Slot : "label";

  return (
    <LabelPrimitive
      data-slot="time-picker-label"
      {...labelProps}
      htmlFor={labelId}
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
    />
  );
}

function TimePickerInputGroup(props: DivProps) {
  const { asChild, className, ...groupProps } = props;

  const { inputGroupId, labelId, disabled, invalid } =
    useTimePickerContext(INPUT_GROUP_NAME);

  const InputGroupPrimitive = asChild ? Slot : "div";

  return (
    <PopoverAnchor asChild>
      <InputGroupPrimitive
        role="group"
        id={inputGroupId}
        aria-labelledby={labelId}
        data-slot="time-picker-input-group"
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        {...groupProps}
        className={cn(
          "flex h-10 w-full items-center gap-0.5 rounded-md border border-input bg-background px-3 py-2 shadow-xs outline-none transition-shadow",
          "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50",
          invalid && "border-destructive ring-destructive/20",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      />
    </PopoverAnchor>
  );
}

function TimePickerTrigger(props: ButtonProps) {
  const {
    className,
    children,
    disabled: disabledProp,
    ...triggerProps
  } = props;

  const { triggerId, disabled } = useTimePickerContext(TRIGGER_NAME);

  const isDisabled = disabledProp || disabled;

  return (
    <PopoverTrigger
      type="button"
      id={triggerId}
      data-slot="time-picker-trigger"
      disabled={isDisabled}
      {...triggerProps}
      className={cn(
        "ml-auto flex items-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none [&>svg:not([class*='size-'])]:size-4",
        className,
      )}
    >
      {children ?? <Clock />}
    </PopoverTrigger>
  );
}

interface TimePickerGroupContextValue {
  getColumns: () => Array<{
    id: string;
    ref: React.RefObject<HTMLDivElement | null>;
    getSelectedItemRef: () => React.RefObject<HTMLButtonElement | null> | null;
  }>;
  onColumnRegister: (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
    getSelectedItemRef: () => React.RefObject<HTMLButtonElement | null> | null,
  ) => void;
  onColumnUnregister: (id: string) => void;
}

const TimePickerGroupContext =
  React.createContext<TimePickerGroupContextValue | null>(null);

interface TimePickerContentProps
  extends DivProps,
    React.ComponentProps<typeof PopoverContent> {}

function TimePickerContent(props: TimePickerContentProps) {
  const {
    side = "bottom",
    align = "start",
    sideOffset = 4,
    className,
    onOpenAutoFocus: onOpenAutoFocusProp,
    children,
    ...contentProps
  } = props;

  const columnsRef = React.useRef<
    Map<
      string,
      {
        ref: React.RefObject<HTMLDivElement | null>;
        getSelectedItemRef: () => React.RefObject<HTMLButtonElement | null> | null;
      }
    >
  >(new Map());

  const onColumnRegister = React.useCallback(
    (
      id: string,
      ref: React.RefObject<HTMLDivElement | null>,
      getSelectedItemRef: () => React.RefObject<HTMLButtonElement | null> | null,
    ) => {
      columnsRef.current.set(id, { ref, getSelectedItemRef });
    },
    [],
  );

  const onColumnUnregister = React.useCallback((id: string) => {
    columnsRef.current.delete(id);
  }, []);

  const getColumns = React.useCallback(() => {
    return Array.from(columnsRef.current.entries())
      .map(([id, { ref, getSelectedItemRef }]) => ({
        id,
        ref,
        getSelectedItemRef,
      }))
      .filter((col) => col.ref.current)
      .sort((a, b) => {
        const elementA = a.ref.current;
        const elementB = b.ref.current;
        if (!elementA || !elementB) return 0;
        const position = elementA.compareDocumentPosition(elementB);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
  }, []);

  const groupContextValue = React.useMemo<TimePickerGroupContextValue>(
    () => ({
      getColumns,
      onColumnRegister,
      onColumnUnregister,
    }),
    [getColumns, onColumnRegister, onColumnUnregister],
  );

  const onOpenAutoFocus: NonNullable<
    React.ComponentProps<typeof PopoverContent>["onOpenAutoFocus"]
  > = React.useCallback(
    (event) => {
      onOpenAutoFocusProp?.(event);
      if (event.defaultPrevented) return;

      event.preventDefault();
      const columns = getColumns();
      const firstColumn = columns[0];
      const selectedItemRef = firstColumn?.getSelectedItemRef();
      selectedItemRef?.current?.focus();
    },
    [onOpenAutoFocusProp, getColumns],
  );

  return (
    <TimePickerGroupContext.Provider value={groupContextValue}>
      <PopoverContent
        data-slot="time-picker-content"
        side={side}
        align={align}
        sideOffset={sideOffset}
        onOpenAutoFocus={onOpenAutoFocus}
        {...contentProps}
        className={cn(
          "flex w-auto max-w-(--radix-popover-trigger-width) p-0",
          className,
        )}
      >
        {children}
      </PopoverContent>
    </TimePickerGroupContext.Provider>
  );
}

interface TimePickerColumnContextValue {
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  getItems: () => Array<{
    value: number | string;
    ref: React.RefObject<ColumnItemElement | null>;
    selected: boolean;
  }>;
  onItemRegister: (
    value: number | string,
    ref: React.RefObject<ColumnItemElement | null>,
    selected: boolean,
  ) => void;
  onItemUnregister: (value: number | string) => void;
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

  const columnId = React.useId();
  const columnRef = React.useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, columnRef);

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const itemsRef = React.useRef<
    Map<
      number | string,
      {
        ref: React.RefObject<HTMLButtonElement | null>;
        selected: boolean;
      }
    >
  >(new Map());

  const groupContext = React.useContext(TimePickerGroupContext);

  const onItemRegister = React.useCallback(
    (
      value: number | string,
      ref: React.RefObject<HTMLButtonElement | null>,
      selected: boolean,
    ) => {
      itemsRef.current.set(value, { ref, selected });
    },
    [],
  );

  const onItemUnregister = React.useCallback((value: number | string) => {
    itemsRef.current.delete(value);
  }, []);

  const getItems = React.useCallback(() => {
    return Array.from(itemsRef.current.entries())
      .map(([value, { ref, selected }]) => ({
        value,
        ref,
        selected,
      }))
      .filter((item) => item.ref.current)
      .sort((a, b) => {
        const elementA = a.ref.current;
        const elementB = b.ref.current;
        if (!elementA || !elementB) return 0;
        const position = elementA.compareDocumentPosition(elementB);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
  }, []);

  const getSelectedItemRef = React.useCallback(() => {
    // Read directly from itemsRef to avoid stale closures
    const items = Array.from(itemsRef.current.entries())
      .map(([value, { ref, selected }]) => ({
        value,
        ref,
        selected,
      }))
      .filter((item) => item.ref.current);

    const selected = items.find((item) => item.selected);
    return selected?.ref ?? null;
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (groupContext) {
      groupContext.onColumnRegister(columnId, columnRef, getSelectedItemRef);
      return () => groupContext.onColumnUnregister(columnId);
    }
  }, [groupContext, columnId, getSelectedItemRef]);

  const columnContextValue = React.useMemo<TimePickerColumnContextValue>(
    () => ({
      activeIndex,
      setActiveIndex,
      getItems,
      onItemRegister,
      onItemUnregister,
    }),
    [activeIndex, getItems, onItemRegister, onItemUnregister],
  );

  return (
    <TimePickerColumnContext.Provider value={columnContextValue}>
      <div
        ref={composedRef}
        data-slot="time-picker-column"
        {...columnProps}
        className={cn("flex flex-col gap-1 not-last:border-r p-1", className)}
      >
        {children}
      </div>
    </TimePickerColumnContext.Provider>
  );
}

interface TimePickerColumnItemProps extends ButtonProps {
  value: number | string;
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

  const itemRef = React.useRef<ColumnItemElement | null>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const columnContext = useTimePickerColumnContext(COLUMN_ITEM_NAME);
  const groupContext = React.useContext(TimePickerGroupContext);

  useIsomorphicLayoutEffect(() => {
    columnContext.onItemRegister(value, itemRef, selected);
    return () => columnContext.onItemUnregister(value);
  }, [value, selected, columnContext]);

  useIsomorphicLayoutEffect(() => {
    if (selected && itemRef.current) {
      itemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [selected]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<ColumnItemElement>) => {
      itemProps.onClick?.(event);
      if (event.defaultPrevented) return;

      itemRef.current?.focus();
    },
    [itemProps.onClick],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<ColumnItemElement>) => {
      itemProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const items = columnContext.getItems().sort((a, b) => {
          if (typeof a.value === "number" && typeof b.value === "number") {
            return a.value - b.value;
          }
          return 0; // Keep order for strings
        });
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
      } else if (
        (event.key === "Tab" ||
          event.key === "ArrowLeft" ||
          event.key === "ArrowRight") &&
        groupContext
      ) {
        event.preventDefault();
        const columns = groupContext.getColumns();
        const currentColumnIndex = columns.findIndex(
          (col) => col.ref.current?.contains(itemRef.current) ?? false,
        );

        if (currentColumnIndex === -1) return;

        // Determine direction: left/shift+tab = previous, right/tab = next
        const goToPrevious =
          event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey);

        const nextColumnIndex = goToPrevious
          ? currentColumnIndex > 0
            ? currentColumnIndex - 1
            : columns.length - 1
          : currentColumnIndex < columns.length - 1
            ? currentColumnIndex + 1
            : 0;

        const nextColumn = columns[nextColumnIndex];
        const nextSelectedItemRef = nextColumn?.getSelectedItemRef();
        nextSelectedItemRef?.current?.focus();
      }
    },
    [itemProps.onKeyDown, columnContext, groupContext, value],
  );

  const formattedValue =
    typeof value === "number" && format === "2-digit"
      ? value.toString().padStart(2, "0")
      : value.toString();

  return (
    <button
      type="button"
      {...itemProps}
      ref={composedRef}
      data-selected={selected ? "" : undefined}
      className={cn(
        "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {formattedValue}
    </button>
  );
}

interface TimePickerHourProps extends DivProps {
  format?: "numeric" | "2-digit";
}

function TimePickerHour(props: TimePickerHourProps) {
  const { asChild, format = "numeric", className, ...hourProps } = props;

  const { is12Hour, hourStep, showSeconds } = useTimePickerContext(HOUR_NAME);
  const store = useStoreContext(HOUR_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  // Generate hours based on locale format
  const hours = Array.from(
    {
      length: is12Hour ? Math.ceil(12 / hourStep) : Math.ceil(24 / hourStep),
    },
    (_, i) => {
      if (is12Hour) {
        // Generate hours 1-12 for 12-hour display
        const hour = (i * hourStep) % 12;
        return hour === 0 ? 12 : hour;
      }
      // Generate hours 0-23 for 24-hour display
      return i * hourStep;
    },
  );

  const onHourSelect = React.useCallback(
    (displayHour: number) => {
      const currentTime = timeValue ?? {
        hour: 0,
        minute: 0,
        second: 0,
      };

      // Convert display hour to 24-hour format if needed
      let hour24 = displayHour;
      if (is12Hour && timeValue) {
        const currentPeriod = to12Hour(timeValue.hour).period;
        hour24 = to24Hour(displayHour, currentPeriod);
      }

      const newTime = { ...currentTime, hour: hour24 };
      const newValue = formatTimeValue(newTime, showSeconds);
      store.setState("value", newValue);
    },
    [timeValue, showSeconds, is12Hour, store],
  );

  // Get display hour for selection
  const displayHour =
    timeValue && is12Hour ? to12Hour(timeValue.hour).hour : timeValue?.hour;

  const HourPrimitive = asChild ? Slot : TimePickerColumn;

  return (
    <HourPrimitive
      data-slot="time-picker-hour"
      {...hourProps}
      className={cn(
        "scrollbar-none flex max-h-[200px] flex-col gap-1 overflow-y-auto p-1",
        className,
      )}
    >
      {hours.map((hour) => (
        <TimePickerColumnItem
          key={hour}
          value={hour}
          selected={displayHour === hour}
          format={format}
          onClick={() => onHourSelect(hour)}
        />
      ))}
    </HourPrimitive>
  );
}

interface TimePickerMinuteProps extends DivProps {
  format?: "numeric" | "2-digit";
}

function TimePickerMinute(props: TimePickerMinuteProps) {
  const { asChild, format = "2-digit", className, ...minuteProps } = props;

  const { minuteStep, showSeconds } = useTimePickerContext(MINUTE_NAME);
  const store = useStoreContext(MINUTE_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

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
      };
      const newTime = { ...currentTime, minute };
      const newValue = formatTimeValue(newTime, showSeconds);
      store.setState("value", newValue);
    },
    [timeValue, showSeconds, store],
  );

  const MinutePrimitive = asChild ? Slot : TimePickerColumn;

  return (
    <MinutePrimitive
      data-slot="time-picker-minute"
      {...minuteProps}
      className={cn(
        "scrollbar-none flex max-h-[200px] flex-col gap-1 overflow-y-auto p-1",
        className,
      )}
    >
      {minutes.map((minute) => (
        <TimePickerColumnItem
          key={minute}
          value={minute}
          selected={timeValue?.minute === minute}
          format={format}
          onClick={() => onMinuteSelect(minute)}
        />
      ))}
    </MinutePrimitive>
  );
}

interface TimePickerSecondProps extends DivProps {
  format?: "numeric" | "2-digit";
}

function TimePickerSecond(props: TimePickerSecondProps) {
  const { asChild, format = "2-digit", className, ...secondProps } = props;

  const { secondStep } = useTimePickerContext(SECOND_NAME);
  const store = useStoreContext(SECOND_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

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
      };
      const newTime = { ...currentTime, second };
      const newValue = formatTimeValue(newTime, true);
      store.setState("value", newValue);
    },
    [timeValue, store],
  );

  const SecondPrimitive = asChild ? Slot : TimePickerColumn;

  return (
    <SecondPrimitive
      data-slot="time-picker-second"
      {...secondProps}
      className={cn(
        "scrollbar-none flex max-h-[200px] flex-col gap-1 overflow-y-auto p-1",
        className,
      )}
    >
      {seconds.map((second) => (
        <TimePickerColumnItem
          key={second}
          value={second}
          selected={timeValue?.second === second}
          format={format}
          onClick={() => onSecondSelect(second)}
        />
      ))}
    </SecondPrimitive>
  );
}

function TimePickerPeriod(props: DivProps) {
  const { asChild, className, ...periodProps } = props;

  const { is12Hour, showSeconds } = useTimePickerContext(PERIOD_NAME);
  const store = useStoreContext(PERIOD_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  const onPeriodToggle = React.useCallback(
    (period: Period) => {
      if (!timeValue) return;

      const currentDisplay = to12Hour(timeValue.hour);
      const new24Hour = to24Hour(currentDisplay.hour, period);

      const newTime = { ...timeValue, hour: new24Hour };
      const newValue = formatTimeValue(newTime, showSeconds);
      store.setState("value", newValue);
    },
    [timeValue, showSeconds, store],
  );

  // Only show period column for 12-hour format
  if (!is12Hour) return null;

  const currentPeriod = timeValue ? to12Hour(timeValue.hour).period : "AM";

  const PeriodPrimitive = asChild ? Slot : TimePickerColumn;

  return (
    <PeriodPrimitive
      data-slot="time-picker-period"
      {...periodProps}
      className={cn("flex flex-col gap-1 p-1", className)}
    >
      {PERIODS.map((period) => (
        <TimePickerColumnItem
          key={period}
          value={period}
          selected={currentPeriod === period}
          onClick={() => onPeriodToggle(period)}
        />
      ))}
    </PeriodPrimitive>
  );
}

interface TimePickerSeparatorProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function TimePickerSeparator(props: TimePickerSeparatorProps) {
  const { asChild, children, ...separatorProps } = props;

  const SeparatorPrimitive = asChild ? Slot : "span";

  return (
    <SeparatorPrimitive
      aria-hidden="true"
      data-slot="time-picker-separator"
      {...separatorProps}
    >
      {children ?? ":"}
    </SeparatorPrimitive>
  );
}

interface TimePickerClearProps extends ButtonProps {}

function TimePickerClear(props: TimePickerClearProps) {
  const {
    asChild,
    className,
    children,
    disabled: disabledProp,
    ...clearProps
  } = props;

  const { disabled, readOnly } = useTimePickerContext(CLEAR_NAME);
  const store = useStoreContext(CLEAR_NAME);

  const isDisabled = disabledProp || disabled;

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
      type="button"
      data-slot="time-picker-clear"
      disabled={isDisabled}
      {...clearProps}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={onClick}
    >
      {children ?? "Clear"}
    </ClearPrimitive>
  );
}

interface TimePickerInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "value"> {
  segment?: Segment;
}

function TimePickerInput(props: TimePickerInputProps) {
  const {
    segment,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    className,
    ref,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    ...inputProps
  } = props;

  const { is12Hour, showSeconds, disabled, readOnly } =
    useTimePickerContext(INPUT_NAME);
  const store = useStoreContext(INPUT_NAME);

  const isDisabled = disabledProp || disabled;
  const isReadOnly = readOnlyProp || readOnly;

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);

  const getSegmentValue = React.useCallback(() => {
    if (!timeValue) {
      switch (segment) {
        case "hour":
        case "minute":
        case "second":
          return "--";
        case "period":
          return "AM";
        default:
          return "";
      }
    }
    switch (segment) {
      case "hour": {
        if (is12Hour) {
          return to12Hour(timeValue.hour).hour.toString().padStart(2, "0");
        }
        return timeValue.hour.toString().padStart(2, "0");
      }
      case "minute":
        return timeValue.minute.toString().padStart(2, "0");
      case "second":
        return timeValue.second.toString().padStart(2, "0");
      case "period":
        return timeValue ? to12Hour(timeValue.hour).period : "AM";
      default:
        return "";
    }
  }, [timeValue, segment, is12Hour]);

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
        hour: 0,
        minute: 0,
        second: 0,
      };

      const newTime = { ...currentTime };

      switch (segment) {
        case "hour": {
          const displayHour = Number.parseInt(newSegmentValue, 10);
          if (!Number.isNaN(displayHour)) {
            if (is12Hour) {
              // Convert 12-hour input to 24-hour
              const maxHour = 12;
              const minHour = 1;
              const clampedHour = clamp(displayHour, minHour, maxHour);
              const currentPeriod = timeValue
                ? to12Hour(timeValue.hour).period
                : "AM";
              newTime.hour = to24Hour(clampedHour, currentPeriod);
            } else {
              // Use 24-hour directly
              newTime.hour = clamp(displayHour, 0, 23);
            }
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
          if (
            (newSegmentValue === "AM" || newSegmentValue === "PM") &&
            timeValue
          ) {
            const currentDisplay = to12Hour(timeValue.hour);
            newTime.hour = to24Hour(currentDisplay.hour, newSegmentValue);
          }
          break;
        }
      }

      const newValue = formatTimeValue(newTime, showSeconds);
      store.setState("value", newValue);
    },
    [timeValue, segment, is12Hour, showSeconds, store],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<InputElement>) => {
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

  const onChange = React.useCallback(
    (event: React.ChangeEvent<InputElement>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;

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
    [segment, updateTimeValue, onChangeProp],
  );

  const onClick = React.useCallback(
    (event: React.MouseEvent<InputElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      // Select all on click, like native time picker
      event.currentTarget.select();
    },
    [onClickProp],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<InputElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      setIsEditing(true);
      // Always select the entire content like native time picker
      queueMicrotask(() => event.target.select());
    },
    [onFocusProp],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<InputElement>) => {
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
              if (is12Hour) {
                newValue = currentValue === 12 ? 1 : currentValue + 1;
              } else {
                newValue = currentValue === 23 ? 0 : currentValue + 1;
              }
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
              if (is12Hour) {
                newValue = currentValue === 1 ? 12 : currentValue - 1;
              } else {
                newValue = currentValue === 0 ? 23 : currentValue - 1;
              }
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
      is12Hour,
      getSegmentValue,
      updateTimeValue,
    ],
  );

  const displayValue = isEditing ? editValue : getSegmentValue();
  const isEmpty = !timeValue;

  return (
    <input
      type="text"
      {...inputProps}
      disabled={isDisabled}
      readOnly={isReadOnly}
      className={cn(
        "inline-flex h-full w-[2ch] items-center justify-center border-0 bg-transparent text-center text-sm tabular-nums outline-none transition-colors focus:bg-transparent disabled:cursor-not-allowed disabled:opacity-50",
        segment === "period" && "w-[2.5ch]",
        isEmpty && "text-muted-foreground",
        className,
      )}
      ref={composedRef}
      value={displayValue}
      onBlur={onBlur}
      onChange={onChange}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
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
