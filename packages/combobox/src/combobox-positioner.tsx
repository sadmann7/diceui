import { Primitive, useComposedRefs, useScrollLock } from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import * as React from "react";
import { ComboboxContentProvider } from "./combobox-content";
import { getDataState, useComboboxContext } from "./combobox-root";
import type { UseComboboxPositionerParams } from "./use-combobox-positioner";
import { useComboboxPositioner } from "./use-combobox-positioner";

const POSITIONER_NAME = "ComboboxPositioner";

interface ComboboxPositionerProps
  extends Omit<
      UseComboboxPositionerParams,
      "open" | "onOpenChange" | "anchorRef" | "triggerRef" | "hasAnchor"
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

  const positionerContext = useComboboxPositioner({
    open: context.open,
    onOpenChange: context.onOpenChange,
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
    hasAnchor: context.hasAnchor,
    trackAnchor,
    anchorRef: context.anchorRef,
    triggerRef: context.inputRef,
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

  const content = (
    <ComboboxContentProvider
      side={side}
      align={align}
      onArrowChange={positionerContext.onArrowChange}
      arrowDisplaced={positionerContext.arrowDisplaced}
      arrowStyles={positionerContext.arrowStyles}
      forceMount={forceMount}
    >
      <Primitive.div
        data-state={getDataState(context.open)}
        {...positionerContext.getFloatingProps(positionerProps)}
        ref={composedRef}
        style={composedStyle}
      />
    </ComboboxContentProvider>
  );

  if (context.modal) {
    return (
      <FloatingFocusManager
        context={positionerContext.context}
        disabled={!context.open}
        initialFocus={context.inputRef}
        modal={false}
      >
        {content}
      </FloatingFocusManager>
    );
  }

  return content;
});

ComboboxPositioner.displayName = POSITIONER_NAME;

const Positioner = ComboboxPositioner;

export { ComboboxPositioner, Positioner };

export type { ComboboxPositionerProps };
