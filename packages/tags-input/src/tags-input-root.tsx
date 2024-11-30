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
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  editingIndex: number;
  setEditingIndex: (index: number) => void;
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

  /** Callback function to handle changes in the tag values */
  onValueChange?: (value: T[]) => void;

  /** Callback function to handle invalid input. */
  onInvalid?: (value: T) => void;

  /** Function to convert a tag value to its display string representation. */
  displayValue?: (value: T) => string;

  /**
   * Enables adding tags by pasting text, which will be split by the delimiter.
   * @default false
   */
  addOnPaste?: boolean;

  /**
   * Enables adding tags when Tab key is pressed
   * @default false
   */
  addOnTab?: boolean;

  /**
   * Enables adding tags when input loses focus.
   * @default false
   */
  addOnBlur?: boolean;

  /**
   * Allows editing of existing tags
   * @default false
   */
  editable?: boolean;

  /**
   * Disables the entire tags input.
   * @default false
   */
  disabled?: boolean;

  /**
   * Character used to split pasted text into multiple tags
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

  /** Whether the field is required in a form context */
  required?: boolean;

  /** Name of the form field when used in a form */
  name?: string;

  /**
   * Enables wrapping focus from last to first tag and vice versa
   * @default false
   */
  loop?: boolean;

  /** Custom ID for the component */
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
  const { getItems } = useCollection({ ref: containerRef });

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
      setFocusedIndex(-1);
      setEditingIndex(-1);
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
        setFocusedIndex(index);
        setEditingIndex(-1);
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
        setFocusedIndex(-1);
        setEditingIndex(-1);
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

        const enabledItems = getItems().filter(
          (item) => !item.hasAttribute("data-disabled"),
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

          const item = enabledItems[nextIndex];
          if (item && !item.hasAttribute("data-disabled")) {
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
    [
      focusedIndex,
      values.length,
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
      focusedIndex={focusedIndex}
      setFocusedIndex={setFocusedIndex}
      editingIndex={editingIndex}
      setEditingIndex={setEditingIndex}
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
    </TagsInputProvider>
  );
});

TagsInputRoot.displayName = ROOT_NAME;

const Root = TagsInputRoot;

export { Root, TagsInputRoot, useTagsInput };

export type { InputValue, TagsInputRootProps };
