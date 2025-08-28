import {
  type Align,
  type AnchorPositionerProps,
  createContext,
  type PointerDownOutsideEvent,
  Presence,
  Primitive,
  type Side,
  useAnchorPositioner,
  useComposedRefs,
  useDismiss,
  useScrollLock,
  visuallyHidden,
} from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import * as React from "react";
import { getDataState, useMentionContext } from "./mention-root";

const CONTENT_NAME = "MentionContent";

type ContentElement = React.ElementRef<typeof Primitive.div>;

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

interface MentionContentProps
  extends AnchorPositionerProps,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Event handler called when the `Escape` key is pressed.
   *
   * Can be used to prevent the popover from closing when the `Escape` key is pressed.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Event handler called when a `pointerdown` event happens outside of the content.
   *
   * Can be used to prevent the popover from closing when the pointer is outside of the content.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
}

const MentionContent = React.forwardRef<ContentElement, MentionContentProps>(
  (props, forwardedRef) => {
    const {
      side = "bottom",
      sideOffset = 4,
      align = "start",
      alignOffset = 0,
      arrowPadding = 0,
      collisionBoundary,
      collisionPadding,
      sticky = "partial",
      strategy = "absolute",
      avoidCollisions = true,
      fitViewport = false,
      forceMount = false,
      hideWhenDetached = false,
      trackAnchor = true,
      onEscapeKeyDown,
      onPointerDownOutside,
      style,
      ...contentProps
    } = props;

    const context = useMentionContext(CONTENT_NAME);

    const rtlAwareAlign = React.useMemo(() => {
      if (context.dir !== "rtl") return align;
      return align === "start" ? "end" : align === "end" ? "start" : align;
    }, [align, context.dir]);

    const positionerContext = useAnchorPositioner({
      open: context.open,
      onOpenChange: context.onOpenChange,
      anchorRef: context.virtualAnchor,
      side,
      sideOffset,
      align: rtlAwareAlign,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      strategy,
      avoidCollisions,
      disableArrow: true,
      fitViewport,
      hideWhenDetached,
      trackAnchor,
    });

    const composedRef = useComposedRefs(forwardedRef, (node) =>
      positionerContext.refs.setFloating(node),
    );
    const composedStyle = React.useMemo<React.CSSProperties>(() => {
      return {
        ...style,
        ...positionerContext.floatingStyles,
        ...(!context.open && forceMount ? { visibility: "hidden" } : {}),
        // Hide content visually during pasting while keeping items registered
        ...(context.isPasting ? visuallyHidden : {}),
      };
    }, [
      style,
      positionerContext.floatingStyles,
      forceMount,
      context.open,
      context.isPasting,
    ]);

    useDismiss({
      enabled: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.listRef, context.inputRef],
      onFocusOutside: (event) => event.preventDefault(),
      onEscapeKeyDown,
      onPointerDownOutside,
      disableOutsidePointerEvents: context.open && context.modal,
      preventScrollDismiss: context.open,
    });

    useScrollLock({
      referenceElement: context.inputRef.current,
      enabled: context.open && context.modal,
    });

    return (
      <MentionContentProvider
        side={side}
        align={rtlAwareAlign}
        arrowStyles={positionerContext.arrowStyles}
        arrowDisplaced={positionerContext.arrowDisplaced}
        onArrowChange={positionerContext.onArrowChange}
        forceMount={forceMount}
      >
        <FloatingFocusManager
          context={positionerContext.context}
          modal={false}
          initialFocus={context.inputRef}
          returnFocus={false}
          disabled={!context.open}
          visuallyHiddenDismiss
        >
          <Presence present={forceMount || context.open}>
            <Primitive.div
              ref={composedRef}
              role="listbox"
              aria-orientation="vertical"
              data-state={getDataState(context.open)}
              dir={context.dir}
              {...positionerContext.getFloatingProps(contentProps)}
              style={composedStyle}
            />
          </Presence>
        </FloatingFocusManager>
      </MentionContentProvider>
    );
  },
);

MentionContent.displayName = CONTENT_NAME;

const Content = MentionContent;

export { MentionContent, Content, useMentionContentContext };

export type { MentionContentProps, ContentElement };
