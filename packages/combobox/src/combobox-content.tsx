import {
  type FocusOutsideEvent,
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

  /** Event handler called when the escape key is down. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /** Event handler called when the focus moves outside of the dismissable layer. */
  onFocusOutside?: (event: FocusOutsideEvent) => void;

  /** Event handler called when an interaction happens outside the dismissable layer. */
  onInteractOutside?: (
    event: PointerDownOutsideEvent | FocusOutsideEvent,
  ) => void;

  /** Event handler called when a `pointerdown` event happens outside of the dismissable layer. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
}

const ComboboxContent = React.forwardRef<HTMLDivElement, ComboboxContentProps>(
  (props, forwardedRef) => {
    const {
      forceMount = false,
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
      ...contentProps
    } = props;
    const context = useComboboxContext(CONTENT_NAME);

    useDismiss({
      open: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.anchorRef, context.contentRef],
      onEscapeKeyDown: composeEventHandlers(onEscapeKeyDown, () =>
        context.onOpenChange(false),
      ),
      onFocusOutside: composeEventHandlers(onFocusOutside, () =>
        context.onOpenChange(false),
      ),
      onInteractOutside: composeEventHandlers(onInteractOutside, () =>
        context.onOpenChange(false),
      ),
      onPointerDownOutside: composeEventHandlers(
        onPointerDownOutside,
        (event) => {
          if (event.currentTarget === context.contentRef.current) {
            context.onOpenChange(false);
          }
        },
      ),
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
