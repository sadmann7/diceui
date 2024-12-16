import {
  BubbleInput,
  createContext,
  useCollection,
  useComposedRefs,
  useControllableState,
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
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isUserInputted: boolean;
  filteredOptions: string[];
  selectedValue: string | undefined;
  selectedValueChange: (value: string | undefined) => void;
  filterFunction?: (options: string[], term: string) => string[];
  displayValue: (value: string) => string;
  collectionRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  multiple: boolean;
  disabled: boolean;
  loop: boolean;
  resetSearchTermOnBlur: boolean;
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
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  selectedValue?: string;
  onSelectedValueChange?: (value: string | undefined) => void;
  filterFunction?: (options: string[], term: string) => string[];
  displayValue?: (value: string) => string;
  multiple?: boolean;
  disabled?: boolean;
  loop?: boolean;
  name?: string;
  resetSearchTermOnBlur?: boolean;
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
      searchTerm: searchTermProp,
      onSearchTermChange,
      selectedValue: selectedValueProp,
      onSelectedValueChange,
      displayValue = (value: string) => value,
      filterFunction,
      multiple = false,
      disabled = false,
      loop = false,
      resetSearchTermOnBlur = true,
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

    const { getItems } = useCollection({ ref: collectionRef });

    const { isFormControl, onTriggerChange } = useFormControl<HTMLDivElement>();

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

    const [searchTerm = "", setSearchTerm] = useControllableState({
      prop: searchTermProp,
      defaultProp: "",
      onChange: onSearchTermChange,
    });

    const [selectedValue, setSelectedValue] = useControllableState({
      prop: selectedValueProp,
      defaultProp: undefined,
      onChange: onSelectedValueChange,
    });

    const [isUserInputted, setIsUserInputted] = React.useState(false);

    const filteredOptions = React.useMemo(() => {
      if (!isUserInputted) return options;

      if (filterFunction) return filterFunction(options, searchTerm);

      return options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }, [options, searchTerm, isUserInputted, filterFunction]);

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
        setSearchTerm(displayValue(value));
      } else {
        setSearchTerm("");
      }
    }, [multiple, value, displayValue, setSearchTerm]);

    React.useEffect(() => {
      if (!open && resetSearchTermOnBlur) {
        resetSearchTerm();
      }
    }, [open, resetSearchTermOnBlur, resetSearchTerm]);

    return (
      <ComboboxProvider
        value={value}
        onValueChange={onValueChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenChange={setOpen}
        isUserInputted={isUserInputted}
        filteredOptions={filteredOptions}
        selectedValue={selectedValue}
        selectedValueChange={setSelectedValue}
        displayValue={displayValue}
        filterFunction={filterFunction}
        multiple={multiple}
        disabled={disabled}
        loop={loop}
        open={open}
        resetSearchTermOnBlur={resetSearchTermOnBlur}
        collectionRef={collectionRef}
        contentRef={contentRef}
        inputRef={inputRef}
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
              value={JSON.stringify(value)}
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
