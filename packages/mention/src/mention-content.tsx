import {
  type Align,
  type PointerDownOutsideEvent,
  type Side,
  createContext,
  useDismiss,
} from "@diceui/shared";
import * as React from "react";
import {
  MentionPositioner,
  type MentionPositionerProps,
} from "./mention-positioner";
import { useMentionContext } from "./mention-root";

const CONTENT_NAME = "MentionContent";

interface MentionContentContextValue {
  side: Side;
  align: Align;
  onArrowChange: (arrow: HTMLElement | null) => void;
  arrowStyles: React.CSSProperties;
  arrowDisplaced: boolean;
  forceMount: boolean;
}

const [MentionContentProvider, useMentionContentContext] =
  createContext<MentionContentContextValue>(CONTENT_NAME);

interface MentionContentProps extends MentionPositionerProps {
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

const MentionContent = React.forwardRef<HTMLDivElement, MentionContentProps>(
  (props, forwardedRef) => {
    const {
      forceMount = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      ...contentProps
    } = props;
    const context = useMentionContext(CONTENT_NAME);

    useDismiss({
      enabled: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.inputRef],
      onFocusOutside: (event) => event.preventDefault(),
      onEscapeKeyDown,
      onPointerDownOutside,
      disableOutsidePointerEvents: false,
      preventScrollDismiss: true,
    });

    return (
      <MentionPositioner
        id={context.contentId}
        role="listbox"
        forceMount={forceMount}
        {...contentProps}
        ref={forwardedRef}
      />
    );
  },
);

MentionContent.displayName = CONTENT_NAME;

const Content = MentionContent;

export {
  Content,
  MentionContent,
  MentionContentProvider,
  useMentionContentContext,
};

export type { MentionContentProps };
