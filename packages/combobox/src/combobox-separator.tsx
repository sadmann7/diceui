import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const SEPARATOR_NAME = "ComboboxSeparator";

interface ComboboxSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether to always render the separator, even if it's not between two visible groups.
   * @default false
   */
  keepVisible?: boolean;
}

const ComboboxSeparator = React.forwardRef<
  HTMLDivElement,
  ComboboxSeparatorProps
>((props, forwardedRef) => {
  const { keepVisible = false, ...separatorProps } = props;
  const context = useComboboxContext(SEPARATOR_NAME);

  const shouldRender = keepVisible || !context.filterStore.search;

  if (!shouldRender) return null;

  return (
    <Primitive.div
      role="separator"
      aria-hidden="true"
      {...separatorProps}
      ref={forwardedRef}
    />
  );
});

ComboboxSeparator.displayName = SEPARATOR_NAME;

const Separator = ComboboxSeparator;

export { ComboboxSeparator, Separator };

export type { ComboboxSeparatorProps };
