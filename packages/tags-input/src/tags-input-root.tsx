import * as React from "react";

import {
  BubbleInput,
  DATA_ITEM_ATTR,
  type Direction,
  Primitive,
  composeEventHandlers,
  createContext,
  useComposedRefs,
  useControllableState,
  useDirection,
  useFormControl,
  useId,
  useItemCollection,
} from "@diceui/shared";
import type { TagsInputInput } from "./tags-input-input";

type InputValue = string;

const ROOT_NAME = "TagsInputRoot";

type CollectionElement = React.ElementRef<typeof Primitive.div>;
type InputElement = React.ElementRef<typeof TagsInputInput>;

interface TagsInputContextValue<T = InputValue> {
  value: T[];
  onValueChange: (value: T[]) => void;
  onItemAdd: (textValue: string, options?: { viaPaste?: boolean }) => boolean;
  onItemRemove: (index: number) => void;
  onItemUpdate: (index: number, newTextValue: string) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  highlightedIndex: number | null;
  setHighlightedIndex: (index: number | null) => void;
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
  displayValue: (value: T) => string;
  onItemLeave: () => void;
  inputRef: React.RefObject<InputElement | null>;
  addOnPaste: boolean;
  addOnTab: boolean;
  delimiter: string;
  disabled: boolean;
  editable: boolean;
  loop: boolean;
  isInvalidInput: boolean;
  blurBehavior: "add" | "clear" | undefined;
  max: number;
  dir: Direction;
  id: string;
  inputId: string;
  labelId: string;
}

const [TagsInputProvider, useTagsInput] =
  createContext<TagsInputContextValue<InputValue>>(ROOT_NAME);

interface TagsInputRootProps<T = InputValue>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange" | "onInvalid" | "children"
  > {
  /** Controlled array of tag values. */
  value?: T[];

  /** Initial array of tag values when uncontrolled. */
  defaultValue?: T[];

  /** Callback function to handle changes in the tag values. */
  onValueChange?: (value: T[]) => void;

  /** Callback function to validate tags before they're added. */
  onValidate?: (value: T) => boolean;

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
   * Disables the entire tags input.
   * @default false
   */
  disabled?: boolean;

  /**
   * Allow editing of existing tags
   * @default false
   */
  editable?: boolean;

  /**
   * Enable wrapping focus from last to first tag and vice versa.
   * @default false
   */
  loop?: boolean;

  /**
   * Behavior when the input loses focus.
   * - "add": Add the current input value as a new tag.
   * - "clear": Reset the input field, removing its value.
   * By default, the input value will stay in the input field.
   * Can be overridden by the preventDefault() call in the input's onBlur handler.
   */
  blurBehavior?: "add" | "clear";

  /**
   * Character used to split pasted text into multiple tags.
   * @default ","
   */
  delimiter?: string;

  /**
   * Maximum number of tags allowed.
   * @default Number.POSITIVE_INFINITY
   */
  max?: number;

  /**
   * Whether the field is required in a form context.
   * @default false
   */
  required?: boolean;

  /**
   * Whether the tags input is read-only.
   * @default false
   */
  readOnly?: boolean;

  /**
   * The content of the tags input.
   *
   * Can be a function that receives the current value as an argument,
   * or a React node.
   * @default undefined
   */
  children?:
    | ((context: { value: InputValue[] }) => React.ReactNode)
    | React.ReactNode;

  /**
   * The reading direction of the tags input.
   * @default "ltr"
   */
  dir?: Direction;

  /** Name of the form field when used in a form. */
  name?: string;

  /** Unique identifier for the tags input. */
  id?: string;
}

const TagsInputRoot = React.forwardRef<
  CollectionElement,
  TagsInputRootProps<InputValue>
