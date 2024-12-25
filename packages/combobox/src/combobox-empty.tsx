import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const EMPTY_NAME = "ComboboxEmpty";

interface ComboboxEmptyProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  (props, forwardedRef) => {
    const context = useComboboxContext(EMPTY_NAME);

    const shouldRender =
      context.filterStore.itemCount === 0 &&
      context.filterStore.search.trim() !== "";

    if (!shouldRender) return null;

    return <Primitive.div {...props} ref={forwardedRef} />;
  },
);

ComboboxEmpty.displayName = EMPTY_NAME;

const Empty = ComboboxEmpty;

export { ComboboxEmpty, Empty };

export type { ComboboxEmptyProps };
