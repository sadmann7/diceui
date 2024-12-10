import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

const LABEL_NAME = "CheckboxGroupLabel";

interface CheckboxGroupLabelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.label> {}

const CheckboxGroupLabel = React.forwardRef<
  HTMLLabelElement,
  CheckboxGroupLabelProps
>((props, ref) => {
  const context = useCheckboxGroup(LABEL_NAME);

  return (
    <Primitive.label
      data-disabled={context.disabled ? "" : undefined}
      id={context.labelId}
      {...props}
      ref={ref}
    />
  );
});

CheckboxGroupLabel.displayName = LABEL_NAME;

const Label = CheckboxGroupLabel;

export { CheckboxGroupLabel, Label, type CheckboxGroupLabelProps };
