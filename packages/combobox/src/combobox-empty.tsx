import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const EMPTY_NAME = "ComboboxEmpty";

interface ComboboxEmptyProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  (props, forwardedRef) => {
    const { children = "No results found", ...emptyProps } = props;
    const context = useComboboxContext(EMPTY_NAME);

    if (context.value === undefined) return null;

    return (
      <Primitive.div ref={forwardedRef} {...emptyProps}>
        {children}
      </Primitive.div>
    );
  },
);

ComboboxEmpty.displayName = EMPTY_NAME;

export { ComboboxEmpty };

export type { ComboboxEmptyProps };
