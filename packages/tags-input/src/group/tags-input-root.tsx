import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useControllableState } from "../hooks/use-controllable-state";
import { useDirection } from "../hooks/use-direction";

export type AcceptableInputValue = string | Record<string, unknown>;

interface TagsInputRootContextValue {
  value: AcceptableInputValue[];
  onValueChange: (value: AcceptableInputValue[]) => void;
  onAddValue: (payload: string) => boolean;
  onRemoveValue: (index: number) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  selectedIndex: number;
  isInvalidInput: boolean;
  addOnPaste: boolean;
  addOnTab: boolean;
  addOnBlur: boolean;
  disabled: boolean;
  delimiter: string;
  dir: "ltr" | "rtl";
  max: number;
  id?: string;
  displayValue: (value: AcceptableInputValue) => string;
  inputRef: React.RefObject<HTMLInputElement>;
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
  disabled?: boolean;
  delimiter?: string;
  dir?: "ltr" | "rtl";
  max?: number;
  required?: boolean;
  name?: string;
  id?: string;
  convertValue?: (value: string) => AcceptableInputValue;
  displayValue?: (value: AcceptableInputValue) => string;
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
      disabled = false,
      delimiter = ",",
      dir: dirProp,
      max = 0,
      required = false,
      name,
      id,
      convertValue,
      displayValue = (value: AcceptableInputValue) => value.toString(),
      children,
      className,
      ...tagsInputProps
    } = props;

    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
    const [isInvalidInput, setIsInvalidInput] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dir = useDirection(dirProp);

    const onAddValue = React.useCallback(
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

        onInvalid?.(newValue);
        return false;
      },
      [value, max, duplicate, convertValue, setValue, onInvalid, defaultValue],
    );

    const onRemoveValue = React.useCallback(
      (index: number) => {
        if (index !== -1) {
          const newValues = [...value];
          newValues.splice(index, 1);
          setValue(newValues);
          setSelectedIndex(-1);
        }
      },
      [value, setValue],
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

        switch (event.key) {
          case "Delete":
          case "Backspace": {
            if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

            if (selectedIndex !== -1) {
              const newIndex =
                selectedIndex === value.length - 1
                  ? selectedIndex - 1
                  : selectedIndex;
              onRemoveValue(selectedIndex);
              setSelectedIndex(newIndex);
              event.preventDefault();
            } else if (event.key === "Backspace" && value.length > 0) {
              setSelectedIndex(value.length - 1);
              event.preventDefault();
            }
            break;
          }
          case "ArrowLeft":
          case "ArrowRight": {
            if (
              target.selectionStart === 0 &&
              isArrowLeft &&
              selectedIndex === -1 &&
              value.length > 0
            ) {
              setSelectedIndex(value.length - 1);
              event.preventDefault();
            } else if (selectedIndex !== -1) {
              if (isArrowLeft && selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
                event.preventDefault();
              } else if (isArrowRight && selectedIndex < value.length - 1) {
                setSelectedIndex(selectedIndex + 1);
                event.preventDefault();
              } else if (isArrowRight && selectedIndex === value.length - 1) {
                setSelectedIndex(-1);
                target.setSelectionRange(0, 0);
                event.preventDefault();
              }
            }
            break;
          }
          case "Home": {
            if (selectedIndex !== -1) {
              setSelectedIndex(0);
              event.preventDefault();
            }
            break;
          }
          case "End": {
            if (selectedIndex !== -1) {
              setSelectedIndex(value.length - 1);
              event.preventDefault();
            }
            break;
          }
          case "Escape": {
            setSelectedIndex(-1);
            target.setSelectionRange(0, 0);
            break;
          }
        }
      },
      [selectedIndex, value.length, onRemoveValue, dir],
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
          setSelectedIndex(-1);
        }
      };

      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }, []);

    const contextValue: TagsInputRootContextValue = {
      value,
      onValueChange: setValue,
      onAddValue,
      onRemoveValue,
      onInputKeydown,
      selectedIndex,
      isInvalidInput,
      addOnPaste,
      addOnTab,
      addOnBlur,
      disabled,
      delimiter,
      dir,
      max,
      id,
      displayValue,
      inputRef,
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
              setSelectedIndex(-1);
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

export type { TagsInputRootProps };
