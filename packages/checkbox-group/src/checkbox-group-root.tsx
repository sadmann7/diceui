import {
  type Direction,
  type Orientation,
  createContext,
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
  orientation: Orientation;
  id: string;
  labelId: string;
  descriptionId: string;
  messageId: string;
  validationMessage?: string | string[];
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

  /** Callback when value is validated. */
  onValidate?: (value: string[]) => string | string[] | true | null | undefined;

  /** Whether the checkbox group is disabled. */
  disabled?: boolean;

  /** Whether the checkbox group is invalid. */
  invalid?: boolean;

  /** Whether the checkbox group is read-only. */
  readOnly?: boolean;

  /** Whether the checkbox group is required. */
  required?: boolean;

  /** Name for form submission. */
  name?: string;

  /**
   * The reading direction of the checkbox group.
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
    onValidate,
    disabled = false,
    invalid = false,
    readOnly = false,
    required = false,
    dir: dirProp,
    orientation = "vertical",
    name,
    children,
    ...rootProps
  } = props;

  const [validationMessage, setValidationMessage] = React.useState<
    string | string[]
  >();
  const isInvalid = invalid || !!validationMessage;

  const [value = [], setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: (newValue) => {
      if (onValidate) {
        const validationResult = onValidate(newValue);
        if (
          typeof validationResult === "string" ||
          Array.isArray(validationResult)
        ) {
          setValidationMessage(validationResult);
        } else if (validationResult === true || validationResult == null) {
          setValidationMessage(undefined);
        }
      }
      onValueChange?.(newValue);
    },
  });

  const id = useId();
  const labelId = useId();
  const descriptionId = useId();
  const messageId = useId();

  const dir = useDirection(dirProp);

  const onItemCheckedChange = React.useCallback(
    (payload: string, checked: boolean) => {
      if (readOnly) return;

      const newValue = checked
        ? [...value, payload]
        : value.filter((v) => v !== payload);

      setValue(newValue);
    },
    [setValue, value, readOnly],
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
      isInvalid={isInvalid}
      id={id}
      labelId={labelId}
      descriptionId={descriptionId}
      messageId={messageId}
      validationMessage={validationMessage}
    >
      <Primitive.div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={`${descriptionId} ${isInvalid ? messageId : ""}`}
        aria-readonly={readOnly}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        data-invalid={isInvalid ? "" : undefined}
        dir={dir}
        {...rootProps}
        ref={ref}
      >
        {children}
      </Primitive.div>
    </CheckboxGroupProvider>
  );
});

CheckboxGroupRoot.displayName = ROOT_NAME;

const Root = CheckboxGroupRoot;

export { CheckboxGroupRoot, Root, useCheckboxGroup };

export type { CheckboxGroupRootProps };
