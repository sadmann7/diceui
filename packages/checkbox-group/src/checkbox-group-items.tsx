import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

const ITEMS_NAME = "CheckboxGroupItems";

interface CheckboxGroupItemsProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const CheckboxGroupItems = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupItemsProps
>((props, ref) => {
  const context = useCheckboxGroup(ITEMS_NAME);

  return (
    <Primitive.div
      data-orientation={context.orientation}
      {...props}
      ref={ref}
    />
  );
});

CheckboxGroupItems.displayName = ITEMS_NAME;

const Items = CheckboxGroupItems;

export { CheckboxGroupItems, Items, type CheckboxGroupItemsProps };
