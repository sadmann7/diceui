import { Primitive, useId } from "@diceui/shared";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

const LIST_NAME = "CheckboxGroupList";

interface CheckboxGroupListProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const CheckboxGroupList = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupListProps
>((props, ref) => {
  const context = useCheckboxGroup(LIST_NAME);
  const id = useId();

  return (
    <Primitive.div
      role="group"
      id={id}
      data-orientation={context.orientation}
      data-invalid={context.isInvalid ? "" : undefined}
      {...props}
      ref={ref}
    />
  );
});

CheckboxGroupList.displayName = LIST_NAME;

const List = CheckboxGroupList;

export { CheckboxGroupList, List };

export type { CheckboxGroupListProps };
