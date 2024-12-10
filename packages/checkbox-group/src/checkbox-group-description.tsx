import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

const DESCRIPTION_NAME = "CheckboxGroupDescription";

interface CheckboxGroupDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** Whether the description should be announced by screen readers immediately upon rendering. */
  announce?: boolean;
}

const CheckboxGroupDescription = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupDescriptionProps
>((props, ref) => {
  const { announce = false, ...descriptionProps } = props;
  const context = useCheckboxGroup(DESCRIPTION_NAME);

  return (
    <Primitive.div
      id={context.descriptionId}
      // Use aria-live to announce changes to screen readers
      aria-live={announce ? "polite" : "off"}
      // Associate with the checkbox group using aria-describedby
      aria-describedby={context.labelId}
      aria-invalid={context.isInvalid}
      data-disabled={context.disabled ? "" : undefined}
      data-invalid={context.isInvalid ? "" : undefined}
      {...descriptionProps}
      ref={ref}
    />
  );
});

CheckboxGroupDescription.displayName = DESCRIPTION_NAME;

const Description = CheckboxGroupDescription;

export {
  CheckboxGroupDescription,
  Description,
  type CheckboxGroupDescriptionProps,
};
