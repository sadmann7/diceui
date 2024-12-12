import {
  type Direction,
  createContext,
  useComposedRefs,
  useControllableState,
  useDirection,
  useId,
} from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const ROOT_NAME = "CheckboxGroupRoot";

interface CheckboxGroupContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  onItemCheckedChange: (value: string, checked: boolean) => void;
  disabled?: boolean;
  isInvalid: boolean;
  required?: boolean;
  dir: Direction;
  orientation: "horizontal" | "vertical";
  id: string;
  labelId: string;
  descriptionId: string;
  messageId: string;
}

const [CheckboxGroupProvider, useCheckboxGroup] =
  createContext<CheckboxGroupContextValue>(ROOT_NAME);

interface CheckboxGroupRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onChange" | "onInvalid"
  > {
  /** Controlled value. */
  value?: string[];

  /** Initial value when uncontrolled. */
  defaultValue?: string[];

  /** Callback when value changes. */
  onValueChange?: (value: string[]) => void;

  /** Whether the checkbox group is disabled. */
  disabled?: boolean;

  /** Whether the checkbox group is invalid. */
  invalid?: boolean;

  /** Whether the checkbox group is required. */
  required?: boolean;

  /** Name for form submission. */
  name?: string;

  /**
   * Text direction for the checkbox group.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the checkbox group.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
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
    invalid = false,
    required = false,
    dir: dirProp,
    orientation = "vertical",
    name,
    children,
    ...rootProps
  } = props;

  const [value = [], setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const dir = useDirection(dirProp);
  const id = useId();
  const labelId = `${id}label`;
  const descriptionId = `${id}description`;
  const messageId = `${id}message`;

  const collectionRef = React.useRef<HTMLDivElement>(null);
  const composedRefs = useComposedRefs(ref, collectionRef);

  const onItemCheckedChange = React.useCallback(
    (payload: string, checked: boolean) => {
      const newValue = checked
        ? [...value, payload]
        : value.filter((v) => v !== payload);

      setValue(newValue);
    },
    [setValue, value],
  );

  return (
    <CheckboxGroupProvider
      value={value}
      onValueChange={setValue}
      onItemCheckedChange={onItemCheckedChange}
      disabled={disabled}
      required={required}
      dir={dir}
      orientation={orientation}
      isInvalid={invalid}
      id={id}
      labelId={labelId}
      descriptionId={descriptionId}
      messageId={messageId}
    >
      <Primitive.div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={`${descriptionId} ${invalid ? messageId : ""}`}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        dir={dir}
        {...rootProps}
        ref={composedRefs}
      >
        {children}
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
