import { useComposedRefs, useScrollLock } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";
import { useAnchorPositioning } from "./use-anchor-positioning";
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
    trackAnchor = true,
    style,
    ...positionerProps
  } = props;

  const context = useComboboxContext(POSITIONER_NAME);
  const arrowRef = React.useRef<HTMLDivElement | null>(null);

  const { reference, updateReference } = useAnchorPositioning({
    anchorRef: context.anchorRef,
    inputRef: context.inputRef,
    hasCustomAnchor: context.hasCustomAnchor,
  });

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
    forceMount,
    trackAnchor,
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

  // Update reference when floating UI needs to reposition
  React.useEffect(() => {
    const update = floating.update;
    if (typeof update === "function") {
      update();
    }
  }, [floating.update]);

  // Update reference when open state changes
  React.useEffect(() => {
    if (context.open) {
      updateReference();
      const update = floating.update;
      if (typeof update === "function") {
        update();
      }
    }
  }, [context.open, updateReference, floating.update]);

  // Set reference for floating UI
  React.useEffect(() => {
    if (reference) {
      floating.refs.setReference(reference);
    }
  }, [reference, floating.refs]);

  // Handle scroll updates
  React.useEffect(() => {
    if (!context.open || !reference) return;

    const handleScroll = () => {
      updateReference();
      const update = floating.update;
      if (typeof update === "function") {
        update();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [context.open, reference, updateReference, floating.update]);

  if (!forceMount && !context.open) {
    return null;
  }

  return (
    <Primitive.div
      {...getFloatingProps(positionerProps)}
      data-state={context.open ? "open" : "closed"}
      ref={composedRef}
      style={{
        ...style,
        ...getStyles(),
        // Hide the element if it's not open and force mounted
        ...(!context.open && forceMount ? { visibility: "hidden" } : {}),
      }}
    />
  );
});

ComboboxPositioner.displayName = POSITIONER_NAME;

const Positioner = ComboboxPositioner;

export { ComboboxPositioner, Positioner };
export type { ComboboxPositionerProps };
