import { Primitive, useComposedRefs, useScrollLock } from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import * as React from "react";
import { MentionContentProvider } from "./mention-content";
import { getDataState, useMentionContext } from "./mention-root";
import type { UseMentionPositionerProps } from "./use-mention-positioner";
import { useMentionPositioner } from "./use-mention-positioner";

const POSITIONER_NAME = "MentionPositioner";

interface MentionPositionerProps
  extends Omit<
      UseMentionPositionerProps,
      "open" | "onOpenChange" | "triggerRef" | "virtualAnchor"
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
    open: context.open,
    onOpenChange: context.onOpenChange,
    triggerRef: context.inputRef,
    virtualAnchor: context.virtualAnchor,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    collisionBoundary,
    collisionPadding,
    sticky,
    strategy,
    avoidCollisions,
    fitViewport,
    hideWhenDetached,
    trackAnchor,
  });

  const composedRef = useComposedRefs<HTMLDivElement>(forwardedRef, (node) =>
    positionerContext.refs.setFloating(node),
  );

  const composedStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      ...style,
      ...positionerContext.floatingStyles,
      ...(!context.open && forceMount ? { visibility: "hidden" } : {}),
    };
  }, [style, positionerContext.floatingStyles, context.open, forceMount]);

  useScrollLock({
    referenceElement: context.inputRef.current,
    enabled: context.open && context.modal,
  });

  if (!forceMount && !context.open) return null;

  return (
    <MentionContentProvider
      side={side}
      align={align}
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
        <Primitive.div
          ref={composedRef}
          role="listbox"
          aria-orientation="vertical"
          data-state={getDataState(context.open)}
          {...positionerContext.getFloatingProps(positionerProps)}
          style={composedStyle}
        />
      </FloatingFocusManager>
    </MentionContentProvider>
  );
});

MentionPositioner.displayName = POSITIONER_NAME;

export { MentionPositioner };
export type { MentionPositionerProps };
