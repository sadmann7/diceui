import {
  Primitive,
  type UseAnchorPositionerProps,
  useAnchorPositioner,
  useComposedRefs,
  useScrollLock,
} from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import * as React from "react";
import { ComboboxContentProvider } from "./combobox-content";
import { getDataState, useComboboxContext } from "./combobox-root";

const POSITIONER_NAME = "ComboboxPositioner";

interface ComboboxPositionerProps
  extends Omit<
      UseAnchorPositionerProps,
      "open" | "onOpenChange" | "triggerRef" | "anchor"
    >,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the positioner should always be rendered.
   * @default false
   */
  forceMount?: boolean;
}

const ComboboxPositioner = React.forwardRef<
  HTMLDivElement,
  ComboboxPositionerProps
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

  const context = useComboboxContext(POSITIONER_NAME);

  const positionerContext = useAnchorPositioner({
    open: context.open,
    onOpenChange: context.onOpenChange,
    anchorRef: context.hasAnchor ? context.anchorRef : context.inputRef,
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

  const composedRef = useComposedRefs(forwardedRef, context.listRef, (node) =>
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

  if (!forceMount && !context.open) {
    return null;
  }

  return (
    <ComboboxContentProvider
      side={positionerContext.side}
      align={positionerContext.align}
      onArrowChange={positionerContext.onArrowChange}
      arrowDisplaced={positionerContext.arrowDisplaced}
      arrowStyles={positionerContext.arrowStyles}
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
          data-state={getDataState(context.open)}
          {...positionerContext.getFloatingProps(positionerProps)}
          ref={composedRef}
          style={composedStyle}
        />
      </FloatingFocusManager>
    </ComboboxContentProvider>
  );
});

ComboboxPositioner.displayName = POSITIONER_NAME;

const Positioner = ComboboxPositioner;

export { ComboboxPositioner, Positioner };

export type { ComboboxPositionerProps };
