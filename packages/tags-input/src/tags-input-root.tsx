import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useControllableState } from "./hooks/use-controllable-state";
import { useDirection } from "./hooks/use-direction";

type AcceptableInputValue = string;

interface TagsInputRootContextValue {
  value: AcceptableInputValue[];
  onValueChange: (value: AcceptableInputValue[]) => void;
  onValueAdd: (payload: string) => boolean;
  onValueRemove: (index: number) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  focusedValue: AcceptableInputValue | null;
  isInvalidInput: boolean;
  addOnPaste: boolean;
  addOnTab: boolean;
  addOnBlur: boolean;
  editable: boolean;
  disabled: boolean;
  delimiter: string;
  dir: "ltr" | "rtl";
  max: number;
  id?: string;
  displayValue: (value: AcceptableInputValue) => string;
  inputRef: React.RefObject<HTMLInputElement>;
  editingValue: AcceptableInputValue | null;
  setEditingValue: (value: AcceptableInputValue | null) => void;
  onValueEdit: (
    oldValue: AcceptableInputValue,
    newValue: AcceptableInputValue,
  ) => void;
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
  value?: AcceptableInputValue[];
  defaultValue?: AcceptableInputValue[];
  onValueChange?: (value: AcceptableInputValue[]) => void;
  onInvalid?: (value: AcceptableInputValue) => void;
  addOnPaste?: boolean;
  addOnTab?: boolean;
  addOnBlur?: boolean;
  duplicate?: boolean;
  editable?: boolean;
  disabled?: boolean;
  delimiter?: string;
  dir?: "ltr" | "rtl";
  max?: number;
  required?: boolean;
  name?: string;
  id?: string;
  convertValue?: (value: string) => AcceptableInputValue;
  displayValue?: (value: AcceptableInputValue) => string;
  loop?: boolean;
}

const TagsInputRoot = React.forwardRef<HTMLDivElement, TagsInputRootProps>(
  (props, ref) => {
    const {
      value: valueProp,
      defaultValue = [],
      onValueChange,
      onInvalid,
      addOnPaste = false,
      addOnTab = false,
      addOnBlur = false,
      duplicate = false,
      editable = false,
      disabled = false,
      delimiter = ",",
      dir: dirProp,
      max = 0,
      required = false,
      name,
      id,
      convertValue,
      displayValue = (value: AcceptableInputValue) => value.toString(),
      loop = false,
      children,
      className,
      ...tagsInputProps
    } = props;

    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [focusedValue, setFocusedValue] =
      React.useState<AcceptableInputValue | null>(null);
    const [isInvalidInput, setIsInvalidInput] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dir = useDirection(dirProp);
    const [editingValue, setEditingValue] =
      React.useState<AcceptableInputValue | null>(null);

    const onValueAdd = React.useCallback(
      (payload: string) => {
        const modelValueIsObject =
          value.length > 0 && typeof value[0] === "object";
        const defaultValueIsObject =
          defaultValue.length > 0 && typeof defaultValue[0] === "object";

        if (
          (modelValueIsObject || defaultValueIsObject) &&
          typeof convertValue !== "function"
        ) {
          throw new Error(
            "You must provide a convertValue function when using objects as values.",
          );
        }

        const newValue = convertValue ? convertValue(payload) : payload;

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
      [value, max, duplicate, convertValue, setValue, onInvalid, defaultValue],
    );

    const onValueRemove = React.useCallback(
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

              onValueRemove(currentIndex);
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
      [focusedValue, value, onValueRemove, dir, editable, loop],
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

    const onValueEdit = React.useCallback(
      (oldValue: AcceptableInputValue, newValue: AcceptableInputValue) => {
        if (oldValue === newValue || !newValue.trim()) return;

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
      onValueAdd,
      onValueRemove,
      onInputKeydown,
      focusedValue,
      isInvalidInput,
      addOnPaste,
      addOnTab,
      addOnBlur,
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
      onValueEdit,
    };

    return (
      <TagsInputContext.Provider value={contextValue}>
        <Primitive.div
          ref={ref}
          className={className}
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

export { TagsInputRoot, Root };

export type { TagsInputRootProps, AcceptableInputValue };
