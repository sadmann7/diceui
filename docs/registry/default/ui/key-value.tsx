"use client";

import { Slot } from "@radix-ui/react-slot";
import { PlusIcon, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const ROOT_NAME = "KeyValue";
const LIST_NAME = "KeyValueList";
const ITEM_NAME = "KeyValueItem";
const KEY_INPUT_NAME = "KeyValueKeyInput";
const VALUE_INPUT_NAME = "KeyValueValueInput";
const REMOVE_BUTTON_NAME = "KeyValueRemoveButton";
const ADD_BUTTON_NAME = "KeyValueAddButton";
const ERROR_NAME = "KeyValueError";

type KeyInputElement = React.ComponentRef<"input">;
type ValueInputElement = React.ComponentRef<"input">;
type RemoveButtonElement = React.ComponentRef<"button">;
type AddButtonElement = React.ComponentRef<"button">;

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

interface Store<T> {
  subscribe: (callback: () => void) => () => void;
  getState: () => T;
  setState: <K extends keyof T>(key: K, value: T[K]) => void;
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
  entries: KeyValueEntry[];
  focusedId: string | null;
  errors: Record<string, { key?: string; value?: string }>;
}

const StoreContext = React.createContext<Store<KeyValueState> | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface KeyValueContextValue {
  id: string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  name?: string;
  maxEntries?: number;
  minEntries: number;
  keyPlaceholder: string;
  valuePlaceholder: string;
  addButtonText: string;
  showAddButton: boolean;
  showRemoveButton: boolean;
  allowDuplicateKeys: boolean;
  enablePaste: boolean;
  trim: boolean;
}

const KeyValueContext = React.createContext<KeyValueContextValue | null>(null);

function useKeyValueContext(consumerName: string) {
  const context = React.useContext(KeyValueContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface KeyValueRootProps
  extends Omit<React.ComponentProps<"div">, "onPaste"> {
  id?: string;
  defaultEntries?: KeyValueEntry[];
  entries?: KeyValueEntry[];
  onEntriesChange?: (entries: KeyValueEntry[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  maxEntries?: number;
  minEntries?: number;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonText?: string;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  allowDuplicateKeys?: boolean;
  enablePaste?: boolean;
  onPaste?: (event: ClipboardEvent, entries: KeyValueEntry[]) => void;
  onAdd?: (entry: KeyValueEntry) => void;
  onRemove?: (entry: KeyValueEntry) => void;
  validateKey?: (key: string, entries: KeyValueEntry[]) => string | undefined;
  validateValue?: (
    value: string,
    key: string,
    entries: KeyValueEntry[],
  ) => string | undefined;
  trim?: boolean;
  asChild?: boolean;
}

function KeyValueRoot(props: KeyValueRootProps) {
  const {
    id: idProp,
    defaultEntries,
    entries: entriesProp,
    onEntriesChange,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    maxEntries,
    minEntries = 0,
    keyPlaceholder = "Key",
    valuePlaceholder = "Value",
    addButtonText = "Add",
    showAddButton = true,
    showRemoveButton = true,
    allowDuplicateKeys = true,
    enablePaste = true,
    onPaste,
    onAdd,
    onRemove,
    validateKey,
    validateValue,
    trim = true,
    asChild,
    className,
    ...rootProps
  } = props;

  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<KeyValueState>(() => ({
    entries: entriesProp ??
      defaultEntries ?? [{ id: crypto.randomUUID(), key: "", value: "" }],
    focusedId: null,
    errors: {},
  }));

  const propsRef = useAsRef({
    onEntriesChange,
    onPaste,
    onAdd,
    onRemove,
    validateKey,
    validateValue,
    allowDuplicateKeys,
    trim,
    maxEntries,
    minEntries,
  });

  const store = React.useMemo<Store<KeyValueState>>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        stateRef.current[key] = value;

        if (key === "entries") {
          propsRef.current.onEntriesChange?.(value as KeyValueEntry[]);
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

  useIsomorphicLayoutEffect(() => {
    if (entriesProp !== undefined) {
      store.setState("entries", entriesProp);
    }
  }, [entriesProp]);

  const contextValue = React.useMemo<KeyValueContextValue>(
    () => ({
      id,
      disabled,
      readOnly,
      required,
      name,
      maxEntries,
      minEntries,
      keyPlaceholder,
      valuePlaceholder,
      addButtonText,
      showAddButton,
      showRemoveButton,
      allowDuplicateKeys,
      enablePaste,
      trim,
    }),
    [
      id,
      disabled,
      readOnly,
      required,
      name,
      maxEntries,
      minEntries,
      keyPlaceholder,
      valuePlaceholder,
      addButtonText,
      showAddButton,
      showRemoveButton,
      allowDuplicateKeys,
      enablePaste,
      trim,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <KeyValueContext.Provider value={contextValue}>
        <RootPrimitive
          {...rootProps}
          className={cn("flex flex-col gap-2", className)}
          data-disabled={disabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
        >
          {props.children}
        </RootPrimitive>
        {name && (
          <input
            type="hidden"
            name={name}
            value={JSON.stringify(stateRef.current.entries)}
          />
        )}
      </KeyValueContext.Provider>
    </StoreContext.Provider>
  );
}

KeyValueRoot.displayName = ROOT_NAME;

interface KeyValueListProps extends React.ComponentProps<"div"> {
  orientation?: "vertical" | "horizontal";
  asChild?: boolean;
}

function KeyValueList(props: KeyValueListProps) {
  const { orientation = "vertical", asChild, className, ...listProps } = props;

  const entries = useStore((state) => state.entries);

  const ListPrimitive = asChild ? Slot : "div";

  return (
    <ListPrimitive
      {...listProps}
      role="list"
      aria-label="Key-value pairs"
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col gap-2" : "flex-row gap-2",
        className,
      )}
      data-orientation={orientation}
    >
      {entries.map((entry) => {
        const children = React.Children.toArray(props.children);
        return (
          <KeyValueItemContext.Provider key={entry.id} value={{ entry }}>
            {children}
          </KeyValueItemContext.Provider>
        );
      })}
    </ListPrimitive>
  );
}

KeyValueList.displayName = LIST_NAME;

interface KeyValueItemContextValue {
  entry: KeyValueEntry;
}

const KeyValueItemContext =
  React.createContext<KeyValueItemContextValue | null>(null);

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
  const { entry } = useKeyValueItemContext(ITEM_NAME);

  const focusedId = useStore((state) => state.focusedId);

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <ItemPrimitive
      {...itemProps}
      role="listitem"
      className={cn("flex items-start gap-2", className)}
      data-focused={focusedId === entry.id ? "" : undefined}
    >
      {props.children}
    </ItemPrimitive>
  );
}

KeyValueItem.displayName = ITEM_NAME;

interface KeyValueKeyInputProps extends React.ComponentProps<"input"> {
  asChild?: boolean;
}

function KeyValueKeyInput(props: KeyValueKeyInputProps) {
  const {
    asChild,
    className,
    validateKey,
    validateValue,
    onPaste: onPasteProp,
    ...inputProps
  } = props as KeyValueKeyInputProps &
    Pick<KeyValueRootProps, "validateKey" | "validateValue" | "onPaste">;
  const { entry } = useKeyValueItemContext(KEY_INPUT_NAME);
  const context = useKeyValueContext(KEY_INPUT_NAME);
  const store = useStoreContext(KEY_INPUT_NAME);

  const errors = useStore((state) => state.errors);
  const hasError = errors[entry.id]?.key !== undefined;

  const rootPropsRef = useAsRef({
    validateKey,
    validateValue,
    onPaste: onPasteProp,
  });

  const onChange = (event: React.ChangeEvent<KeyInputElement>) => {
    const state = store.getState();
    const newEntries = state.entries.map((item) => {
      if (item.id !== entry.id) return item;
      const updated = { ...item, key: event.target.value };
      if (context.trim) updated.key = updated.key.trim();
      return updated;
    });

    store.setState("entries", newEntries);

    const updatedEntry = newEntries.find((item) => item.id === entry.id);
    if (updatedEntry) {
      const errors: { key?: string; value?: string } = {};

      if (rootPropsRef.current.validateKey) {
        const keyError = rootPropsRef.current.validateKey(
          updatedEntry.key,
          newEntries,
        );
        if (keyError) errors.key = keyError;
      }

      if (!context.allowDuplicateKeys) {
        const duplicateKey = newEntries.find(
          (item) =>
            item.id !== updatedEntry.id &&
            item.key === updatedEntry.key &&
            updatedEntry.key !== "",
        );
        if (duplicateKey) {
          errors.key = "Duplicate key";
        }
      }

      if (rootPropsRef.current.validateValue) {
        const valueError = rootPropsRef.current.validateValue(
          updatedEntry.value,
          updatedEntry.key,
          newEntries,
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

    inputProps.onChange?.(event);
  };

  const onPaste = (event: React.ClipboardEvent<KeyInputElement>) => {
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
        const currentIndex = state.entries.findIndex(
          (item) => item.id === entry.id,
        );

        // Replace current empty entry or add after current entry
        let newEntries: KeyValueEntry[];
        if (entry.key === "" && entry.value === "") {
          newEntries = [
            ...state.entries.slice(0, currentIndex),
            ...parsed,
            ...state.entries.slice(currentIndex + 1),
          ];
        } else {
          newEntries = [
            ...state.entries.slice(0, currentIndex + 1),
            ...parsed,
            ...state.entries.slice(currentIndex + 1),
          ];
        }

        // Respect maxEntries
        if (context.maxEntries !== undefined) {
          newEntries = newEntries.slice(0, context.maxEntries);
        }

        store.setState("entries", newEntries);

        // Notify paste callback
        if (rootPropsRef.current.onPaste) {
          rootPropsRef.current.onPaste(
            event.nativeEvent as unknown as ClipboardEvent,
            parsed,
          );
        }
      }
    }
  };

  const KeyInputPrimitive = asChild ? Slot : "input";

  return (
    <KeyInputPrimitive
      type="text"
      {...inputProps}
      value={entry.key}
      onChange={onChange}
      onPaste={onPaste}
      placeholder={context.keyPlaceholder}
      disabled={context.disabled}
      readOnly={context.readOnly}
      required={context.required}
      aria-label={`Key for entry ${entry.id}`}
      aria-invalid={hasError}
      aria-describedby={
        hasError ? `${context.id}-${entry.id}-key-error` : undefined
      }
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        hasError && "border-destructive focus-visible:ring-destructive",
        className,
      )}
    />
  );
}

KeyValueKeyInput.displayName = KEY_INPUT_NAME;

interface KeyValueValueInputProps extends React.ComponentProps<"input"> {
  asChild?: boolean;
}

function KeyValueValueInput(props: KeyValueValueInputProps) {
  const { asChild, className, validateKey, validateValue, ...inputProps } =
    props as KeyValueValueInputProps &
      Pick<KeyValueRootProps, "validateKey" | "validateValue">;
  const { entry } = useKeyValueItemContext(VALUE_INPUT_NAME);
  const context = useKeyValueContext(VALUE_INPUT_NAME);
  const store = useStoreContext(VALUE_INPUT_NAME);

  const rootPropsRef = useAsRef({ validateKey, validateValue });
  const errors = useStore((state) => state.errors);
  const hasError = errors[entry.id]?.value !== undefined;

  const onChange = (event: React.ChangeEvent<ValueInputElement>) => {
    const state = store.getState();
    const newEntries = state.entries.map((item) => {
      if (item.id !== entry.id) return item;
      const updated = { ...item, value: event.target.value };
      if (context.trim) updated.value = updated.value.trim();
      return updated;
    });

    store.setState("entries", newEntries);

    // Validate
    const updatedEntry = newEntries.find((item) => item.id === entry.id);
    if (updatedEntry) {
      const errors: { key?: string; value?: string } = {};

      if (rootPropsRef.current.validateKey) {
        const keyError = rootPropsRef.current.validateKey(
          updatedEntry.key,
          newEntries,
        );
        if (keyError) errors.key = keyError;
      }

      if (!context.allowDuplicateKeys) {
        const duplicateKey = newEntries.find(
          (item) =>
            item.id !== updatedEntry.id &&
            item.key === updatedEntry.key &&
            updatedEntry.key !== "",
        );
        if (duplicateKey) {
          errors.key = "Duplicate key";
        }
      }

      if (rootPropsRef.current.validateValue) {
        const valueError = rootPropsRef.current.validateValue(
          updatedEntry.value,
          updatedEntry.key,
          newEntries,
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

    inputProps.onChange?.(event);
  };

  const ValueInputPrimitive = asChild ? Slot : "input";

  return (
    <ValueInputPrimitive
      type="text"
      {...inputProps}
      value={entry.value}
      onChange={onChange}
      placeholder={context.valuePlaceholder}
      disabled={context.disabled}
      readOnly={context.readOnly}
      aria-label={`Value for ${entry.key || `entry ${entry.id}`}`}
      aria-invalid={hasError}
      aria-describedby={
        hasError ? `${context.id}-${entry.id}-value-error` : undefined
      }
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        hasError && "border-destructive focus-visible:ring-destructive",
        className,
      )}
    />
  );
}

KeyValueValueInput.displayName = VALUE_INPUT_NAME;

interface KeyValueRemoveButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function KeyValueRemoveButton(props: KeyValueRemoveButtonProps) {
  const { asChild, className, children, onRemove, ...buttonProps } =
    props as KeyValueRemoveButtonProps & Pick<KeyValueRootProps, "onRemove">;
  const { entry } = useKeyValueItemContext(REMOVE_BUTTON_NAME);
  const context = useKeyValueContext(REMOVE_BUTTON_NAME);
  const store = useStoreContext(REMOVE_BUTTON_NAME);

  const rootPropsRef = useAsRef({ onRemove });
  const entries = useStore((state) => state.entries);
  const isDisabled = context.disabled || entries.length <= context.minEntries;

  const onClick = (event: React.MouseEvent<RemoveButtonElement>) => {
    buttonProps.onClick?.(event);

    const state = store.getState();
    if (state.entries.length <= context.minEntries) return;

    const entryToRemove = state.entries.find((item) => item.id === entry.id);
    if (!entryToRemove) return;

    const newEntries = state.entries.filter((item) => item.id !== entry.id);
    const newErrors = { ...state.errors };
    delete newErrors[entry.id];

    store.setState("entries", newEntries);
    store.setState("errors", newErrors);

    rootPropsRef.current.onRemove?.(entryToRemove);
  };

  const RemoveButtonPrimitive = asChild ? Slot : "button";

  return (
    <RemoveButtonPrimitive
      type="button"
      {...buttonProps}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`Remove ${entry.key || "entry"}`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {children ?? <XIcon />}
    </RemoveButtonPrimitive>
  );
}

KeyValueRemoveButton.displayName = REMOVE_BUTTON_NAME;

interface KeyValueAddButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function KeyValueAddButton(props: KeyValueAddButtonProps) {
  const { asChild, className, children, onAdd, ...buttonProps } =
    props as KeyValueAddButtonProps & Pick<KeyValueRootProps, "onAdd">;
  const context = useKeyValueContext(ADD_BUTTON_NAME);
  const store = useStoreContext(ADD_BUTTON_NAME);

  const rootPropsRef = useAsRef({ onAdd });
  const entries = useStore((state) => state.entries);
  const isDisabled =
    context.disabled ||
    (context.maxEntries !== undefined && entries.length >= context.maxEntries);

  const onClick = (event: React.MouseEvent<AddButtonElement>) => {
    buttonProps.onClick?.(event);

    const state = store.getState();
    if (
      context.maxEntries !== undefined &&
      state.entries.length >= context.maxEntries
    ) {
      return;
    }

    const newEntry: KeyValueEntry = {
      id: crypto.randomUUID(),
      key: "",
      value: "",
    };

    const newEntries = [...state.entries, newEntry];
    store.setState("entries", newEntries);
    store.setState("focusedId", newEntry.id);

    rootPropsRef.current.onAdd?.(newEntry);
  };

  const AddButtonPrimitive = asChild ? Slot : "button";

  return (
    <AddButtonPrimitive
      type="button"
      {...buttonProps}
      onClick={onClick}
      disabled={isDisabled}
      aria-label="Add new entry"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {children ?? (
        <>
          <PlusIcon />
          {context.addButtonText}
        </>
      )}
    </AddButtonPrimitive>
  );
}

KeyValueAddButton.displayName = ADD_BUTTON_NAME;

interface KeyValueErrorProps extends React.ComponentProps<"span"> {
  field: "key" | "value";
  asChild?: boolean;
}

function KeyValueError(props: KeyValueErrorProps) {
  const { field, asChild, className, ...errorProps } = props;
  const { entry } = useKeyValueItemContext(ERROR_NAME);
  const context = useKeyValueContext(ERROR_NAME);

  const errors = useStore((state) => state.errors);
  const error = errors[entry.id]?.[field];

  if (!error) return null;

  const ErrorPrimitive = asChild ? Slot : "span";

  return (
    <ErrorPrimitive
      {...errorProps}
      id={`${context.id}-${entry.id}-${field}-error`}
      role="alert"
      className={cn("font-medium text-destructive text-sm", className)}
    >
      {error}
    </ErrorPrimitive>
  );
}

KeyValueError.displayName = ERROR_NAME;

export {
  KeyValueRoot as KeyValue,
  KeyValueList,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueValueInput,
  KeyValueRemoveButton,
  KeyValueAddButton,
  KeyValueError,
  //
  KeyValueRoot as Root,
  KeyValueList as List,
  KeyValueItem as Item,
  KeyValueKeyInput as KeyInput,
  KeyValueValueInput as ValueInput,
  KeyValueRemoveButton as RemoveButton,
  KeyValueAddButton as AddButton,
  KeyValueError as Error,
};

export type {
  KeyValueEntry,
  KeyValueRootProps as KeyValueProps,
  KeyValueListProps,
  KeyValueItemProps,
  KeyValueKeyInputProps,
  KeyValueValueInputProps,
  KeyValueRemoveButtonProps,
  KeyValueAddButtonProps,
  KeyValueErrorProps,
};
