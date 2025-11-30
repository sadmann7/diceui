"use client";

import { Slot } from "@radix-ui/react-slot";
import { PlusIcon, XIcon } from "lucide-react";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

const ROOT_NAME = "KeyValue";
const LIST_NAME = "KeyValueList";
const ITEM_NAME = "KeyValueItem";
const KEY_INPUT_NAME = "KeyValueKeyInput";
const VALUE_INPUT_NAME = "KeyValueValueInput";
const REMOVE_NAME = "KeyValueRemove";
const ADD_NAME = "KeyValueAdd";
const ERROR_NAME = "KeyValueError";

type Orientation = "vertical" | "horizontal";
type Field = "key" | "value";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof KeyValueRoot>;
type KeyInputElement = React.ComponentRef<typeof KeyValueKeyInput>;
type ValueInputElement = React.ComponentRef<typeof KeyValueValueInput>;
type RemoveElement = React.ComponentRef<typeof KeyValueRemove>;
type AddElement = React.ComponentRef<typeof KeyValueAdd>;

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

function getErrorId(rootId: string, entryId: string, field: Field) {
  return `${rootId}-${entryId}-${field}-error`;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => KeyValueState;
  setState: <K extends keyof KeyValueState>(
    key: K,
    value: KeyValueState[K],
  ) => void;
  notify: () => void;
}

