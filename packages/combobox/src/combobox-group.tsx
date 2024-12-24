import { createContext, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const GROUP_NAME = "ComboboxGroup";

interface ComboboxGroupContextValue {
  id: string;
  labelId: string;
}

const [ComboboxGroupProvider, useComboboxGroupContext, ComboboxGroupContext] =
  createContext<ComboboxGroupContextValue>(GROUP_NAME);

interface ComboboxGroupProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether to force mount the group even if it's not visible during filtering.
   * @default false
   */
  forceMount?: boolean;
}

const ComboboxGroup = React.forwardRef<HTMLDivElement, ComboboxGroupProps>(
  (props, forwardedRef) => {
    const { forceMount = false, ...groupProps } = props;
    const id = useId();
    const labelId = `${id}label`;
    const context = useComboboxContext(GROUP_NAME);

    const shouldRender =
      forceMount ||
      !context.filterStore.search ||
      context.filterStore.groups.has(id);

    if (!shouldRender) return null;

    return (
      <ComboboxGroupProvider id={id} labelId={labelId}>
        <Primitive.div
          role="group"
          aria-labelledby={labelId}
          {...groupProps}
          ref={forwardedRef}
        />
      </ComboboxGroupProvider>
    );
  },
);

ComboboxGroup.displayName = GROUP_NAME;

const Group = ComboboxGroup;

export { ComboboxGroup, ComboboxGroupContext, Group, useComboboxGroupContext };

export type { ComboboxGroupProps };
