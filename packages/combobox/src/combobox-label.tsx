import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const LABEL_NAME = "ComboboxLabel";

interface ComboboxLabelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.label> {}

const ComboboxLabel = React.forwardRef<HTMLLabelElement, ComboboxLabelProps>(
  (props, forwardedRef) => {
    const context = useComboboxContext(LABEL_NAME);

    return (
      <Primitive.label
        id={context.labelId}
        htmlFor={context.id}
        {...props}
        ref={forwardedRef}
      />
    );
  },
);

ComboboxLabel.displayName = LABEL_NAME;

export { ComboboxLabel, type ComboboxLabelProps };
