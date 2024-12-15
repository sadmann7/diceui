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

interface ComboboxContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  id: string;
  labelId: string;
  contentId: string;
}

const ROOT_NAME = "Combobox";

const [ComboboxProvider, useComboboxContext] =
  createContext<ComboboxContextValue>(ROOT_NAME);

interface ComboboxRootProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
}

const ComboboxRoot = React.forwardRef<HTMLDivElement, ComboboxRootProps>(
  (props, forwardedRef) => {
    const {
      value: controlledValue,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      name,
      required,
      children,
      ...rootProps
    } = props;

    const id = useId();
    const labelId = `${id}label`;
    const contentId = `${id}content`;

    const collectionRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    const { getItems } = useCollection({ ref: collectionRef });
    const items = getItems();

    console.log({ items });

    const [value, setValue] = useControllableState({
      prop: controlledValue,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    const [selectedValue, setSelectedValue] = React.useState<string | null>(
      null,
    );

    const { isFormControl, onTriggerChange } = useFormControl();
    const composedRefs = useComposedRefs(forwardedRef, collectionRef, (node) =>
      onTriggerChange(node),
    );

    return (
      <ComboboxProvider
        value={value}
        onValueChange={setValue}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        inputRef={inputRef}
        contentRef={contentRef}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
        id={id}
        labelId={labelId}
        contentId={contentId}
      >
        <Primitive.div
          id={id}
          aria-labelledby={labelId}
          {...rootProps}
          ref={composedRefs}
        >
          {children}
          {isFormControl && name && (
            <BubbleInput
              type="hidden"
              name={name}
              control={collectionRef.current}
              value={value}
              required={required}
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
