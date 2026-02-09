"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/bases/radix/components/visually-hidden-input";
import { useAsRef } from "@/registry/bases/radix/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/radix/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";

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

type RootElement = React.ComponentRef<typeof KeyValue>;
type KeyInputElement = React.ComponentRef<typeof KeyValueKeyInput>;
type RemoveElement = React.ComponentRef<typeof KeyValueRemove>;
type AddElement = React.ComponentRef<typeof KeyValueAdd>;

function getErrorId(rootId: string, itemId: string, field: Field) {
  return `${rootId}-${itemId}-${field}-error`;
}

function removeQuotes(string: string, shouldStrip: boolean): string {
  if (!shouldStrip) return string;

  const trimmed = string.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
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

function useStore<T>(
  selector: (state: KeyValueState) => T,
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

interface ItemData {
  id: string;
  key: string;
  value: string;
}

interface KeyValueState {
  value: ItemData[];
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
  onPaste?: (event: ClipboardEvent, items: ItemData[]) => void;
  onAdd?: (value: ItemData) => void;
  onRemove?: (value: ItemData) => void;
  onKeyValidate?: (key: string, value: ItemData[]) => string | undefined;
  onValueValidate?: (
    value: string,
    key: string,
    items: ItemData[],
  ) => string | undefined;
  rootId: string;
  maxItems?: number;
  minItems: number;
  keyPlaceholder: string;
  valuePlaceholder: string;
  allowDuplicateKeys: boolean;
  enablePaste: boolean;
  trim: boolean;
  stripQuotes: boolean;
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

interface KeyValueProps extends Omit<DivProps, "onPaste" | "defaultValue"> {
  id?: string;
  defaultValue?: ItemData[];
  value?: ItemData[];
  onValueChange?: (value: ItemData[]) => void;
  maxItems?: number;
  minItems?: number;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  name?: string;
  allowDuplicateKeys?: boolean;
  enablePaste?: boolean;
  trim?: boolean;
  stripQuotes?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onPaste?: (event: ClipboardEvent, items: ItemData[]) => void;
  onAdd?: (value: ItemData) => void;
  onRemove?: (value: ItemData) => void;
  onKeyValidate?: (key: string, value: ItemData[]) => string | undefined;
  onValueValidate?: (
    value: string,
    key: string,
    items: ItemData[],
  ) => string | undefined;
}

function KeyValue(props: KeyValueProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    onPaste,
    onAdd,
    onRemove,
    onKeyValidate,
    onValueValidate,
    maxItems,
    minItems = 0,
    keyPlaceholder = "Key",
    valuePlaceholder = "Value",
    allowDuplicateKeys = false,
    asChild,
    enablePaste = true,
    trim = true,
    stripQuotes = true,
    disabled = false,
    readOnly = false,
    required = false,
    className,
    id,
    name,
    ref,
    ...rootProps
  } = props;

  const instanceId = React.useId();
  const rootId = id ?? instanceId;

  const [formTrigger, setFormTrigger] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<KeyValueState>(() => ({
    value: valueProp ??
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
          stateRef.current.value = val as ItemData[];
          propsRef.current.onValueChange?.(val as ItemData[]);
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

  const value = useStore((state) => state.value, store);
  const errors = useStore((state) => state.errors, store);
  const isInvalid = Object.keys(errors).length > 0;

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp]);

  const contextValue = React.useMemo<KeyValueContextValue>(
    () => ({
      onPaste,
      onAdd,
      onRemove,
      onKeyValidate,
      onValueValidate,
      rootId,
      maxItems,
      minItems,
      keyPlaceholder,
      valuePlaceholder,
      allowDuplicateKeys,
      enablePaste,
      trim,
      stripQuotes,
      disabled,
      readOnly,
      required,
    }),
    [
      onPaste,
      onAdd,
      onRemove,
      onKeyValidate,
      onValueValidate,
      rootId,
      disabled,
      readOnly,
      required,
      maxItems,
      minItems,
      keyPlaceholder,
      valuePlaceholder,
      allowDuplicateKeys,
      enablePaste,
      trim,
      stripQuotes,
    ],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
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
      </KeyValueContext.Provider>
    </StoreContext.Provider>
  );
}

interface KeyValueListProps extends DivProps {
  orientation?: Orientation;
}

function KeyValueList(props: KeyValueListProps) {
  const { orientation = "vertical", asChild, className, ...listProps } = props;

  const value = useStore((state) => state.value);

  const ListPrimitive = asChild ? SlotPrimitive.Slot : "div";

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
      {value.map((item) => {
        const children = React.Children.toArray(props.children);

        return (
          <KeyValueItemContext.Provider key={item.id} value={item}>
            {children}
          </KeyValueItemContext.Provider>
        );
      })}
    </ListPrimitive>
  );
}

const KeyValueItemContext = React.createContext<ItemData | null>(null);

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
  const itemData = useKeyValueItemContext(ITEM_NAME);

  const focusedId = useStore((state) => state.focusedId);

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPrimitive
      role="listitem"
      data-slot="key-value-item"
      data-highlighted={focusedId === itemData.id ? "" : undefined}
      {...itemProps}
      className={cn("flex items-start gap-2", className)}
    />
  );
}

