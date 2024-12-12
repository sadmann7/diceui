import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

const DESCRIPTION_NAME = "CheckboxGroupDescription";

interface CheckboxGroupDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the description should be announced by screen readers immediately upon rendering.
   * @default false
   */
  announce?: boolean;

  /**
   * Hide the description when the checkbox group is in an error state.
   * @default false
   */
  hideOnError?: boolean;
}

const CheckboxGroupDescription = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupDescriptionProps
>((props, ref) => {
  const { announce = false, hideOnError = false, ...descriptionProps } = props;
  const context = useCheckboxGroup(DESCRIPTION_NAME);

  if (hideOnError && context.isInvalid) {
    return null;
  }

  return (
    <Primitive.div
      id={context.descriptionId}
      aria-live={announce ? "polite" : "off"}
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
