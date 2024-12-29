import { useComposedRefs, useScrollLock } from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { MentionContentProvider } from "./mention-content";
import { getDataState, useMentionContext } from "./mention-root";
import type { UseMentionPositionerParams } from "./use-mention-positioner";
import { useMentionPositioner } from "./use-mention-positioner";

const POSITIONER_NAME = "MentionPositioner";

interface MentionPositionerProps
  extends Omit<
      UseMentionPositionerParams,
      "open" | "onOpenChange" | "triggerRef"
    >,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the positioner should always be rendered.
   * @default false
   */
  forceMount?: boolean;
}

const MentionPositioner = React.forwardRef<
  HTMLDivElement,
  MentionPositionerProps
>((props, forwardedRef) => {
  const {
    forceMount = false,
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
    hideWhenDetached = false,
    trackAnchor = true,
    style,
    ...positionerProps
  } = props;

  const context = useMentionContext(POSITIONER_NAME);

  const positionerContext = useMentionPositioner({
    open: context.state.isOpen,
    onOpenChange: (open) => {
      if (!open) context.onClose();
      else context.onOpen();
    },
    side,
    sideOffset,
    align,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    strategy,
    avoidCollisions,
    fitViewport,
    forceMount,
    hideWhenDetached,
    trackAnchor,
    triggerRef: context.triggerRef,
  });

  const composedRef = useComposedRefs(forwardedRef, (node) =>
    positionerContext.refs.setFloating(node),
  );

  const composedStyle = React.useMemo<React.CSSProperties>(
    () => ({
      ...style,
      ...positionerContext.floatingStyles,
      ...(!context.state.isOpen && forceMount ? { visibility: "hidden" } : {}),
    }),
    [style, positionerContext.floatingStyles, context.state.isOpen, forceMount],
  );

  useScrollLock({
    referenceElement: positionerContext.refs.floating.current,
    enabled: context.state.isOpen,
  });

  if (!forceMount && !context.state.isOpen) {
    return null;
  }

  const content = (
    <MentionContentProvider
      side={side}
      align={align}
      onArrowChange={positionerContext.onArrowChange}
      arrowDisplaced={positionerContext.arrowDisplaced}
      arrowStyles={positionerContext.arrowStyles}
      forceMount={forceMount}
    >
      <Primitive.div
        data-state={getDataState(context.state.isOpen)}
        {...positionerContext.getFloatingProps(positionerProps)}
        ref={composedRef}
        style={composedStyle}
      />
    </MentionContentProvider>
  );

  return (
    <FloatingFocusManager
      context={positionerContext.context}
      disabled={!context.state.isOpen}
      initialFocus={context.triggerRef}
      modal={false}
    >
      {content}
    </FloatingFocusManager>
  );
});

MentionPositioner.displayName = POSITIONER_NAME;

const Positioner = MentionPositioner;

export { MentionPositioner, Positioner };
export type { MentionPositionerProps };
