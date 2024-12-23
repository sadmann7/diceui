import {
  type PointerDownOutsideEvent,
  createContext,
  useDismiss,
} from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { ComboboxPositioner } from "./combobox-positioner";
import { useComboboxContext } from "./combobox-root";
import type { UseComboboxPositionerParams } from "./use-combobox-positioner";

const CONTENT_NAME = "ComboboxContent";

interface ComboboxContentProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div>,
    Omit<
      UseComboboxPositionerParams,
      | "open"
      | "onOpenChange"
      | "anchorRef"
      | "arrowRef"
      | "triggerRef"
      | "hasCustomAnchor"
      | "trackAnchor"
    > {
  /**
   * Event handler called when a `pointerdown` event happens outside of the content.
   *
   * Can be used to prevent the content from closing when the pointer is outside of the content.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
}

const ComboboxContent = React.forwardRef<HTMLDivElement, ComboboxContentProps>(
  (props, forwardedRef) => {
    const {
      forceMount = false,
      onPointerDownOutside,
      children,
      ...contentProps
    } = props;
    const context = useComboboxContext(CONTENT_NAME);

    useDismiss({
      open: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.anchorRef, context.listRef],
      onFocusOutside: (event) => event.preventDefault(),
      onPointerDownOutside,
      disableOutsidePointerEvents: context.open && context.modal,
    });

    return (
      <ComboboxPositioner
        role="listbox"
        id={context.contentId}
        forceMount={forceMount}
        {...contentProps}
        ref={forwardedRef}
      >
        <Primitive.div>{children}</Primitive.div>
      </ComboboxPositioner>
    );
  },
);

ComboboxContent.displayName = CONTENT_NAME;

const Content = ComboboxContent;

export { ComboboxContent, Content };

export type { ComboboxContentProps };
