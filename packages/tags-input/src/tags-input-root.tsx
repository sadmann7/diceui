import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useControllableState } from "./hooks/use-controllable-state";
import { useDirection } from "./hooks/use-direction";

type InputValue = string;

interface TagsInputRootContextValue {
  value: InputValue[];
  onValueChange: (value: InputValue[]) => void;
  onItemCreate: (textValue: string) => boolean;
  onItemUpdate: (oldValue: InputValue, newValue: InputValue) => void;
  onItemDelete: (index: number) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  displayValue: (value: InputValue) => string;
  editingValue: InputValue | null;
  setEditingValue: (value: InputValue | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  id: string | undefined;
  delimiter: string | undefined;
  dir: "ltr" | "rtl";
  focusedValue: InputValue | null;
  max: number;
  isInvalidInput: boolean;
  disabled: boolean;
  createOnPaste: boolean;
  createOnTab: boolean;
  createOnBlur: boolean;
  editable: boolean;
}

const TagsInputContext = React.createContext<
  TagsInputRootContextValue | undefined
>(undefined);

export function useTagsInput() {
  const context = React.useContext(TagsInputContext);
  if (!context) {
    throw new Error("useTagsInput must be used within a TagsInput provider");
  }
  return context;
}

interface TagsInputRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange" | "onInvalid"
  > {
  value?: InputValue[];
  defaultValue?: InputValue[];
  onValueChange?: (value: InputValue[]) => void;
  onInvalid?: (value: InputValue) => void;
  convertValue?: (value: string) => InputValue;
  displayValue?: (value: InputValue) => string;
  id?: string;
  delimiter?: string;
  dir?: "ltr" | "rtl";
  max?: number;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  loop?: boolean;
  duplicate?: boolean;
  editable?: boolean;
  createOnPaste?: boolean;
  createOnTab?: boolean;
  createOnBlur?: boolean;
}

const TagsInputRoot = React.forwardRef<HTMLDivElement, TagsInputRootProps>(
  (props, ref) => {
    const {
      value: valueProp,
      defaultValue = [],
      onValueChange,
      onInvalid,
      convertValue,
      displayValue = (value: InputValue) => value.toString(),
      id,
      delimiter = ",",
      dir: dirProp,
      max = 0,
      name,
      required = false,
      disabled = false,
      loop = false,
      duplicate = false,
      editable = false,
      createOnPaste = false,
      createOnTab = false,
      createOnBlur = false,
      children,
      ...tagsInputProps
    } = props;

    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [focusedValue, setFocusedValue] = React.useState<InputValue | null>(
      null,
    );
    const [isInvalidInput, setIsInvalidInput] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dir = useDirection(dirProp);
    const [editingValue, setEditingValue] = React.useState<InputValue | null>(
      null,
    );

    const onItemCreate = React.useCallback(
      (textValue: string) => {
        if (createOnPaste) {
          const splitValue = textValue
            .split(delimiter)
            .map((v) => v.trim())
            .filter(Boolean);

          if (value.length + splitValue.length > max && max > 0) {
            onInvalid?.(textValue);
            return false;
          }

          let newValues;
          if (duplicate) {
            newValues = splitValue; 
          } else {
            newValues = [...new Set(splitValue.filter(v => !value.includes(v)))];
          }

          setValue([...value, ...newValues]);

          return true;
        }

        const valueIsObject = value.length > 0 && typeof value[0] === "object";
        const defaultValueIsObject =
          defaultValue.length > 0 && typeof defaultValue[0] === "object";

        if (
          (valueIsObject || defaultValueIsObject) &&
          typeof convertValue !== "function"
        ) {
          throw new Error(
            "You must provide a convertValue function when using objects as values.",
          );
        }

        const newValue = convertValue ? convertValue(textValue) : textValue;

        if (value.length >= max && max > 0) {
          onInvalid?.(newValue);
          return false;
        }

        if (duplicate) {
          const newValues = [...value, newValue];
          setValue(newValues);
          return true;
        }

        const exists = value.includes(newValue);
        if (!exists) {
          const newValues = [...value, newValue];
          setValue(newValues);
          return true;
        }

        setIsInvalidInput(true);

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        onInvalid?.(newValue);

        return false;
      },
      [
        value,
        max,
        duplicate,
        convertValue,
        setValue,
        onInvalid,
        defaultValue,
        createOnPaste,
        delimiter,
      ],
    );

    const onItemDelete = React.useCallback(
      (index: number) => {
        if (index !== -1) {
          const newValues = [...value];
          newValues.splice(index, 1);
          setValue(newValues);
          setFocusedValue(null);
        }
      },
      [value, setValue],
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

        switch (event.key) {
          case "Delete":
          case "Backspace": {
            if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

            if (focusedValue !== null) {
              const currentIndex = value.indexOf(focusedValue);
              const newValue =
                currentIndex === value.length - 1
                  ? value[currentIndex - 1]
                  : value[currentIndex + 1];

              onItemDelete(currentIndex);
              setFocusedValue(newValue ?? null);
              event.preventDefault();
            } else if (event.key === "Backspace" && value.length > 0) {
              setFocusedValue(value[value.length - 1] ?? null);
              event.preventDefault();
            }
            break;
          }
          case "ArrowLeft":
          case "ArrowRight": {
            if (
              target.selectionStart === 0 &&
              isArrowLeft &&
              focusedValue === null &&
              value.length > 0
            ) {
              setFocusedValue(value[value.length - 1] ?? null);
              event.preventDefault();
            } else if (focusedValue !== null) {
              const currentIndex = value.indexOf(focusedValue);
              if (isArrowLeft) {
                if (currentIndex > 0) {
                  setFocusedValue(value[currentIndex - 1] ?? null);
                } else if (loop) {
                  setFocusedValue(value[value.length - 1] ?? null);
                }
                event.preventDefault();
              } else if (isArrowRight) {
                if (currentIndex < value.length - 1) {
                  setFocusedValue(value[currentIndex + 1] ?? null);
                } else if (loop && currentIndex === value.length - 1) {
                  setFocusedValue(value[0] ?? null);
                } else if (!loop && currentIndex === value.length - 1) {
                  setFocusedValue(null);
                  target.setSelectionRange(0, 0);
                }
                event.preventDefault();
              }
            }
            break;
          }
          case "Home": {
            if (focusedValue !== null && value.length > 0) {
              setFocusedValue(value[0] ?? null);
              event.preventDefault();
            }
            break;
          }
          case "End": {
            if (focusedValue !== null && value.length > 0) {
              setFocusedValue(value[value.length - 1] ?? null);
              event.preventDefault();
            }
            break;
          }
          case "Escape": {
            setFocusedValue(null);
            target.setSelectionRange(0, 0);
            break;
          }
          case "Enter": {
            if (focusedValue !== null && editable) {
              setEditingValue(focusedValue);
              event.preventDefault();
            }
            break;
          }
        }
      },
      [focusedValue, value, onItemDelete, dir, editable, loop],
    );

    // Handle clicks outside of tags to focus input
    React.useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          containerRef.current?.contains(target) &&
          !target.hasAttribute("data-tag-item") &&
          target.tagName !== "INPUT"
        ) {
          inputRef.current?.focus();
          setFocusedValue(null);
        }
      };

      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }, []);

    const onItemUpdate = React.useCallback(
      (oldValue: InputValue, newValue: InputValue) => {
        if (oldValue === newValue || !newValue.toString().trim()) return;

        const index = value.indexOf(oldValue);
        if (index === -1) return;

        const newValues = [...value];
        newValues[index] = newValue;
        setValue(newValues);
        setEditingValue(null);
      },
      [value, setValue],
    );

    const contextValue: TagsInputRootContextValue = {
      value,
      onValueChange: setValue,
      onItemCreate,
      onItemDelete,
      onItemUpdate,
      onInputKeydown,
      focusedValue,
      isInvalidInput,
      createOnPaste,
      createOnTab,
      createOnBlur,
      editable,
      disabled,
      delimiter,
      dir,
      max,
      id,
      displayValue,
      inputRef,
      editingValue,
      setEditingValue: (value) => {
        if (editable) {
          setEditingValue(value);
        }
      },
    };

    return (
      <TagsInputContext.Provider value={contextValue}>
        <Primitive.div
          ref={ref}
          dir={dir}
          data-invalid={isInvalidInput ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
          onClick={(e) => {
            if (e.target === containerRef.current) {
              inputRef.current?.focus();
              setFocusedValue(null);
            }
          }}
          {...tagsInputProps}
        >
          {children}
          {name && (
            <Primitive.input
              type="hidden"
              name={name}
              value={JSON.stringify(value)}
              required={required}
              disabled={disabled}
            />
          )}
        </Primitive.div>
      </TagsInputContext.Provider>
    );
  },
);

TagsInputRoot.displayName = "TagsInputRoot";

const Root = TagsInputRoot;

export { Root, TagsInputRoot };

export type { InputValue, TagsInputRootProps };
