import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const EMPTY_NAME = "ComboboxEmpty";

interface ComboboxEmptyProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether to render the empty state even when search filtering is active.
   *
   * Can be used for `manualFiltering` comboboxes to show the empty state.
   * @default false
   */
  visible?: boolean;
}

const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  (props, forwardedRef) => {
    const { visible = false, ...emptyProps } = props;
    const context = useComboboxContext(EMPTY_NAME);

    const shouldRender =
      visible ||
      (context.open &&
        context.filterStore.itemCount === 0 &&
        context.filterStore.search.trim() !== "");

    if (!shouldRender) return null;

    return (
      <Primitive.div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-state="empty"
        {...emptyProps}
        ref={forwardedRef}
      />
    );
  },
);

ComboboxEmpty.displayName = EMPTY_NAME;

const Empty = ComboboxEmpty;

export { ComboboxEmpty, Empty };

export type { ComboboxEmptyProps };
