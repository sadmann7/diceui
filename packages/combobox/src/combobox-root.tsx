import {
  BubbleInput,
  type Direction,
  createContext,
  useCollection,
  useComposedRefs,
  useControllableState,
  useDirection,
  useFormControl,
  useId,
} from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const ROOT_NAME = "ComboboxRoot";

interface ComboboxContextValue {
  value: string | string[];
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => Promise<void>;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  isUserInputted: boolean;
  filteredOptions: string[];
  selectedValue: string | undefined;
  selectedValueChange: (value: string | undefined) => void;
  onFilter?: (options: string[], term: string) => string[];
  displayValue: (value: string) => string;
  onInputKeyDown: (direction: "up" | "down" | "home" | "end") => Promise<void>;
  collectionRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  selectedItem: HTMLElement | null;
  multiple: boolean;
  disabled: boolean;
  loop: boolean;
  allowCustomValues: boolean;
  dir: Direction;
  id: string;
  labelId: string;
  contentId: string;
}

const [ComboboxProvider, useComboboxContext] =
  createContext<ComboboxContextValue>(ROOT_NAME);

interface ComboboxRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange"
  > {
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  inputValue?: string;
  onInputValueChange?: (value: string) => void;
  selectedValue?: string;
  onSelectedValueChange?: (value: string | undefined) => void;
  onFilter?: (options: string[], inputValue: string) => string[];
  displayValue?: (value: string) => string;
  multiple?: boolean;
  disabled?: boolean;
  loop?: boolean;
  allowCustomValues?: boolean;
  dir?: Direction;
  name?: string;
}

const ComboboxRoot = React.forwardRef<HTMLDivElement, ComboboxRootProps>(
  (props, forwardedRef) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange: onValueChangeProp,
      open: openProp,
      defaultOpen = false,
      onOpenChange: onOpenChangeProp,
      inputValue: inputValueProp,
      onInputValueChange,
      selectedValue: selectedValueProp,
      onSelectedValueChange,
      displayValue = (value: string) => value,
      onFilter,
      multiple = false,
      disabled = false,
      loop = false,
      allowCustomValues = false,
      dir: dirProp,
      name,
      children,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const id = useId();
    const labelId = `${id}label`;
    const contentId = `${id}content`;

    const dir = useDirection(dirProp);
    const { getEnabledItems } = useCollection({ ref: collectionRef });
    const { isFormControl, onTriggerChange } = useFormControl();
    const composedRef = useComposedRefs(forwardedRef, collectionRef, (node) =>
      onTriggerChange(node),
    );

    const [options, setOptions] = React.useState<string[]>([]);

    const [value = multiple ? [] : "", setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChangeProp,
    });

    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChangeProp,
    });

    const [inputValue = "", setInputValue] = useControllableState({
      prop: inputValueProp,
      onChange: onInputValueChange,
    });

    const [selectedValue, setSelectedValue] = useControllableState({
      prop: selectedValueProp,
      defaultProp: undefined,
      onChange: onSelectedValueChange,
    });

    const [isUserInputted, setIsUserInputted] = React.useState(false);

    const filteredOptions = React.useMemo(() => {
      if (!isUserInputted) return options;

      if (onFilter) return onFilter(options, inputValue);

      return options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      );
    }, [options, inputValue, isUserInputted, onFilter]);

    const selectedIndex = filteredOptions.findIndex(
      (option) => option === selectedValueProp,
    );

    const selectedItem = React.useMemo(() => {
      if (selectedIndex === -1) return null;
      return getEnabledItems()[selectedIndex] ?? null;
    }, [selectedIndex, getEnabledItems]);

    const onOpenChange = React.useCallback(
      async (open: boolean) => {
        setOpen(open);

        if (open) {
          // If there's a value, set it as selected when opening
          if (value) {
            if (multiple && Array.isArray(value)) {
              // For multiple selection, find first checked item
              const checkedOption = filteredOptions.find((option) =>
                value.includes(option),
              );
              setSelectedValue(checkedOption);
            } else {
              // For single selection, use current value
              setSelectedValue(value as string);
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 0));

          // Focus input after state updates
          if (inputRef.current) {
            inputRef.current.focus();
          }

          // Scroll selected item into view if exists
          if (selectedItem) {
            selectedItem.scrollIntoView({ block: "nearest" });
          }
        } else {
          // Reset user input state when closing
          setIsUserInputted(false);

          // Reset search term if configured (could be added as prop)
          if (allowCustomValues) {
            onResetInputValue();
          }
        }
      },
      [
        value,
        multiple,
        filteredOptions,
        setSelectedValue,
        selectedItem,
        setOpen,
        allowCustomValues,
      ],
    );

    const onValueChange = React.useCallback(
      (newValue: string) => {
        if (multiple) {
          const currentValues = Array.isArray(value) ? value : [];
          const updatedValues = currentValues.includes(newValue)
            ? currentValues.filter((v) => v !== newValue)
            : [...currentValues, newValue];
          setValue(updatedValues);
        } else {
          setValue(newValue);
          setOpen(false);
        }
      },
      [multiple, setValue, setOpen, value],
    );

    const onResetInputValue = React.useCallback(() => {
      if (!multiple && typeof value === "string") {
        setInputValue(displayValue(value));
      } else {
        setInputValue("");
      }
    }, [multiple, value, displayValue, setInputValue]);

    const onInputKeyDown = React.useCallback(
      async (direction: "up" | "down" | "home" | "end") => {
        const currentIndex = selectedIndex;
        const itemCount = filteredOptions.length;

        if (itemCount === 0) return;

        let nextIndex: number;

        // Handle edge cases first
        if (currentIndex === -1 || direction === "home") {
          nextIndex = 0;
        } else if (direction === "end") {
          nextIndex = itemCount - 1;
        } else if (direction === "up") {
          // Don't navigate up if already at first item
          if (currentIndex === 0) return;
          nextIndex = currentIndex - 1;
        } else {
          // Don't navigate down if already at last item
          if (currentIndex === itemCount - 1) return;
          nextIndex = currentIndex + 1;
        }

        // Update selected value
        const nextValue = filteredOptions[nextIndex];
        setSelectedValue(nextValue);

        // Wait for DOM update
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Scroll selected item into view
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: "nearest" });
          selectedItem.focus();
        }

        // Return focus to input while preventing scroll
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      },
      [selectedIndex, filteredOptions, selectedItem, setSelectedValue],
    );

    return (
      <ComboboxProvider
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={onOpenChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        isUserInputted={isUserInputted}
        filteredOptions={filteredOptions}
        selectedValue={selectedValue}
        selectedValueChange={setSelectedValue}
        displayValue={displayValue}
        onFilter={onFilter}
        onInputKeyDown={onInputKeyDown}
        collectionRef={collectionRef}
        contentRef={contentRef}
        inputRef={inputRef}
        selectedItem={selectedItem}
        multiple={multiple}
        disabled={disabled}
        loop={loop}
        allowCustomValues={allowCustomValues}
        dir={dir}
        id={id}
        labelId={labelId}
        contentId={contentId}
      >
        <Primitive.div {...rootProps} ref={composedRef}>
          {children}
          {isFormControl && name && (
            <BubbleInput
              type="hidden"
              control={collectionRef.current}
              name={name}
              value={value}
              disabled={disabled}
            />
          )}
        </Primitive.div>
      </ComboboxProvider>
    );
  },
);

ComboboxRoot.displayName = ROOT_NAME;

const Root = ComboboxRoot;

export { Root, ComboboxRoot, useComboboxContext };

export type { ComboboxRootProps };
