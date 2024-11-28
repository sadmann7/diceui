import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useControllableState } from "./hooks/use-controllable-state";
import { useDirection } from "./hooks/use-direction";
import { composeRefs } from "./lib/compose-refs";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type InputValue = string | Record<string, any>;

interface TagItem {
  id: string;
  value: string;
}

type TagValue<T> = T extends string ? T | TagItem : T;

interface TagsInputContextValue<T extends InputValue> {
  values: TagValue<T>[];
  onValuesChange: (value: TagValue<T>[]) => void;
  onAddValue: (payload: string) => boolean;
  onRemoveValue: (index: number) => void;
  onUpdateValue: (index: number, newValue: string) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  editingIndex: number;
  setEditingIndex: (index: number) => void;
  isInvalidInput: boolean;
  addOnPaste: boolean;
  addOnTab: boolean;
  addOnBlur: boolean;
  disabled: boolean;
  editable: boolean;
  delimiter: string;
  dir: "ltr" | "rtl";
  max: number;
  id?: string;
  displayValue: (value: TagValue<T>) => string;
  inputRef: React.RefObject<HTMLInputElement>;
  duplicate: boolean;
  loop: boolean;
}

const TagsInputContext = React.createContext<
  TagsInputContextValue<InputValue> | undefined
>(undefined);

export function useTagsInput() {
  const context = React.useContext(TagsInputContext);
  if (!context) {
    throw new Error("useTagsInput must be used within a TagsInput provider");
  }
  return context;
}

interface TagsInputRootProps<T extends InputValue>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange" | "onInvalid"
  > {
  value?: TagValue<T>[];
  defaultValue?: TagValue<T>[];
  onValueChange?: (value: TagValue<T>[]) => void;
  onInvalid?: (value: TagValue<T>) => void;
  addOnPaste?: boolean;
  addOnTab?: boolean;
  addOnBlur?: boolean;
  duplicate?: boolean;
  disabled?: boolean;
  editable?: boolean;
  delimiter?: string;
  dir?: "ltr" | "rtl";
  max?: number;
  required?: boolean;
  name?: string;
  loop?: boolean;
  id?: string;
  convertValue?: (value: string) => T;
  displayValue?: (value: TagValue<T>) => string;
}

const TagsInputRoot = React.forwardRef<
  HTMLDivElement,
  TagsInputRootProps<InputValue>
