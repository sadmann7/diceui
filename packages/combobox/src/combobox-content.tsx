import { Presence } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const CONTENT_NAME = "ComboboxContent";

interface ComboboxContentProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  forceMount?: boolean;
}

const ComboboxContent = React.forwardRef<HTMLDivElement, ComboboxContentProps>(
  (props, forwardedRef) => {
    const { forceMount = false, ...contentProps } = props;
    const context = useComboboxContext(CONTENT_NAME);

    return (
      <Presence present={forceMount || context.open}>
        <Primitive.div
          role="listbox"
          id={context.contentId}
          data-state={context.open ? "open" : "closed"}
          {...contentProps}
          ref={forwardedRef}
        />
      </Presence>
    );
  },
);

ComboboxContent.displayName = CONTENT_NAME;

export { ComboboxContent };

export type { ComboboxContentProps };
