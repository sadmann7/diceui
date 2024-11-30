import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { BubbleInput } from "./bubble-input";

import {
  createContext,
  useCollection,
  useComposedRefs,
  useControllableState,
  useDirection,
  useFormControl,
  useId,
} from "@diceui/shared";

type InputValue = string;

const ROOT_NAME = "TagsInputRoot";

interface TagsInputContextValue<T = InputValue> {
  values: T[];
  onValuesChange: (value: T[]) => void;
  onAddValue: (textValue: string) => boolean;
  onRemoveValue: (index: number) => void;
  onUpdateValue: (index: number, newTextValue: string) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  focusedValue: T | null;
  setFocusedValue: (value: T | null) => void;
  editingValue: T | null;
  setEditingValue: (value: T | null) => void;
  displayValue: (value: T) => string;
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

const [TagsInputProvider, useTagsInput] =
  createContext<TagsInputContextValue<InputValue>>(ROOT_NAME);

interface TagsInputRootProps<T = InputValue>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange" | "onInvalid"
  > {
  /** Controlled array of tag values. */
  value?: T[];

  /** Initial array of tag values when uncontrolled. */
  defaultValue?: T[];

  /** Callback function to handle changes in the tag values. */
  onValueChange?: (value: T[]) => void;

  /** Callback function to handle invalid input. */
  onInvalid?: (value: T) => void;

  /** Function to convert a tag value to its display string representation. */
  displayValue?: (value: T) => string;

  /**
   * Enable adding tags by pasting text, which will be split by the delimiter.
   * @default false
   */
  addOnPaste?: boolean;

  /**
   * Enable adding tags when Tab key is pressed.
   * @default false
   */
  addOnTab?: boolean;

  /**
   * Enable adding tags when input loses focus.
   * @default false
   */
  addOnBlur?: boolean;

  /**
   * Allow editing of existing tags
   * @default false
   */
  editable?: boolean;

  /**
   * Disables the entire tags input.
   * @default false
   */
  disabled?: boolean;

  /**
   * Character used to split pasted text into multiple tags.
   * @default ","
   */
  delimiter?: string;

  /**
   * Text direction for the input.
   * @default "ltr"
   */
  dir?: "ltr" | "rtl";

  /**
   * Maximum number of tags allowed.
   * @default Number.POSITIVE_INFINITY
   */
  max?: number;

  /** Whether the field is required in a form context. */
  required?: boolean;

  /** Name of the form field when used in a form. */
  name?: string;

  /**
   * Enable wrapping focus from last to first tag and vice versa.
   * @default false
   */
  loop?: boolean;

  /** Unique identifier for the tags input. */
  id?: string;
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
    editable = false,
    disabled = false,
    delimiter = ",",
    dir: dirProp,
    max = Number.POSITIVE_INFINITY,
    required = false,
    name,
    id: idProp,
    loop = false,
    displayValue = (value: InputValue) => value.toString(),
    children,
    ...tagInputProps
  } = props;

  // TODO: add duplicate
  const duplicate = false;