>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    onInvalid,
    addOnPaste = false,
    addOnTab = false,
    addOnBlur = false,
    duplicate = false,
    disabled = false,
    editable = false,
    delimiter = ",",
    dir: dirProp,
    max = 0,
    required = false,
    name,
    id,
    loop = false,
    convertValue,
    displayValue = (value: TagValue<InputValue>) => {
      if (typeof value === "object" && "value" in value) {
        return value.value;
      }
      return value.toString();
    },
    children,
    ...tagInputProps
  } = props;

  const [values = [], setValues] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const [editingIndex, setEditingIndex] = React.useState<number>(-1);
  const [isInvalidInput, setIsInvalidInput] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dir = useDirection(dirProp);

  const createTagValue = React.useCallback(
    (payload: string): TagValue<InputValue> => {
      if (duplicate) {
        const tagItem: TagItem = {
          id: crypto.randomUUID(),
          value: payload,
        };
        return tagItem;
      }

      return convertValue ? convertValue(payload) : payload;
    },
    [duplicate, convertValue],
  );

  const onAddValue = React.useCallback(
    (payload: string) => {
      if (addOnPaste) {
        const splitValues = payload
          .split(delimiter)
          .map((v) => v.trim())
          .filter(Boolean);

        if (values.length + splitValues.length > max && max > 0) {
          onInvalid?.(payload);
          return false;
        }

        let newValues: InputValue[] = [];
        if (duplicate) {
          newValues = splitValues;
        } else {
          newValues = [
            ...new Set(splitValues.filter((v) => !values.includes(v))),
          ];
        }

        setValues([...values, ...newValues]);

        return true;
      }

      if (values.length >= max && max > 0) {
        onInvalid?.(payload);
        return false;
      }

      if (!duplicate) {
        const exists = values.some((v) => {
          const valueToCompare =
            typeof v === "object" && "value" in v ? v.value : v;
          return valueToCompare === payload;
        });

        if (exists) {
          setIsInvalidInput(true);
          onInvalid?.(payload);
          return true;
        }
      }

      const newValue = createTagValue(payload);
      const newValues = [...values, newValue];
      setValues(newValues);
      setFocusedIndex(-1);
      setEditingIndex(-1);
      setIsInvalidInput(false);
      return true;
    },
    [
      values,
      max,
      duplicate,
      addOnPaste,
      delimiter,
      setValues,
      onInvalid,
      createTagValue,
    ],
  );

  const onRemoveValue = React.useCallback(
    (index: number) => {
      if (index !== -1) {
        const newValues = [...values];
        newValues.splice(index, 1);
        setValues(newValues);
        setFocusedIndex(-1);
        setEditingIndex(-1);
        inputRef.current?.focus();
      }
    },
    [values, setValues],
  );

  const onUpdateValue = React.useCallback(
    (index: number, newValue: string) => {
      if (index !== -1) {
        const updatedValue = createTagValue(newValue);
        const newValues = [...values];
        newValues[index] = updatedValue;
        setValues(newValues);
        setFocusedIndex(index);
        setEditingIndex(-1);
        inputRef.current?.focus();
      }
    },
    [values, setValues, createTagValue],
  );

  const onInputKeydown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLInputElement;
      const isArrowLeft =
        (event.key === "ArrowLeft" && dir === "ltr") ||
        (event.key === "ArrowRight" && dir === "rtl");
      const isArrowRight =
        (event.key === "ArrowRight" && dir === "ltr") ||
        (event.key === "ArrowLeft" && dir === "rtl");

      if (target.value) {
        setFocusedIndex(-1);
        setEditingIndex(-1);
        return;
      }

      switch (event.key) {
        case "Delete":
        case "Backspace": {
          if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

          if (focusedIndex !== -1) {
            const newIndex =
              focusedIndex === values.length - 1
                ? focusedIndex - 1
                : focusedIndex;
            onRemoveValue(focusedIndex);
            setFocusedIndex(newIndex);
            event.preventDefault();
          } else if (event.key === "Backspace" && values.length > 0) {
            setFocusedIndex(values.length - 1);
            event.preventDefault();
          }
          break;
        }
        case "Enter": {
          if (focusedIndex !== -1 && editable && !disabled) {
            setEditingIndex(focusedIndex);
            event.preventDefault();
            return;
          }
          break;
        }
        case "ArrowLeft":
        case "ArrowRight": {
          if (
            target.selectionStart === 0 &&
            isArrowLeft &&
            focusedIndex === -1 &&
            values.length > 0
          ) {
            setFocusedIndex(values.length - 1);
            event.preventDefault();
          } else if (focusedIndex !== -1) {
            if (isArrowLeft) {
              if (focusedIndex > 0) {
                setFocusedIndex(focusedIndex - 1);
              } else if (loop) {
                setFocusedIndex(values.length - 1);
              }
              event.preventDefault();
            } else if (isArrowRight) {
              if (focusedIndex < values.length - 1) {
                setFocusedIndex(focusedIndex + 1);
              } else if (loop) {
                setFocusedIndex(0);
              } else {
                setFocusedIndex(-1);
                target.setSelectionRange(0, 0);
              }
              event.preventDefault();
            }
          }
          break;
        }
        case "Home": {
          if (focusedIndex !== -1) {
            setFocusedIndex(0);
            event.preventDefault();
          }
          break;
        }
        case "End": {
          if (focusedIndex !== -1) {
            setFocusedIndex(values.length - 1);
            event.preventDefault();
          }
          break;
        }
        case "Escape": {
          setFocusedIndex(-1);
          setEditingIndex(-1);
          target.setSelectionRange(0, 0);
          break;
        }
      }
    },
    [focusedIndex, values.length, onRemoveValue, dir, editable, disabled, loop],
  );

  const contextValue: TagsInputContextValue<InputValue> = {
    values,
    onValuesChange: setValues,
    onAddValue,
    onRemoveValue,
    onUpdateValue,
    onInputKeydown,
    focusedIndex,
    setFocusedIndex,
    editingIndex,
    setEditingIndex,
    isInvalidInput,
    addOnPaste,
    addOnTab,
    addOnBlur,
    disabled,
    editable,
    delimiter,
    dir,
    max,
    id,
    displayValue,
    inputRef,
    duplicate,
    loop,
  };

  return (
    <TagsInputContext.Provider value={contextValue}>
      <Primitive.div
        ref={composeRefs(ref, containerRef)}
        dir={dir}
        data-invalid={isInvalidInput ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onClick={(event) => {
          const target = event.target;

          if (!(target instanceof HTMLElement)) return;

          if (
            containerRef.current?.contains(target) &&
            !target.hasAttribute("data-tag-item") &&
            target.tagName !== "INPUT"
          ) {
            inputRef.current?.focus();
            setFocusedIndex(-1);
            setEditingIndex(-1);
          }
        }}
        {...tagInputProps}
      >
        {children}
        {name && (
          <input
            type="hidden"
            name={name}
            value={JSON.stringify(values)}
            required={required}
            disabled={disabled}
          />
        )}
      </Primitive.div>
    </TagsInputContext.Provider>
  );
});

TagsInputRoot.displayName = "TagsInputRoot";

const Root = TagsInputRoot;

export { Root, TagsInputRoot };

export type { TagsInputRootProps, InputValue, TagItem, TagValue };
