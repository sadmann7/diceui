import { Primitive, createContext, useId } from "@diceui/shared";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const GROUP_NAME = "ComboboxGroup";

interface ComboboxGroupContextValue {
  id: string;
  labelId: string;
  forceMount: boolean;
}

const [ComboboxGroupProvider, useComboboxGroupContext] =
  createContext<ComboboxGroupContextValue>(GROUP_NAME);

interface ComboboxGroupProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether to render the group even if it's not visible during filtering.
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
      <ComboboxGroupProvider id={id} labelId={labelId} forceMount={forceMount}>
        <Primitive.div
          role="group"
          id={id}
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

export { ComboboxGroup, Group, useComboboxGroupContext };

export type { ComboboxGroupProps };
