import { Primitive, useComposedRefs, useScrollLock } from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
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

  const { open, onOpenChange, triggerRef, state } =
    useMentionContext(POSITIONER_NAME);

  const {
    refs,
    placement,
    middlewareData,
    elements,
    update,
    context: floatingContext,
    floatingStyles,
    arrowStyles,
    onArrowChange,
    renderedSide,
    renderedAlign,
    arrowDisplaced,
  } = useMentionPositioner({
    open,
    onOpenChange,
    triggerRef,
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
    refs.setFloating(node),
  );

  useScrollLock({ enabled: open });

  React.useEffect(() => {
    if (state.triggerPoint) {
      update();
    }
  }, [state.triggerPoint, update]);

  if (!forceMount && !open) {
    return null;
  }

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={false}
      initialFocus={-1}
      returnFocus={false}
      visuallyHiddenDismiss
    >
      <MentionContentProvider
        side={renderedSide}
        align={renderedAlign}
        arrowStyles={arrowStyles}
        arrowDisplaced={arrowDisplaced}
        onArrowChange={onArrowChange}
        forceMount={forceMount}
      >
        <Primitive.div
          ref={composedRef}
          role="listbox"
          aria-orientation="vertical"
          data-state={getDataState(open)}
          data-side={renderedSide}
          data-align={renderedAlign}
          style={{
            ...style,
            ...floatingStyles,
            position: strategy,
            top: state.triggerPoint?.top ?? 0,
            left: state.triggerPoint?.left ?? 0,
          }}
          {...positionerProps}
        />
      </MentionContentProvider>
    </FloatingFocusManager>
  );
});

MentionPositioner.displayName = POSITIONER_NAME;

export { MentionPositioner };
export type { MentionPositionerProps };
