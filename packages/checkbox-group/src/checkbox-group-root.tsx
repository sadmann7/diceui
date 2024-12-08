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

type CheckboxValue = string;

export type CheckedState = boolean | "indeterminate";

const ROOT_NAME = "CheckboxGroupRoot";

interface CheckboxGroupContextValue {
  values: CheckboxValue[];
  onValuesChange: (values: CheckboxValue[]) => void;
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
  value?: CheckboxValue[];
  /** Initial values when uncontrolled */
  defaultValue?: CheckboxValue[];
  /** Callback when values change */
  onValueChange?: (value: CheckboxValue[]) => void;
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

  const [values = [], setValues] = useControllableState({
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

  return (
    <CheckboxGroupProvider
      values={values}
      onValuesChange={setValues}
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
            value={values}
            checked={values.length > 0}
            defaultChecked={values.length > 0}
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

function isIndeterminate(checked?: CheckedState): checked is "indeterminate" {
  return checked === "indeterminate";
}

function getState(checked: CheckedState) {
  return isIndeterminate(checked)
    ? "indeterminate"
    : checked
      ? "checked"
      : "unchecked";
}

export {
  Root,
  CheckboxGroupRoot,
  useCheckboxGroup,
  isIndeterminate,
  getState,
  type CheckboxGroupRootProps,
};
