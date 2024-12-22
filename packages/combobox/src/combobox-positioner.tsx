import { useComposedRefs, useScrollLock } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";
import { useComboboxPositioner } from "./use-combobox-positioner";
import type { UseComboboxPositionerParams } from "./use-combobox-positioner";

const POSITIONER_NAME = "ComboboxPositioner";

interface ComboboxPositionerProps
  extends Omit<UseComboboxPositionerParams, "open" | "onOpenChange">,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
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
    avoidCollisions = true,
    collisionBoundary,
    collisionPadding,
    arrowPadding = 0,
    sticky = "partial",
    hideWhenDetached = false,
    fitViewport = false,
    strategy = "absolute",
    style,
    ...positionerProps
  } = props;

  const context = useComboboxContext(POSITIONER_NAME);
  const arrowRef = React.useRef<HTMLDivElement | null>(null);

  const { floating, getFloatingProps, getStyles } = useComboboxPositioner({
    open: context.open,
    onOpenChange: context.onOpenChange,
    side,
    sideOffset,
    align,
    alignOffset,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    hideWhenDetached,
    fitViewport,
    strategy,
    arrowRef,
  });

  const composedRef = useComposedRefs(
    forwardedRef,
    context.contentRef,
    (node) => floating.refs.setFloating(node),
  );

  useScrollLock({
    enabled: context.open && context.modal,
    referenceElement: context.contentRef.current,
  });

  React.useEffect(() => {
    if (context.inputRef.current) {
      floating.refs.setReference(context.inputRef.current);
    }
  }, [context.inputRef, floating.refs]);

  if (!forceMount && !context.open) {
    return null;
  }

  return (
    <Primitive.div
      {...getFloatingProps(positionerProps)}
      data-state={context.open ? "open" : "closed"}
      ref={composedRef}
      style={{ ...style, ...getStyles() }}
    />
  );
});

ComboboxPositioner.displayName = POSITIONER_NAME;

const Positioner = ComboboxPositioner;

export { ComboboxPositioner, Positioner };
export type { ComboboxPositionerProps };
