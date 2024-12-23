import { useComposedRefs, useScrollLock } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";
import type { UseComboboxPositionerParams } from "./use-combobox-positioner";
import { useComboboxPositioner } from "./use-combobox-positioner";

const POSITIONER_NAME = "ComboboxPositioner";

interface ComboboxPositionerProps
  extends Omit<UseComboboxPositionerParams, "open" | "onOpenChange">,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the positioner should be force mounted.
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
  const arrowRef = React.useRef<HTMLDivElement | null>(null);

  const { refs, floatingStyles, getFloatingProps } = useComboboxPositioner({
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
    hasCustomAnchor: context.hasCustomAnchor,
    trackAnchor,
    arrowRef,
    anchorRef: context.anchorRef,
    triggerRef: context.inputRef,
  });

  const composedRef = useComposedRefs(forwardedRef, context.listRef, (node) =>
    refs.setFloating(node),
  );

  const composedStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      ...style,
      ...floatingStyles,
      ...(!context.open && forceMount ? { visibility: "hidden" } : {}),
    };
  }, [style, floatingStyles, context.open, forceMount]);

  useScrollLock({
    referenceElement: context.listRef.current,
    enabled: context.open && context.modal,
  });

  if (!forceMount && !context.open) {
    return null;
  }

  return (
    <Primitive.div
      data-state={context.open ? "open" : "closed"}
      {...getFloatingProps(positionerProps)}
      ref={composedRef}
      style={composedStyle}
    />
  );
});

ComboboxPositioner.displayName = POSITIONER_NAME;

const Positioner = ComboboxPositioner;

export { ComboboxPositioner, Positioner };

export type { ComboboxPositionerProps };
