import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const SEPARATOR_NAME = "ComboboxSeparator";

interface ComboboxSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const ComboboxSeparator = React.forwardRef<
  HTMLDivElement,
  ComboboxSeparatorProps
>((props, forwardedRef) => {
  return (
    <Primitive.div
      role="separator"
      aria-hidden="true"
      {...props}
      ref={forwardedRef}
    />
  );
});

ComboboxSeparator.displayName = SEPARATOR_NAME;

const Separator = ComboboxSeparator;

export { ComboboxSeparator, Separator };

export type { ComboboxSeparatorProps };
