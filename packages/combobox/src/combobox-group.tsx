import { createContext, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const GROUP_NAME = "ComboboxGroup";

interface ComboboxGroupContextValue {
  id: string;
  labelId: string;
}

const [ComboboxGroupProvider, useComboboxGroupContext] =
  createContext<ComboboxGroupContextValue>(GROUP_NAME);

interface ComboboxGroupProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const ComboboxGroup = React.forwardRef<HTMLDivElement, ComboboxGroupProps>(
  (props, forwardedRef) => {
    const id = useId();
    const labelId = `${id}label`;

    return (
      <ComboboxGroupProvider id={id} labelId={labelId}>
        <Primitive.div
          role="group"
          aria-labelledby={labelId}
          ref={forwardedRef}
          {...props}
        />
      </ComboboxGroupProvider>
    );
  },
);

ComboboxGroup.displayName = GROUP_NAME;

const Group = ComboboxGroup;

export { ComboboxGroup, Group, useComboboxGroupContext };

export type { ComboboxGroupProps };
