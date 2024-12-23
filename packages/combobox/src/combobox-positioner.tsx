import { createContext, useComposedRefs, useScrollLock } from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";
import type {
  Align,
  Side,
  UseComboboxPositionerParams,
} from "./use-combobox-positioner";
import { useComboboxPositioner } from "./use-combobox-positioner";

const POSITIONER_NAME = "ComboboxPositioner";

interface ComboboxPositionerContextValue {
  arrowRef: React.RefObject<SVGSVGElement | null>;
  side: Side;
  align: Align;
  arrowUncentered: boolean;
  arrowStyles: React.CSSProperties;
  forceMount: boolean;
}

const [ComboboxPositionerProvider, useComboboxPositionerContext] =
  createContext<ComboboxPositionerContextValue>(POSITIONER_NAME);

interface ComboboxPositionerProps
  extends Omit<UseComboboxPositionerParams, "open" | "onOpenChange">,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the positioner should always be mounted.
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
    hasCustomAnchor: context.hasCustomAnchor,
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
    referenceElement: context.listRef.current,
    enabled: context.open && context.modal,
  });

  if (!forceMount && !context.open) {
    return null;
  }

  const content = (
    <ComboboxPositionerProvider
      arrowRef={positionerContext.arrowRef}
      side={side}
      align={align}
      arrowUncentered={positionerContext.arrowUncentered}
      arrowStyles={positionerContext.arrowStyles}
      forceMount={forceMount}
    >
      <Primitive.div
        data-state={context.open ? "open" : "closed"}
        {...positionerContext.getFloatingProps(positionerProps)}
        ref={composedRef}
        style={composedStyle}
      />
    </ComboboxPositionerProvider>
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

export { ComboboxPositioner, Positioner, useComboboxPositionerContext };

export type { ComboboxPositionerProps };