interface KeyValueKeyInputProps extends React.ComponentProps<"input"> {
  asChild?: boolean;
}

function KeyValueKeyInput(props: KeyValueKeyInputProps) {
  const {
    onChange: onChangeProp,
    onPaste: onPasteProp,
    asChild,
    disabled,
    readOnly,
    required,
    ...keyInputProps
  } = props;

  const context = useKeyValueContext(KEY_INPUT_NAME);
  const itemData = useKeyValueItemContext(KEY_INPUT_NAME);
  const store = useStoreContext(KEY_INPUT_NAME);
  const errors = useStore((state) => state.errors);

  const propsRef = useAsRef({
    onChange: onChangeProp,
    onPaste: onPasteProp,
  });

  const isDisabled = disabled || context.disabled;
  const isReadOnly = readOnly || context.readOnly;
  const isRequired = required || context.required;
  const isInvalid = errors[itemData.id]?.key !== undefined;

  const onChange = React.useCallback(
    (event: React.ChangeEvent<KeyInputElement>) => {
      const state = store.getState();
      const newValue = state.value.map((item) => {
        if (item.id !== itemData.id) return item;
        const updated = { ...item, key: event.target.value };
        if (context.trim) updated.key = updated.key.trim();
        return updated;
      });

      store.setState("value", newValue);

      const updatedItemData = newValue.find((item) => item.id === itemData.id);
      if (updatedItemData) {
        const errors: { key?: string; value?: string } = {};

        if (context.onKeyValidate) {
          const keyError = context.onKeyValidate(updatedItemData.key, newValue);
          if (keyError) errors.key = keyError;
        }

        if (!context.allowDuplicateKeys) {
          const duplicateKey = newValue.find(
            (item) =>
              item.id !== updatedItemData.id &&
              item.key === updatedItemData.key &&
              updatedItemData.key !== "",
          );
          if (duplicateKey) {
            errors.key = "Duplicate key";
          }
        }

        if (context.onValueValidate) {
          const valueError = context.onValueValidate(
            updatedItemData.value,
            updatedItemData.key,
            newValue,
          );
          if (valueError) errors.value = valueError;
        }

        const newErrorsState = { ...state.errors };
        if (Object.keys(errors).length > 0) {
          newErrorsState[itemData.id] = errors;
        } else {
          delete newErrorsState[itemData.id];
        }
        store.setState("errors", newErrorsState);
      }

      propsRef.current.onChange?.(event);
    },
    [store, itemData.id, context, propsRef],
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<KeyInputElement>) => {
      if (!context.enablePaste) return;

      propsRef.current.onPaste?.(event);
      if (event.defaultPrevented) return;

      const content = event.clipboardData.getData("text");
      const lines = content.split(/\r?\n/).filter((line) => line.trim());

      if (lines.length > 1) {
        event.preventDefault();

        const parsed: ItemData[] = [];

        for (const line of lines) {
          let key = "";
          let value = "";

          if (line.includes("=")) {
            const parts = line.split("=");
            key = parts[0]?.trim() ?? "";
            value = removeQuotes(
              parts.slice(1).join("=").trim(),
              context.stripQuotes,
            );
          } else if (line.includes(":")) {
            const parts = line.split(":");
            key = parts[0]?.trim() ?? "";
            value = removeQuotes(
              parts.slice(1).join(":").trim(),
              context.stripQuotes,
            );
          } else if (/\s{2,}|\t/.test(line)) {
            const parts = line.split(/\s{2,}|\t/);
            key = parts[0]?.trim() ?? "";
            value = removeQuotes(
              parts.slice(1).join(" ").trim(),
              context.stripQuotes,
            );
          }

          if (key) {
            parsed.push({ id: crypto.randomUUID(), key, value });
          }
        }

        if (parsed.length > 0) {
          const state = store.getState();
          const currentIndex = state.value.findIndex(
            (item) => item.id === itemData.id,
          );

          let newValue: ItemData[];
          if (itemData.key === "" && itemData.value === "") {
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

          if (context.maxItems !== undefined) {
            newValue = newValue.slice(0, context.maxItems);
          }

          store.setState("value", newValue);

          if (context.onPaste) {
            context.onPaste(
              event.nativeEvent as unknown as ClipboardEvent,
              parsed,
            );
          }
        }
      }
    },
    [context, store, itemData, propsRef],
  );

  const KeyInputPrimitive = asChild ? SlotPrimitive.Slot : Input;

  return (
    <KeyInputPrimitive
      aria-invalid={isInvalid}
      aria-describedby={
        isInvalid ? getErrorId(context.rootId, itemData.id, "key") : undefined
      }
      data-slot="key-value-key-input"
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      placeholder={context.keyPlaceholder}
      {...keyInputProps}
      value={itemData.key}
      onChange={onChange}
      onPaste={onPaste}
    />
  );
}

