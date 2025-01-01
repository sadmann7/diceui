import {
  type Align,
  type PointerDownOutsideEvent,
  type Side,
  createContext,
  useComposedRefs,
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
    const composedRefs = useComposedRefs(forwardedRef, context.listRef);

    useDismiss({
      enabled: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.triggerRef],
      onFocusOutside: (event) => event.preventDefault(),
      onEscapeKeyDown,
      onPointerDownOutside,
      disableOutsidePointerEvents: false,
      preventScrollDismiss: true,
    });

    const activedescendant = React.useMemo(() => {
      if (!context.highlightedItem) return undefined;
      return (
        context.highlightedItem.id ||
        context.highlightedItem.getAttribute("id") ||
        undefined
      );
    }, [context.highlightedItem]);

    return (
      <MentionPositioner
        role="listbox"
        forceMount={forceMount}
        {...contentProps}
        ref={composedRefs}
        aria-activedescendant={activedescendant}
      >
        <div ref={context.collectionRef}>{props.children}</div>
      </MentionPositioner>
    );
  },
);

MentionContent.displayName = CONTENT_NAME;

const Content = MentionContent;

export {
  MentionContent,
  MentionContentProvider,
  Content,
  useMentionContentContext,
};

export type { MentionContentProps };