>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    onValidate,
    onInvalid,
    displayValue = (value: InputValue) => value.toString(),
    addOnPaste = false,
    addOnTab = false,
    disabled = false,
    editable = false,
    loop = false,
    blurBehavior,
    delimiter = ",",
    max = Number.POSITIVE_INFINITY,
    required = false,
    name,
    children,
    dir: dirProp,
    id: idProp,
    ...rootProps
  } = props;

  const [value = [], setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [highlightedIndex, setHighlightedIndex] = React.useState<number | null>(
    null,
  );
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [isInvalidInput, setIsInvalidInput] = React.useState(false);
  const collectionRef = React.useRef<CollectionElement>(null);
  const inputRef = React.useRef<InputElement>(null);

  const id = useId();
  const inputId = useId();
  const labelId = useId();

  const dir = useDirection(dirProp);
  const { getEnabledItems } = useItemCollection<CollectionElement>({
    ref: collectionRef,
  });
  const { isFormControl, onTriggerChange } =
    useFormControl<CollectionElement>();
  const composedRef = useComposedRefs(ref, collectionRef, (node) =>
    onTriggerChange(node),
  );

  const onItemAdd = React.useCallback(
    (textValue: string, options?: { viaPaste?: boolean }) => {
      if (addOnPaste && options?.viaPaste) {
        const splitValues = textValue
          .split(delimiter)
          .map((v) => v.trim())
          .filter(Boolean);

        if (value.length + splitValues.length > max && max > 0) {
          onInvalid?.(textValue);
          return false;
        }

        let newValues: InputValue[] = [];
        for (const v of splitValues) {
          if (value.includes(v)) {
            onInvalid?.(v);
          }
        }
        newValues = [...new Set(splitValues.filter((v) => !value.includes(v)))];

        const validValues = newValues.filter(
          (v) => !onValidate || onValidate(v),
        );

        if (validValues.length === 0) return false;

        setValue([...value, ...validValues]);
        return true;
      }

      if (value.length >= max && max > 0) {
        onInvalid?.(textValue);
        return false;
      }

      const trimmedValue = textValue.trim();

      if (onValidate && !onValidate(trimmedValue)) {
        setIsInvalidInput(true);
        onInvalid?.(trimmedValue);
        return false;
      }

      const exists = value.some((v) => {
        const valueToCompare = v;
        return valueToCompare === trimmedValue;
      });

      if (exists) {
        setIsInvalidInput(true);
        onInvalid?.(trimmedValue);
        return true;
      }

      const newValue = trimmedValue;
      const newValues = [...value, newValue];
      setValue(newValues);
      setHighlightedIndex(null);
      setEditingIndex(null);
      setIsInvalidInput(false);
      return true;
    },
    [value, max, addOnPaste, delimiter, setValue, onInvalid, onValidate],
  );

  const onItemUpdate = React.useCallback(
    (index: number, newTextValue: string) => {
      if (index !== -1) {
        const trimmedValue = newTextValue.trim();

        const exists = value.some((v, i) => {
          if (i === index) return false;
          const valueToCompare = v;
          return valueToCompare === trimmedValue;
        });

        if (exists) {
          setIsInvalidInput(true);
          onInvalid?.(trimmedValue);
          return;
        }

        if (onValidate && !onValidate(trimmedValue)) {
          setIsInvalidInput(true);
          onInvalid?.(trimmedValue);
          return;
        }

        const updatedValue = displayValue(trimmedValue);
        const newValues = [...value];
        newValues[index] = updatedValue;

        setValue(newValues);
        setHighlightedIndex(index);
        setEditingIndex(null);
        setIsInvalidInput(false);

        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [value, setValue, displayValue, onInvalid, onValidate],
  );

  const onItemRemove = React.useCallback(
    (index: number) => {
      if (index !== -1) {
        const newValues = [...value];
        newValues.splice(index, 1);
        setValue(newValues);
        setHighlightedIndex(null);
        setEditingIndex(null);
        inputRef.current?.focus();
      }
    },
    [value, setValue],
  );

  const onItemLeave = React.useCallback(() => {
    setHighlightedIndex(null);
    setEditingIndex(null);
    inputRef.current?.focus();
  }, []);

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
        setHighlightedIndex(null);
        setEditingIndex(null);
        return;
      }

      function findNextEnabledIndex(
        currentIndex: number | null,
        direction: "next" | "prev",
      ): number | null {
        const collectionElement = collectionRef.current;
        if (!collectionElement) return null;

        const enabledItems = getEnabledItems();
        const enabledIndices = enabledItems.map((_, index) => index);

        if (enabledIndices.length === 0) return null;

        if (currentIndex === null) {
          return direction === "prev"
            ? (enabledIndices[enabledIndices.length - 1] ?? null)
            : (enabledIndices[0] ?? null);
        }

        const currentEnabledIndex = enabledIndices.indexOf(currentIndex);
        if (direction === "next") {
          return currentEnabledIndex >= enabledIndices.length - 1
            ? loop
              ? (enabledIndices[0] ?? null)
              : null
            : (enabledIndices[currentEnabledIndex + 1] ?? null);
        }

        return currentEnabledIndex <= 0
          ? loop
            ? (enabledIndices[enabledIndices.length - 1] ?? null)
            : null
          : (enabledIndices[currentEnabledIndex - 1] ?? null);
      }

      switch (event.key) {
        case "Delete":
        case "Backspace": {
          if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

          if (highlightedIndex !== null) {
            const newIndex = findNextEnabledIndex(highlightedIndex, "prev");
            onItemRemove(highlightedIndex);
            setHighlightedIndex(newIndex);
            event.preventDefault();
          } else if (event.key === "Backspace" && value.length > 0) {
            const lastIndex = findNextEnabledIndex(null, "prev");
            setHighlightedIndex(lastIndex);
            event.preventDefault();
          }
          break;
        }
        case "Enter": {
          if (highlightedIndex !== null && editable && !disabled) {
            setEditingIndex(highlightedIndex);
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
            highlightedIndex === null &&
            value.length > 0
          ) {
            const lastIndex = findNextEnabledIndex(null, "prev");
            setHighlightedIndex(lastIndex);
            event.preventDefault();
          } else if (highlightedIndex !== null) {
            const nextIndex = findNextEnabledIndex(
              highlightedIndex,
              isArrowLeft ? "prev" : "next",
            );
            if (nextIndex !== null) {
              setHighlightedIndex(nextIndex);
              event.preventDefault();
            } else if (isArrowRight) {
              setHighlightedIndex(null);
              requestAnimationFrame(() => target.setSelectionRange(0, 0));
            }
          }
          break;
        }
        case "Home": {
          if (highlightedIndex !== null) {
            const firstIndex = findNextEnabledIndex(null, "next");
            setHighlightedIndex(firstIndex);
            event.preventDefault();
          }
          break;
        }
        case "End": {
          if (highlightedIndex !== null) {
            const lastIndex = findNextEnabledIndex(null, "prev");
            setHighlightedIndex(lastIndex);
            event.preventDefault();
          }
          break;
        }
        case "Escape": {
          setHighlightedIndex(null);
          setEditingIndex(null);
          requestAnimationFrame(() => target.setSelectionRange(0, 0));
          break;
        }
      }
    },
    [
      highlightedIndex,
      value,
      onItemRemove,
      dir,
      editable,
      disabled,
      loop,
      getEnabledItems,
    ],
  );

  const getIsClickedInEmptyRoot = React.useCallback((target: HTMLElement) => {
    return (
      collectionRef.current?.contains(target) &&
      !target.hasAttribute(DATA_ITEM_ATTR) &&
      target.tagName !== "INPUT"
    );
  }, []);

  return (
    <TagsInputProvider
      value={value}
      onValueChange={setValue}
      onItemAdd={onItemAdd}
      onItemRemove={onItemRemove}
      onItemUpdate={onItemUpdate}
      onInputKeydown={onInputKeydown}
      highlightedIndex={highlightedIndex}
      setHighlightedIndex={setHighlightedIndex}
      editingIndex={editingIndex}
      setEditingIndex={setEditingIndex}
      displayValue={displayValue}
      onItemLeave={onItemLeave}
      inputRef={inputRef}
      isInvalidInput={isInvalidInput}
      addOnPaste={addOnPaste}
      addOnTab={addOnTab}
      disabled={disabled}
      editable={editable}
      loop={loop}
      blurBehavior={blurBehavior}
      delimiter={delimiter}
      max={max}
      dir={dir}
      id={id}
      inputId={inputId}
      labelId={labelId}
    >
      <Primitive.div
        id={id}
        data-invalid={isInvalidInput ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        dir={dir}
        {...rootProps}
        ref={composedRef}
        onClick={composeEventHandlers(rootProps.onClick, (event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;

          if (
            getIsClickedInEmptyRoot(target) &&
            document.activeElement !== inputRef.current
          ) {
            event.currentTarget.focus();
            inputRef.current?.focus();
          }
        })}
        onMouseDown={composeEventHandlers(rootProps.onMouseDown, (event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;

          if (getIsClickedInEmptyRoot(target)) {
            // prevent root from stealing focus from the input
            event.preventDefault();
          }
        })}
        onBlur={composeEventHandlers(rootProps.onBlur, (event) => {
          if (
            event.relatedTarget !== inputRef.current &&
            !collectionRef.current?.contains(event.relatedTarget)
          ) {
            requestAnimationFrame(() => setHighlightedIndex(null));
          }
        })}
      >
        {typeof children === "function" ? <>{children({ value })}</> : children}
        {isFormControl && name && (
          <BubbleInput
            type="hidden"
            control={collectionRef.current}
            name={name}
            value={value}
            disabled={disabled}
            required={required}
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