function useStore<T>(selector: (state: KeyValueState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface KeyValueEntry {
  id: string;
  key: string;
  value: string;
}

interface KeyValueState {
  value: KeyValueEntry[];
  focusedId: string | null;
  errors: Record<string, { key?: string; value?: string }>;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface KeyValueContextValue {
  rootId: string;
  maxEntries?: number;
  minEntries: number;
  keyPlaceholder: string;
  valuePlaceholder: string;
  allowDuplicateKeys: boolean;
  enablePaste: boolean;
  trim: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
}

const KeyValueContext = React.createContext<KeyValueContextValue | null>(null);

function useKeyValueContext(consumerName: string) {
  const context = React.useContext(KeyValueContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface KeyValueRootProps extends Omit<DivProps, "onPaste" | "defaultValue"> {
  id?: string;
  defaultValue?: KeyValueEntry[];
  value?: KeyValueEntry[];
  onValueChange?: (value: KeyValueEntry[]) => void;
  maxEntries?: number;
  minEntries?: number;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  name?: string;
  allowDuplicateKeys?: boolean;
  enablePaste?: boolean;
  trim?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onPaste?: (event: ClipboardEvent, entries: KeyValueEntry[]) => void;
  onAdd?: (entry: KeyValueEntry) => void;
  onRemove?: (entry: KeyValueEntry) => void;
  onKeyValidate?: (key: string, value: KeyValueEntry[]) => string | undefined;
  onValueValidate?: (
    value: string,
    key: string,
    entries: KeyValueEntry[],
  ) => string | undefined;
}

function KeyValueRoot(props: KeyValueRootProps) {
  const { value, defaultValue, onValueChange, ...rootProps } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<KeyValueState>(() => ({
    value: value ??
      defaultValue ?? [{ id: crypto.randomUUID(), key: "", value: "" }],
    focusedId: null,
    errors: {},
  }));
  const propsRef = useAsRef({ onValueChange });

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, val) => {
        if (Object.is(stateRef.current[key], val)) return;

        if (key === "value" && Array.isArray(val)) {
          stateRef.current.value = val as KeyValueEntry[];
          propsRef.current.onValueChange?.(val as KeyValueEntry[]);
        } else {
          stateRef.current[key] = val;
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
      <KeyValueRootImpl {...rootProps} value={value} />
    </StoreContext.Provider>
  );
}

interface KeyValueRootImplProps
  extends Omit<
    KeyValueRootProps,
    | "defaultValue"
    | "onValueChange"
    | "onPaste"
    | "onAdd"
    | "onRemove"
    | "onKeyValidate"
    | "onValueValidate"
  > {}

function KeyValueRootImpl(props: KeyValueRootImplProps) {
  const {
    id,
    value: valueProp,
    maxEntries,
    minEntries = 0,
    keyPlaceholder = "Key",
    valuePlaceholder = "Value",
    name,
    allowDuplicateKeys = true,
    enablePaste = true,
    trim = true,
    disabled = false,
    readOnly = false,
    required = false,
    asChild,
    className,
    ref,
    ...rootProps
  } = props;

  const store = useStoreContext("KeyValueRootImpl");

  const value = useStore((state) => state.value);
  const errors = useStore((state) => state.errors);
  const isInvalid = Object.keys(errors).length > 0;

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp, store]);

  const instanceId = React.useId();
  const rootId = id ?? instanceId;

  const [formTrigger, setFormTrigger] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const contextValue = React.useMemo<KeyValueContextValue>(
    () => ({
      rootId,
      maxEntries,
      minEntries,
      keyPlaceholder,
      valuePlaceholder,
      allowDuplicateKeys,
      enablePaste,
      trim,
      disabled,
      readOnly,
      required,
    }),
    [
      rootId,
      disabled,
      readOnly,
      required,
      maxEntries,
      minEntries,
      keyPlaceholder,
      valuePlaceholder,
      allowDuplicateKeys,
      enablePaste,
      trim,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <>
      <KeyValueContext.Provider value={contextValue}>
        <RootPrimitive
          id={id}
          data-slot="key-value"
          data-disabled={disabled ? "" : undefined}
          data-invalid={isInvalid ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          {...rootProps}
          ref={composedRef}
          className={cn("flex flex-col gap-2", className)}
        />
      </KeyValueContext.Provider>
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

interface KeyValueListProps extends DivProps {
  orientation?: Orientation;
}

function KeyValueList(props: KeyValueListProps) {
  const { orientation = "vertical", asChild, className, ...listProps } = props;

  const value = useStore((state) => state.value);

  const ListPrimitive = asChild ? Slot : "div";

  return (
    <ListPrimitive
      role="list"
      aria-orientation={orientation}
      data-slot="key-value-list"
      data-orientation={orientation}
      {...listProps}
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col gap-2" : "flex-row gap-2",
        className,
      )}
    >
      {value.map((entry) => {
        const children = React.Children.toArray(props.children);
        return (
          <KeyValueItemContext.Provider key={entry.id} value={entry}>
            {children}
          </KeyValueItemContext.Provider>
        );
      })}
    </ListPrimitive>
  );
}

const KeyValueItemContext = React.createContext<KeyValueEntry | null>(null);

function useKeyValueItemContext(consumerName: string) {
  const context = React.useContext(KeyValueItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${LIST_NAME}\``);
  }
  return context;
}

interface KeyValueItemProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function KeyValueItem(props: KeyValueItemProps) {
  const { asChild, className, ...itemProps } = props;
  const entry = useKeyValueItemContext(ITEM_NAME);

  const focusedId = useStore((state) => state.focusedId);

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <ItemPrimitive
      role="listitem"
      data-slot="key-value-item"
      data-highlighted={focusedId === entry.id ? "" : undefined}
      {...itemProps}
      className={cn("flex items-start gap-2", className)}
    />
  );
}

interface KeyValueKeyInputProps
  extends Omit<React.ComponentProps<"input">, "onPaste">,
    Pick<KeyValueRootProps, "onKeyValidate" | "onValueValidate" | "onPaste"> {
  asChild?: boolean;
}

function KeyValueKeyInput(props: KeyValueKeyInputProps) {
  const {
    onKeyValidate,
    onValueValidate,
    onChange,
    onPaste,
    asChild,
    disabled,
    readOnly,
    required,
    className,
    ...inputProps
  } = props;

  const context = useKeyValueContext(KEY_INPUT_NAME);
  const entry = useKeyValueItemContext(KEY_INPUT_NAME);
  const store = useStoreContext(KEY_INPUT_NAME);

  const errors = useStore((state) => state.errors);

  const isDisabled = disabled || context.disabled;
  const isReadOnly = readOnly || context.readOnly;
  const isRequired = required || context.required;
  const isInvalid = errors[entry.id]?.key !== undefined;

  const propsRef = useAsRef({
    onKeyValidate,
    onValueValidate,
    onChange,
    onPaste,
  });

  const onKeyInputChange = React.useCallback(
    (event: React.ChangeEvent<KeyInputElement>) => {
      const state = store.getState();
      const newValue = state.value.map((item) => {
        if (item.id !== entry.id) return item;
        const updated = { ...item, key: event.target.value };
        if (context.trim) updated.key = updated.key.trim();
        return updated;
      });

      store.setState("value", newValue);

      const updatedEntry = newValue.find((item) => item.id === entry.id);
      if (updatedEntry) {
        const errors: { key?: string; value?: string } = {};

        if (propsRef.current.onKeyValidate) {
          const keyError = propsRef.current.onKeyValidate(
            updatedEntry.key,
            newValue,
          );
          if (keyError) errors.key = keyError;
        }

        if (!context.allowDuplicateKeys) {
          const duplicateKey = newValue.find(
            (item) =>
              item.id !== updatedEntry.id &&
              item.key === updatedEntry.key &&
              updatedEntry.key !== "",
          );
          if (duplicateKey) {
            errors.key = "Duplicate key";
          }
        }

        if (propsRef.current.onValueValidate) {
          const valueError = propsRef.current.onValueValidate(
            updatedEntry.value,
            updatedEntry.key,
            newValue,
          );
          if (valueError) errors.value = valueError;
        }

        const newErrorsState = { ...state.errors };
        if (Object.keys(errors).length > 0) {
          newErrorsState[entry.id] = errors;
        } else {
          delete newErrorsState[entry.id];
        }
        store.setState("errors", newErrorsState);
      }

      propsRef.current.onChange?.(event);
    },
    [store, entry.id, context.trim, context.allowDuplicateKeys, propsRef],
  );

  const onKeyInputPaste = React.useCallback(
    (event: React.ClipboardEvent<KeyInputElement>) => {
      if (!context.enablePaste) return;

      const content = event.clipboardData.getData("text");
      const lines = content.split(/\r?\n/).filter((line) => line.trim());

      // Only handle paste if multiple lines
      if (lines.length > 1) {
        event.preventDefault();

        const parsed: KeyValueEntry[] = [];

        for (const line of lines) {
          let key = "";
          let value = "";

          // Try KEY=VALUE format
          if (line.includes("=")) {
            const parts = line.split("=");
            key = parts[0]?.trim() ?? "";
            value = parts.slice(1).join("=").trim();
          }
          // Try KEY: VALUE format
          else if (line.includes(":")) {
            const parts = line.split(":");
            key = parts[0]?.trim() ?? "";
            value = parts.slice(1).join(":").trim();
          }
          // Try KEY VALUE (tab or multiple spaces)
          else if (/\s{2,}|\t/.test(line)) {
            const parts = line.split(/\s{2,}|\t/);
            key = parts[0]?.trim() ?? "";
            value = parts.slice(1).join(" ").trim();
          }

          if (key) {
            parsed.push({ id: crypto.randomUUID(), key, value });
          }
        }

        if (parsed.length > 0) {
          const state = store.getState();
          const currentIndex = state.value.findIndex(
            (item) => item.id === entry.id,
          );

          // Replace current empty entry or add after current entry
          let newValue: KeyValueEntry[];
          if (entry.key === "" && entry.value === "") {
            newValue = [
              ...state.value.slice(0, currentIndex),
              ...parsed,
              ...state.value.slice(currentIndex + 1),
            ];
          } else {
            newValue = [
              ...state.value.slice(0, currentIndex + 1),
              ...parsed,
              ...state.value.slice(currentIndex + 1),
            ];
          }

          // Respect maxEntries
          if (context.maxEntries !== undefined) {
            newValue = newValue.slice(0, context.maxEntries);
          }

          store.setState("value", newValue);

          // Notify paste callback
          if (propsRef.current.onPaste) {
            propsRef.current.onPaste(
              event.nativeEvent as unknown as ClipboardEvent,
              parsed,
            );
          }
        }
      }
    },
    [
      context.enablePaste,
      context.maxEntries,
      store,
      entry.id,
      entry.key,
      entry.value,
      propsRef,
    ],
  );

  const KeyInputPrimitive = asChild ? Slot : "input";

  return (
    <KeyInputPrimitive
      type="text"
      aria-invalid={isInvalid}
      aria-describedby={
        isInvalid ? getErrorId(context.rootId, entry.id, "key") : undefined
      }
      data-slot="key-value-key-input"
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      {...inputProps}
      placeholder={context.keyPlaceholder}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        isInvalid && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      value={entry.key}
      onChange={onKeyInputChange}
      onPaste={onKeyInputPaste}
    />
  );
}

interface KeyValueValueInputProps
  extends React.ComponentProps<"input">,
    Pick<KeyValueRootProps, "onKeyValidate" | "onValueValidate"> {
  asChild?: boolean;
}

function KeyValueValueInput(props: KeyValueValueInputProps) {
  const {
    onKeyValidate,
    onValueValidate,
    onChange,
    asChild,
    disabled,
    readOnly,
    required,
    className,
    ...inputProps
  } = props;

  const context = useKeyValueContext(VALUE_INPUT_NAME);
  const entry = useKeyValueItemContext(VALUE_INPUT_NAME);
  const store = useStoreContext(VALUE_INPUT_NAME);

  const propsRef = useAsRef({
    onKeyValidate,
    onValueValidate,
    onChange,
  });
  const errors = useStore((state) => state.errors);

  const isDisabled = disabled || context.disabled;
  const isReadOnly = readOnly || context.readOnly;
  const isRequired = required || context.required;
  const isInvalid = errors[entry.id]?.value !== undefined;

  const onValueInputChange = React.useCallback(
    (event: React.ChangeEvent<ValueInputElement>) => {
      propsRef.current.onChange?.(event);

      const state = store.getState();
      const newValue = state.value.map((item: KeyValueEntry) => {
        if (item.id !== entry.id) return item;
        const updated = { ...item, value: event.target.value };
        if (context.trim) updated.value = updated.value.trim();
        return updated;
      });

      store.setState("value", newValue);

      const updatedEntry = newValue.find(
        (item: KeyValueEntry) => item.id === entry.id,
      );
      if (updatedEntry) {
        const errors: { key?: string; value?: string } = {};

        if (propsRef.current.onKeyValidate) {
          const keyError = propsRef.current.onKeyValidate(
            updatedEntry.key,
            newValue,
          );
          if (keyError) errors.key = keyError;
        }

        if (!context.allowDuplicateKeys) {
          const duplicateKey = newValue.find(
            (item: KeyValueEntry) =>
              item.id !== updatedEntry.id &&
              item.key === updatedEntry.key &&
              updatedEntry.key !== "",
          );
          if (duplicateKey) {
            errors.key = "Duplicate key";
          }
        }

        if (propsRef.current.onValueValidate) {
          const valueError = propsRef.current.onValueValidate(
            updatedEntry.value,
            updatedEntry.key,
            newValue,
          );
          if (valueError) errors.value = valueError;
        }

        const newErrorsState = { ...state.errors };
        if (Object.keys(errors).length > 0) {
          newErrorsState[entry.id] = errors;
        } else {
          delete newErrorsState[entry.id];
        }
        store.setState("errors", newErrorsState);
      }
    },
    [store, entry.id, context.trim, context.allowDuplicateKeys, propsRef],
  );

  const ValueInputPrimitive = asChild ? Slot : "input";

  return (
    <ValueInputPrimitive
      type="text"
      aria-invalid={isInvalid}
      aria-describedby={
        isInvalid ? getErrorId(context.rootId, entry.id, "value") : undefined
      }
      data-slot="key-value-value-input"
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      {...inputProps}
      placeholder={context.valuePlaceholder}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        isInvalid && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      value={entry.value}
      onChange={onValueInputChange}
    />
  );
}

interface KeyValueRemoveProps
  extends React.ComponentProps<"button">,
    Pick<KeyValueRootProps, "onRemove"> {
  asChild?: boolean;
}

function KeyValueRemove(props: KeyValueRemoveProps) {
  const { onClick, onRemove, asChild, className, children, ...buttonProps } =
    props;

  const context = useKeyValueContext(REMOVE_NAME);
  const entry = useKeyValueItemContext(REMOVE_NAME);
  const store = useStoreContext(REMOVE_NAME);

  const propsRef = useAsRef({ onClick, onRemove });
  const value = useStore((state) => state.value);
  const isDisabled = context.disabled || value.length <= context.minEntries;

  const onRemoveClick = React.useCallback(
    (event: React.MouseEvent<RemoveElement>) => {
      propsRef.current.onClick?.(event);

      const state = store.getState();
      if (state.value.length <= context.minEntries) return;

      const entryToRemove = state.value.find(
        (item: KeyValueEntry) => item.id === entry.id,
      );
      if (!entryToRemove) return;

      const newValue = state.value.filter(
        (item: KeyValueEntry) => item.id !== entry.id,
      );
      const newErrors = { ...state.errors };
      delete newErrors[entry.id];

      store.setState("value", newValue);
      store.setState("errors", newErrors);

      propsRef.current.onRemove?.(entryToRemove);
    },
    [store, context.minEntries, entry.id, propsRef],
  );

  const RemovePrimitive = asChild ? Slot : "button";

  return (
    <RemovePrimitive
      type="button"
      data-slot="key-value-remove"
      disabled={isDisabled}
      {...buttonProps}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      onClick={onRemoveClick}
    >
      {children ?? <XIcon />}
    </RemovePrimitive>
  );
}

interface KeyValueAddProps
  extends React.ComponentProps<"button">,
    Pick<KeyValueRootProps, "onAdd"> {
  asChild?: boolean;
}

function KeyValueAdd(props: KeyValueAddProps) {
  const { onClick, onAdd, asChild, className, children, ...buttonProps } =
    props;

  const context = useKeyValueContext(ADD_NAME);
  const store = useStoreContext(ADD_NAME);

  const propsRef = useAsRef({ onClick, onAdd });
  const value = useStore((state) => state.value);
  const isDisabled =
    context.disabled ||
    (context.maxEntries !== undefined && value.length >= context.maxEntries);

  const onAddClick = React.useCallback(
    (event: React.MouseEvent<AddElement>) => {
      propsRef.current.onClick?.(event);

      const state = store.getState();
      if (
        context.maxEntries !== undefined &&
        state.value.length >= context.maxEntries
      ) {
        return;
      }

      const newEntry: KeyValueEntry = {
        id: crypto.randomUUID(),
        key: "",
        value: "",
      };

      const newValue = [...state.value, newEntry];
      store.setState("value", newValue);
      store.setState("focusedId", newEntry.id);

      propsRef.current.onAdd?.(newEntry);
    },
    [store, context.maxEntries, propsRef],
  );

  const AddPrimitive = asChild ? Slot : "button";

  return (
    <AddPrimitive
      type="button"
      data-slot="key-value-add"
      disabled={isDisabled}
      {...buttonProps}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      onClick={onAddClick}
    >
      {children ?? (
        <>
          <PlusIcon />
          Add
        </>
      )}
    </AddPrimitive>
  );
}

interface KeyValueErrorProps extends React.ComponentProps<"span"> {
  field: Field;
  asChild?: boolean;
}

function KeyValueError(props: KeyValueErrorProps) {
  const { field, asChild, className, ...errorProps } = props;

  const context = useKeyValueContext(ERROR_NAME);
  const entry = useKeyValueItemContext(ERROR_NAME);

  const errors = useStore((state) => state.errors);
  const error = errors[entry.id]?.[field];

  if (!error) return null;

  const ErrorPrimitive = asChild ? Slot : "span";

  return (
    <ErrorPrimitive
      id={getErrorId(context.rootId, entry.id, field)}
      role="alert"
      {...errorProps}
      className={cn("font-medium text-destructive text-sm", className)}
    >
      {error}
    </ErrorPrimitive>
  );
}

export {
  KeyValueRoot as Root,
  KeyValueList as List,
  KeyValueItem as Item,
  KeyValueKeyInput as KeyInput,
  KeyValueValueInput as ValueInput,
  KeyValueRemove as Remove,
  KeyValueAdd as Add,
  KeyValueError as Error,
  //
  KeyValueRoot as KeyValue,
  KeyValueList,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueValueInput,
  KeyValueRemove,
  KeyValueAdd,
  KeyValueError,
  //
  type KeyValueEntry,
  type KeyValueRootProps as KeyValueProps,
};
