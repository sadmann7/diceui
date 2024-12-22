import { Presence, createContext } from "@diceui/shared";
import { useDismiss } from "@floating-ui/react";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const CONTENT_NAME = "ComboboxContent";

interface ComboboxContentContextValue {
  forceMount: boolean;
}

const [ComboboxContentProvider, useComboboxContentContext] =
  createContext<ComboboxContentContextValue>(CONTENT_NAME);

interface ComboboxContentProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  forceMount?: boolean;
}

const ComboboxContent = React.forwardRef<HTMLDivElement, ComboboxContentProps>(
  (props, forwardedRef) => {
    const { forceMount = false, ...contentProps } = props;
    const context = useComboboxContext(CONTENT_NAME);

    return (
      <ComboboxContentProvider forceMount={forceMount}>
        <Presence present={forceMount || context.open}>
          <Primitive.div
            role="listbox"
            id={context.contentId}
            data-state={context.open ? "open" : "closed"}
            {...contentProps}
            ref={forwardedRef}
          />
        </Presence>
      </ComboboxContentProvider>
    );
  },
);

ComboboxContent.displayName = CONTENT_NAME;

const Content = ComboboxContent;

export { ComboboxContent, Content, useComboboxContentContext };

export type { ComboboxContentProps };