interface KeyValueValueInputProps
  extends Omit<React.ComponentProps<"textarea">, "rows"> {
  maxRows?: number;
  asChild?: boolean;
}

function KeyValueValueInput(props: KeyValueValueInputProps) {
  const {
    onChange: onChangeProp,
    asChild,
    disabled,
    readOnly,
    required,
    className,
    maxRows,
    style,
    ...valueInputProps
  } = props;

  const context = useKeyValueContext(VALUE_INPUT_NAME);
  const itemData = useKeyValueItemContext(VALUE_INPUT_NAME);
  const store = useStoreContext(VALUE_INPUT_NAME);
  const errors = useStore((state) => state.errors);

  const propsRef = useAsRef({
    onChange: onChangeProp,
  });

  const isDisabled = disabled || context.disabled;
  const isReadOnly = readOnly || context.readOnly;
  const isRequired = required || context.required;
  const isInvalid = errors[itemData.id]?.value !== undefined;
  const maxHeight = maxRows ? `calc(${maxRows} * 1.5em + 1rem)` : undefined;

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      propsRef.current.onChange?.(event);

      const state = store.getState();
      const newValue = state.value.map((item) => {
        if (item.id !== itemData.id) return item;
        const updated = { ...item, value: event.target.value };
        if (context.trim) updated.value = updated.value.trim();
        return updated;
      });

      store.setState("value", newValue);

      const updatedItemData = newValue.find((item) => item.id === itemData.id);
      if (updatedItemData) {
        const errors: { key?: string; value?: string } = {};

        if (context.onKeyValidate) {
          const keyError = context.onKeyValidate(updatedItemData.key, newValue);
          if (keyError) errors.key = keyError;
        }

        if (!context.allowDuplicateKeys) {
          const duplicateKey = newValue.find(
            (item) =>
              item.id !== updatedItemData.id &&
              item.key === updatedItemData.key &&
              updatedItemData.key !== "",
          );
          if (duplicateKey) {
            errors.key = "Duplicate key";
          }
        }

        if (context.onValueValidate) {
          const valueError = context.onValueValidate(
            updatedItemData.value,
            updatedItemData.key,
            newValue,
          );
          if (valueError) errors.value = valueError;
        }

        const newErrorsState = { ...state.errors };
        if (Object.keys(errors).length > 0) {
          newErrorsState[itemData.id] = errors;
        } else {
          delete newErrorsState[itemData.id];
        }
        store.setState("errors", newErrorsState);
      }
    },
    [store, itemData.id, context, propsRef],
  );

  const ValueInputPrimitive = asChild ? SlotPrimitive.Slot : Textarea;

  return (
    <ValueInputPrimitive
      aria-invalid={isInvalid}
      aria-describedby={
        isInvalid ? getErrorId(context.rootId, itemData.id, "value") : undefined
      }
      data-slot="key-value-value-input"
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      placeholder={context.valuePlaceholder}
      {...valueInputProps}
      className={cn(
        "field-sizing-content min-h-9 resize-none",
        maxRows && "overflow-y-auto",
        className,
      )}
      style={{
        ...style,
        ...(maxHeight && { maxHeight }),
      }}
      value={itemData.value}
      onChange={onChange}
    />
  );
}

