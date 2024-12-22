import {
  type PointerDownOutsideEvent,
  createContext,
  useDismiss,
} from "@diceui/shared";
import type { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { ComboboxPositioner } from "./combobox-positioner";
import { useComboboxContext } from "./combobox-root";
import type { UseComboboxPositionerParams } from "./use-combobox-positioner";

const CONTENT_NAME = "ComboboxContent";

interface ComboboxContentContextValue {
  forceMount: boolean;
}

const [ComboboxContentProvider, useComboboxContentContext] =
  createContext<ComboboxContentContextValue>(CONTENT_NAME);

interface ComboboxContentProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div>,
    Omit<
      UseComboboxPositionerParams,
      | "open"
      | "onOpenChange"
      | "triggerRef"
      | "anchorRef"
      | "hasCustomAnchor"
      | "trackAnchor"
    > {
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
        <ComboboxPositioner
          role="listbox"
          id={context.contentId}
          {...contentProps}
          ref={forwardedRef}
          forceMount={forceMount}
        />
      </ComboboxContentProvider>
    );
  },
);

ComboboxContent.displayName = CONTENT_NAME;

const Content = ComboboxContent;

export { ComboboxContent, Content, useComboboxContentContext };

export type { ComboboxContentProps };
