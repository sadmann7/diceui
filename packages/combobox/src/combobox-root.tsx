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
  onOpenChange: (open: boolean) => void;
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
  blurBehavior: "reset" | "accept";
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
  blurBehavior?: "reset" | "accept";
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
      onOpenChange,
      inputValue: inputValueProp,
      onInputValueChange,
      selectedValue: selectedValueProp,
      onSelectedValueChange,
      displayValue = (value: string) => value,
      onFilter,
      multiple = false,
      disabled = false,
      loop = false,
      blurBehavior = "reset",
      dir: dirProp,
      name,
      children,
      ...rootProps
    } = props;

    const id = useId();
    const labelId = `${id}label`;
    const contentId = `${id}content`;
    const collectionRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
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
      onChange: onOpenChange,
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

    const resetSearchTerm = React.useCallback(() => {
      if (!multiple && typeof value === "string") {
        setInputValue(displayValue(value));
      } else {
        setInputValue("");
      }
    }, [multiple, value, displayValue, setInputValue]);

    const onInputKeyDown = React.useCallback(
      async (direction: "up" | "down" | "home" | "end") => {
        const currentIndex = selectedIndex;
        const itemsLength = filteredOptions.length;

        if (!itemsLength) return;

        let nextIndex: number;

        // Handle edge cases first
        if (currentIndex === -1 || direction === "home") {
          nextIndex = 0;
        } else if (direction === "end") {
          nextIndex = itemsLength - 1;
        } else if (direction === "up") {
          // Don't navigate up if already at first item
          if (currentIndex === 0) return;
          nextIndex = currentIndex - 1;
        } else {
          // Don't navigate down if already at last item
          if (currentIndex === itemsLength - 1) return;
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

    React.useEffect(() => {
      if (!open && blurBehavior === "reset") {
        resetSearchTerm();
      }
    }, [open, blurBehavior, resetSearchTerm]);

    return (
      <ComboboxProvider
        value={value}
        onValueChange={onValueChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        onOpenChange={setOpen}
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
        open={open}
        blurBehavior={blurBehavior}
        dir={dir}
        id={id}
        labelId={labelId}
        contentId={contentId}
      >
        <Primitive.div ref={composedRef} {...rootProps}>
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

export { ComboboxRoot, useComboboxContext };

export type { ComboboxRootProps };
