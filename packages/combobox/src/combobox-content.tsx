import {
  type Align,
  type PointerDownOutsideEvent,
  type Side,
  createContext,
  useDismiss,
} from "@diceui/shared";
import * as React from "react";
import {
  ComboboxPositioner,
  type ComboboxPositionerProps,
} from "./combobox-positioner";
import { useComboboxContext } from "./combobox-root";

const CONTENT_NAME = "ComboboxContent";

interface ComboboxContentContextValue {
  side: Side;
  align: Align;
  onArrowChange: (arrow: HTMLElement | null) => void;
  arrowStyles: React.CSSProperties;
  arrowDisplaced: boolean;
  forceMount: boolean;
}

const [ComboboxContentProvider, useComboboxContentContext] =
  createContext<ComboboxContentContextValue>(CONTENT_NAME);

interface ComboboxContentProps extends ComboboxPositionerProps {
  /**
   * Event handler called when the `Escape` key is pressed.
   *
   * Can be used to prevent input value from being reset on `Escape` key press.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

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
      onEscapeKeyDown,
      onPointerDownOutside,
      ...contentProps
    } = props;
    const context = useComboboxContext(CONTENT_NAME);

    useDismiss({
      enabled: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.listRef, context.anchorRef],
      onFocusOutside: (event) => event.preventDefault(),
      onEscapeKeyDown,
      onPointerDownOutside,
      disableOutsidePointerEvents: context.open && context.modal,
      preventScrollDismiss: context.open,
    });

    return (
      <ComboboxPositioner
        role="listbox"
        id={context.contentId}
        forceMount={forceMount}
        trackAnchor={context.hasAnchor}
        {...contentProps}
        ref={forwardedRef}
      />
    );
  },
);

ComboboxContent.displayName = CONTENT_NAME;

const Content = ComboboxContent;

export {
  ComboboxContent,
  ComboboxContentProvider,
  Content,
  useComboboxContentContext,
};

export type { ComboboxContentProps };
