import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { BubbleInput } from "./bubble-input";

import {
  useComposedRefs,
  useControllableState,
  useDirection,
  useFormControl,
  useId,
} from "@diceui/shared";

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
  onAddValue: (textValue: string) => boolean;
  onRemoveValue: (index: number) => void;
  onUpdateValue: (index: number, newValue: string) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  editingIndex: number;
  setEditingIndex: (index: number) => void;
  displayValue: (value: TagValue<T>) => string;
  inputRef: React.RefObject<HTMLInputElement>;
  isInvalidInput: boolean;
  addOnPaste: boolean;
  addOnTab: boolean;
  addOnBlur: boolean;
  disabled: boolean;
  editable: boolean;
  delimiter: string;
  duplicate: boolean;
  loop: boolean;
  dir: "ltr" | "rtl";
  max: number;
  id: string;
  inputId: string;
  labelId: string;
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
    id: idProp,
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
  const id = useId();
  const inputId = `${id}input`;
  const labelId = `${id}label`;
  const dir = useDirection(dirProp);
  const { isFormControl, onTriggerChange } = useFormControl();
  const composedRefs = useComposedRefs(ref, containerRef, (node) => {
    onTriggerChange(node);
  });

  const createTagValue = React.useCallback(
    (textValue: string): TagValue<InputValue> => {
      if (duplicate) {
        const tagItem: TagItem = {
          id: crypto.randomUUID(),
          value: textValue,
        };
        return tagItem;
      }

      return convertValue ? convertValue(textValue) : textValue;
    },
    [duplicate, convertValue],
  );

  const onAddValue = React.useCallback(
    (textValue: string) => {
      if (addOnPaste) {
        const splitValues = textValue
          .split(delimiter)
          .map((v) => v.trim())
          .filter(Boolean);

        if (values.length + splitValues.length > max && max > 0) {
          onInvalid?.(textValue);
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
        onInvalid?.(textValue);
        return false;
      }

      const trimmedValue = textValue.trim();

      if (!duplicate) {
        const exists = values.some((v) => {
          const valueToCompare =
            typeof v === "object" && "value" in v ? v.value : v;
          return valueToCompare === trimmedValue;
        });

        if (exists) {
          setIsInvalidInput(true);
          onInvalid?.(trimmedValue);
          return true;
        }
      }

      const newValue = createTagValue(trimmedValue);
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
        const trimmedValue = newValue.trim();

        if (!duplicate) {
          const exists = values.some((v, i) => {
            if (i === index) return false;
            const valueToCompare =
              typeof v === "object" && "value" in v ? v.value : v;
            return valueToCompare === trimmedValue;
          });

          if (exists) {
            setIsInvalidInput(true);
            onInvalid?.(trimmedValue);
            return;
          }
        }

        const updatedValue = createTagValue(trimmedValue);
        const newValues = [...values];
        newValues[index] = updatedValue;

        setValues(newValues);
        setFocusedIndex(index);
        setEditingIndex(-1);
        setIsInvalidInput(false);
        inputRef.current?.focus();
      }
    },
    [values, setValues, createTagValue, duplicate, onInvalid],
  );

  const onInputKeydown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;

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

      const findNextEnabledIndex = (
        currentIndex: number,
        direction: "next" | "prev",
      ): number => {
        const containerElement = containerRef.current;
        if (!containerElement) return -1;

        const tagItems = Array.from(
          containerElement.querySelectorAll("[data-dice-collection-item]"),
        );
        let nextIndex = currentIndex;

        do {
          if (direction === "next") {
            nextIndex =
              nextIndex >= values.length - 1 ? (loop ? 0 : -1) : nextIndex + 1;
          } else {
            nextIndex =
              nextIndex <= 0 ? (loop ? values.length - 1 : -1) : nextIndex - 1;
          }

          if (nextIndex === -1) break;

          const tagItem = tagItems[nextIndex];
          if (tagItem && !tagItem.hasAttribute("data-disabled")) {
            return nextIndex;
          }
        } while (
          nextIndex !== currentIndex &&
          (loop || (nextIndex >= 0 && nextIndex < values.length))
        );

        return -1;
      };

      switch (event.key) {
        case "Delete":
        case "Backspace": {
          if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

          if (focusedIndex !== -1) {
            const newIndex = findNextEnabledIndex(focusedIndex, "prev");
            onRemoveValue(focusedIndex);
            setFocusedIndex(newIndex);
            event.preventDefault();
          } else if (event.key === "Backspace" && values.length > 0) {
            const lastEnabledIndex = findNextEnabledIndex(
              values.length,
              "prev",
            );
            setFocusedIndex(lastEnabledIndex);
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
            const lastEnabledIndex = findNextEnabledIndex(
              values.length,
              "prev",
            );
            setFocusedIndex(lastEnabledIndex);
            event.preventDefault();
          } else if (focusedIndex !== -1) {
            const nextIndex = findNextEnabledIndex(
              focusedIndex,
              isArrowLeft ? "prev" : "next",
            );
            if (nextIndex !== -1) {
              setFocusedIndex(nextIndex);
              event.preventDefault();
            } else if (isArrowRight) {
              setFocusedIndex(-1);
              target.setSelectionRange(0, 0);
            }
          }
          break;
        }
        case "Home": {
          if (focusedIndex !== -1) {
            const firstEnabledIndex = findNextEnabledIndex(-1, "next");
            setFocusedIndex(firstEnabledIndex);
            event.preventDefault();
          }
          break;
        }
        case "End": {
          if (focusedIndex !== -1) {
            const lastEnabledIndex = findNextEnabledIndex(
              values.length,
              "prev",
            );
            setFocusedIndex(lastEnabledIndex);
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
    displayValue,
    inputRef,
    isInvalidInput,
    addOnPaste,
    addOnTab,
    addOnBlur,
    disabled,
    editable,
    delimiter,
    duplicate,
    loop,
    dir,
    max,
    id,
    inputId,
    labelId,
  };

  return (
    <TagsInputContext.Provider value={contextValue}>
      <Primitive.div
        ref={composedRefs}
        dir={dir}
        data-invalid={isInvalidInput ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onClick={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;

          if (
            containerRef.current?.contains(target) &&
            !target.hasAttribute("data-dice-collection-item") &&
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
        {isFormControl && name && (
          <BubbleInput
            control={containerRef.current}
            name={name}
            value={values.map((v) => displayValue(v))}
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

export type { InputValue, TagItem, TagsInputRootProps, TagValue };
