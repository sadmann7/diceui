import {
  type PointerDownOutsideEvent,
  Presence,
  composeEventHandlers,
  createContext,
  useDismiss,
} from "@diceui/shared";
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
  /**
   * Whether the content should be force mounted.
   * @default false
   */
  forceMount?: boolean;

  /** Event handler called when a `pointerdown` event happens outside of the content. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
}

const ComboboxContent = React.forwardRef<HTMLDivElement, ComboboxContentProps>(
  (props, forwardedRef) => {
    const { forceMount = false, onPointerDownOutside, ...contentProps } = props;
    const context = useComboboxContext(CONTENT_NAME);

    useDismiss({
      open: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.anchorRef, context.listRef],
      onFocusOutside: (event) => event.preventDefault(),
      onPointerDownOutside,
      disableOutsidePointerEvents:
        context.open && context.modal && !context.disabled,
    });

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