interface KeyValueRemoveProps extends React.ComponentProps<typeof Button> {}

function KeyValueRemove(props: KeyValueRemoveProps) {
  const { onClick: onClickProp, children, ...removeProps } = props;

  const context = useKeyValueContext(REMOVE_NAME);
  const itemData = useKeyValueItemContext(REMOVE_NAME);
  const store = useStoreContext(REMOVE_NAME);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });
  const value = useStore((state) => state.value);
  const isDisabled = context.disabled || value.length <= context.minItems;

  const onClick = React.useCallback(
    (event: React.MouseEvent<RemoveElement>) => {
      propsRef.current.onClick?.(event);

      const state = store.getState();
      if (state.value.length <= context.minItems) return;

      const itemToRemove = state.value.find((item) => item.id === itemData.id);
      if (!itemToRemove) return;

      const newValue = state.value.filter((item) => item.id !== itemData.id);
      const newErrors = { ...state.errors };
      delete newErrors[itemData.id];

      store.setState("value", newValue);
      store.setState("errors", newErrors);

      context.onRemove?.(itemToRemove);
    },
    [store, context, itemData.id, propsRef],
  );

  return (
    <Button
      type="button"
      data-slot="key-value-remove"
      variant="outline"
      size="icon"
      disabled={isDisabled}
      {...removeProps}
      onClick={onClick}
    >
      {children ?? <XIcon />}
    </Button>
  );
}

function KeyValueAdd(props: React.ComponentProps<typeof Button>) {
  const { onClick: onClickProp, children, ...addProps } = props;

  const context = useKeyValueContext(ADD_NAME);
  const store = useStoreContext(ADD_NAME);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });
  const value = useStore((state) => state.value);
  const isDisabled =
    context.disabled ||
    (context.maxItems !== undefined && value.length >= context.maxItems);

  const onClick = React.useCallback(
    (event: React.MouseEvent<AddElement>) => {
      propsRef.current.onClick?.(event);

      const state = store.getState();
      if (
        context.maxItems !== undefined &&
        state.value.length >= context.maxItems
      ) {
        return;
      }

      const newItem: ItemData = {
        id: crypto.randomUUID(),
        key: "",
        value: "",
      };

      const newValue = [...state.value, newItem];
      store.setState("value", newValue);
      store.setState("focusedId", newItem.id);

      context.onAdd?.(newItem);
    },
    [store, context, propsRef],
  );

  return (
    <Button
      type="button"
      data-slot="key-value-add"
      variant="outline"
      disabled={isDisabled}
      {...addProps}
      onClick={onClick}
    >
      {children ?? (
        <>
          <PlusIcon />
          Add
        </>
      )}
    </Button>
  );
}

interface KeyValueErrorProps extends DivProps {
  field: Field;
}

function KeyValueError(props: KeyValueErrorProps) {
  const { field, asChild, className, ...errorProps } = props;

  const context = useKeyValueContext(ERROR_NAME);
  const itemData = useKeyValueItemContext(ERROR_NAME);

  const errors = useStore((state) => state.errors);
  const error = errors[itemData.id]?.[field];

  if (!error) return null;

  const ErrorPrimitive = asChild ? SlotPrimitive.Slot : "span";

  return (
    <ErrorPrimitive
      id={getErrorId(context.rootId, itemData.id, field)}
      role="alert"
      {...errorProps}
      className={cn("font-medium text-destructive text-sm", className)}
    >
      {error}
    </ErrorPrimitive>
  );
}

export {
  KeyValue,
  KeyValueList,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueValueInput,
  KeyValueRemove,
  KeyValueAdd,
  KeyValueError,
  //
  useStore as useKeyValueStore,
  //
  type KeyValueProps,
  type ItemData as KeyValueItemData,
};
