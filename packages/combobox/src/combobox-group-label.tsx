import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxGroupContext } from "./combobox-group";

const GROUP_LABEL_NAME = "ComboboxGroupLabel";

interface ComboboxGroupLabelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  htmlFor?: string;
}

const ComboboxGroupLabel = React.forwardRef<
  HTMLDivElement,
  ComboboxGroupLabelProps
>((props, forwardedRef) => {
  const groupContext = useComboboxGroupContext(GROUP_LABEL_NAME);

  return (
    <Primitive.div
      id={groupContext.labelId}
      htmlFor={groupContext.id}
      {...props}
      ref={forwardedRef}
    />
  );
});

ComboboxGroupLabel.displayName = GROUP_LABEL_NAME;

export { ComboboxGroupLabel };

export type { ComboboxGroupLabelProps };
