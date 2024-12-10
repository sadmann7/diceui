import {
  createContext,
  useComposedRefs,
  useControllableState,
  useFormControl,
  useId,
} from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { BubbleInput } from "./bubble-input";

const ROOT_NAME = "CheckboxGroupRoot";

interface CheckboxGroupContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  onItemCheckedChange: (value: string, checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  id: string;
  labelId: string;
}

const [CheckboxGroupProvider, useCheckboxGroup] =
  createContext<CheckboxGroupContextValue>(ROOT_NAME);

interface CheckboxGroupRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onChange"
  > {
  /** Controlled values */
  value?: string[];
  /** Initial values when uncontrolled */
  defaultValue?: string[];
  /** Callback when values change */
  onValueChange?: (value: string[]) => void;
  /** Whether the checkbox group is disabled */
  disabled?: boolean;
  /** Whether the checkbox group is required */
  required?: boolean;
  /** Name for form submission */
  name?: string;
}

const CheckboxGroupRoot = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupRootProps
>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    disabled = false,
    required = false,
    name,
    children,
    ...rootProps
  } = props;

  const [value = [], setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const id = useId();
  const labelId = `${id}label`;
  const collectionRef = React.useRef<HTMLDivElement>(null);

  const { isFormControl, onTriggerChange } = useFormControl();
  const composedRefs = useComposedRefs(ref, collectionRef, (node) =>
    onTriggerChange(node),
  );

  const onItemCheckedChange = React.useCallback(
    (value: string, checked: boolean) => {
      setValue((prev = []) =>
        checked ? [...prev, value] : prev.filter((v) => v !== value),
      );
    },
    [setValue],
  );

  return (
    <CheckboxGroupProvider
      value={value}
      onValueChange={setValue}
      onItemCheckedChange={onItemCheckedChange}
      disabled={disabled}
      required={required}
      id={id}
      labelId={labelId}
    >
      <Primitive.div
        ref={composedRefs}
        role="group"
        aria-labelledby={labelId}
        data-disabled={disabled ? "" : undefined}
        {...rootProps}
      >
        {children}
        {isFormControl && name && (
          <BubbleInput
            control={collectionRef.current}
            name={name}
            value={value}
            checked={value.length > 0}
            defaultChecked={value.length > 0}
            required={required}
            disabled={disabled}
            style={{ transform: "translateY(-100%)" }}
          />
        )}
      </Primitive.div>
    </CheckboxGroupProvider>
  );
});

CheckboxGroupRoot.displayName = ROOT_NAME;

const Root = CheckboxGroupRoot;

export {
  CheckboxGroupRoot,
  Root,
  useCheckboxGroup,
  type CheckboxGroupRootProps,
};