  const [values = [], setValues] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [focusedValue, setFocusedValue] = React.useState<InputValue | null>(
    null,
  );
  const [editingValue, setEditingValue] = React.useState<InputValue | null>(
    null,
  );
  const [isInvalidInput, setIsInvalidInput] = React.useState(false);
  const collectionRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = useId();
  const inputId = `${id}input`;
  const labelId = `${id}label`;
  const dir = useDirection(dirProp);
  const { isFormControl, onTriggerChange } = useFormControl();
  const composedRefs = useComposedRefs(ref, collectionRef, (node) => {
    onTriggerChange(node);
  });
  const { getItems } = useCollection({ ref: collectionRef });

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
          const valueToCompare = v;
          return valueToCompare === trimmedValue;
        });

        if (exists) {
          setIsInvalidInput(true);
          onInvalid?.(trimmedValue);
          return true;
        }
      }

      const newValue = trimmedValue;
      const newValues = [...values, newValue];
      setValues(newValues);
      setFocusedValue(null);
      setEditingValue(null);
      setIsInvalidInput(false);
      return true;
    },
    [values, max, addOnPaste, delimiter, setValues, onInvalid],
  );

  const onUpdateValue = React.useCallback(
    (index: number, newTextValue: string) => {
      if (index !== -1) {
        const trimmedValue = newTextValue.trim();

        if (!duplicate) {
          const exists = values.some((v, i) => {
            if (i === index) return false;
            const valueToCompare = v;
            return valueToCompare === trimmedValue;
          });

          if (exists) {
            setIsInvalidInput(true);
            onInvalid?.(trimmedValue);
            return;
          }
        }

        const updatedValue = displayValue(trimmedValue);
        const newValues = [...values];
        newValues[index] = updatedValue;

        setValues(newValues);
        setFocusedValue(updatedValue);
        setEditingValue(null);
        setIsInvalidInput(false);

        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [values, setValues, displayValue, onInvalid],
  );

  const onRemoveValue = React.useCallback(
    (index: number) => {
      if (index !== -1) {
        const newValues = [...values];
        newValues.splice(index, 1);
        setValues(newValues);
        setFocusedValue(null);
        setEditingValue(null);
        inputRef.current?.focus();
      }
    },
    [values, setValues],
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

      if (target.value && target.selectionStart !== 0) {
        setFocusedValue(null);
        setEditingValue(null);
        return;
      }

      const findNextEnabledValue = (
        currentValue: InputValue | null,
        direction: "next" | "prev",
      ): InputValue | null => {
        const collectionElement = collectionRef.current;
        if (!collectionElement) return null;

        const enabledItems = getItems().filter(
          (item) => !item.hasAttribute("data-disabled"),
        );
        const enabledValues = enabledItems.map((_, index) => values[index]);

        if (enabledValues.length === 0) return null;

        if (currentValue === null) {
          return direction === "prev"
            ? (enabledValues[enabledValues.length - 1] ?? null)
            : (enabledValues[0] ?? null);
        }

        const currentIndex = enabledValues.indexOf(currentValue);
        if (direction === "next") {
          return currentIndex >= enabledValues.length - 1
            ? loop
              ? (enabledValues[0] ?? null)
              : null
            : (enabledValues[currentIndex + 1] ?? null);
        }

        return currentIndex <= 0
          ? loop
            ? (enabledValues[enabledValues.length - 1] ?? null)
            : null
          : (enabledValues[currentIndex - 1] ?? null);
      };

      switch (event.key) {
        case "Delete":
        case "Backspace": {
          if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

          if (focusedValue !== null) {
            const index = values.indexOf(focusedValue);
            const newValue = findNextEnabledValue(focusedValue, "prev");
            onRemoveValue(index);
            setFocusedValue(newValue);
            event.preventDefault();
          } else if (event.key === "Backspace" && values.length > 0) {
            const lastValue = findNextEnabledValue(null, "prev");
            setFocusedValue(lastValue);
            event.preventDefault();
          }
          break;
        }
        case "Enter": {
          if (focusedValue !== null && editable && !disabled) {
            setEditingValue(focusedValue);
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
            focusedValue === null &&
            values.length > 0
          ) {
            const lastValue = findNextEnabledValue(null, "prev");
            setFocusedValue(lastValue);
            event.preventDefault();
          } else if (focusedValue !== null) {
            const nextValue = findNextEnabledValue(
              focusedValue,
              isArrowLeft ? "prev" : "next",
            );
            if (nextValue !== null) {
              setFocusedValue(nextValue);
              event.preventDefault();
            } else if (isArrowRight) {
              setFocusedValue(null);
              requestAnimationFrame(() => target.setSelectionRange(0, 0));
            }
          }
          break;
        }
        case "Home": {
          if (focusedValue !== null) {
            const firstValue = findNextEnabledValue(null, "next");
            setFocusedValue(firstValue);
            event.preventDefault();
          }
          break;
        }
        case "End": {
          if (focusedValue !== null) {
            const lastValue = findNextEnabledValue(null, "prev");
            setFocusedValue(lastValue);
            event.preventDefault();
          }
          break;
        }
        case "Escape": {
          setFocusedValue(null);
          setEditingValue(null);
          requestAnimationFrame(() => target.setSelectionRange(0, 0));
          break;
        }
      }
    },
    [
      focusedValue,
      values,
      onRemoveValue,
      dir,
      editable,
      disabled,
      loop,
      getItems,
    ],
  );

  return (
    <TagsInputProvider
      values={values}
      onValuesChange={setValues}
      onAddValue={onAddValue}
      onRemoveValue={onRemoveValue}
      onUpdateValue={onUpdateValue}
      onInputKeydown={onInputKeydown}
      focusedValue={focusedValue}
      setFocusedValue={setFocusedValue}
      editingValue={editingValue}
      setEditingValue={setEditingValue}
      displayValue={displayValue}
      inputRef={inputRef}
      isInvalidInput={isInvalidInput}
      addOnPaste={addOnPaste}
      addOnTab={addOnTab}
      addOnBlur={addOnBlur}
      editable={editable}
      disabled={disabled}
      delimiter={delimiter}
      duplicate={duplicate}
      loop={loop}
      dir={dir}
      max={max}
      id={id}
      inputId={inputId}
      labelId={labelId}
    >
      <Primitive.div
        ref={composedRefs}
        dir={dir}
        data-invalid={isInvalidInput ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onClick={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;

          if (
            collectionRef.current?.contains(target) &&
            !target.hasAttribute("data-dice-collection-item") &&
            target.tagName !== "INPUT"
          ) {
            inputRef.current?.focus();
            setFocusedValue(null);
            setEditingValue(null);
          }
        }}
        {...tagInputProps}
      >
        {children}
        {isFormControl && name && (
          <BubbleInput
            control={collectionRef.current}
            name={name}
            value={values.map((v) => displayValue(v))}
            required={required}
            disabled={disabled}
          />
        )}
      </Primitive.div>
    </TagsInputProvider>
  );
});

TagsInputRoot.displayName = ROOT_NAME;

const Root = TagsInputRoot;

export { Root, TagsInputRoot, useTagsInput };

export type { InputValue, TagsInputRootProps };
