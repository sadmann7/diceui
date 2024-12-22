import { useComposedRefs, useDirection, useScrollLock } from "@diceui/shared";
import {
  type Boundary,
  type Middleware,
  type Placement,
  type VirtualElement,
  arrow,
  autoUpdate,
  flip,
  hide,
  inline,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const POSITIONER_NAME = "ComboboxPositioner";

interface ComboboxPositionerProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  forceMount?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Array<Element>;
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  arrowPadding?: number;
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  fitViewport?: boolean;
  strategy?: "absolute" | "fixed";
}

interface FloatingStyles extends React.CSSProperties {
  "--dice-combobox-content-transform-origin"?: string;
  "--dice-combobox-content-available"?: string;
  "--dice-combobox-content-side"?: string;
  "--dice-combobox-content-align"?: string;
  "--dice-combobox-content-arrow-x"?: string;
  "--dice-combobox-content-arrow-y"?: string;
}

const ComboboxPositioner = React.forwardRef<
  HTMLDivElement,
  ComboboxPositionerProps
>((props, forwardedRef) => {
  const {
    forceMount = false,
    side: initialSide = "bottom",
    sideOffset = 4,
    align: initialAlign = "start",
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
  const direction = useDirection();
  const arrowRef = React.useRef<HTMLDivElement>(null);

  // Handle RTL and side placement
  const placement = React.useMemo((): Placement => {
    const rtlAlign =
      direction === "rtl"
        ? initialAlign === "start"
          ? "end"
          : initialAlign === "end"
            ? "start"
            : "center"
        : initialAlign;
    return `${initialSide}-${rtlAlign}` as Placement;
  }, [initialAlign, direction, initialSide]);

  // Create middleware array based on props
  const middleware = React.useMemo(() => {
    const middleware: Middleware[] = [
      offset({
        mainAxis: sideOffset,
        alignmentAxis: alignOffset,
      }),
      inline(),
    ];

    if (avoidCollisions) {
      middleware.push(
        flip({
          boundary: collisionBoundary as Boundary | undefined,
          padding: collisionPadding || 0,
          fallbackStrategy:
            sticky === "partial" ? "bestFit" : "initialPlacement",
        }),
      );

      middleware.push(
        shift({
          boundary: collisionBoundary as Boundary | undefined,
          padding: collisionPadding || 0,
          limiter: sticky === "partial" ? limitShift() : undefined,
        }),
      );

      if (fitViewport) {
        middleware.push(
          size({
            padding: collisionPadding || 0,
            apply({ availableHeight, elements }) {
              Object.assign(elements.floating.style, {
                maxHeight: `${availableHeight}px`,
              });
            },
          }),
        );
      }
    }

    if (hideWhenDetached) {
      middleware.push(hide());
    }

    middleware.push(
      arrow({
        element: arrowRef,
        padding: arrowPadding,
      }),
    );

    return middleware;
  }, [
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    hideWhenDetached,
    fitViewport,
  ]);

  const {
    refs: { setFloating, setReference },
    floatingStyles,
    placement: actualPlacement,
    middlewareData: {
      arrow: { x: arrowX, y: arrowY } = {},
      hide: { referenceHidden } = {},
    },
    isPositioned,
  } = useFloating({
    open: context.open,
    onOpenChange: context.onOpenChange,
    placement,
    middleware,
    whileElementsMounted: autoUpdate,
    strategy,
  });

  // Calculate transform origin based on placement
  const [placementSide, placementAlign] = actualPlacement.split("-") as [
    string,
    string | undefined,
  ];
  const transformOrigin = React.useMemo(() => {
    const longhand = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    };

    const oppositeSide = longhand[placementSide as keyof typeof longhand];
    const oppositeAlign =
      placementAlign === "end"
        ? "start"
        : placementAlign === "start"
          ? "end"
          : "center";

    return `${oppositeAlign} ${oppositeSide}`;
  }, [placementSide, placementAlign]);

  const composedRef = useComposedRefs(
    forwardedRef,
    context.contentRef,
    (node) => setFloating(node),
  );

  const composedStyles = React.useMemo(() => {
    const baseStyles: FloatingStyles = {
      ...floatingStyles,
      ...(!isPositioned && hideWhenDetached
        ? { visibility: "hidden" as const }
        : {}),
      ...style,
      "--dice-combobox-content-transform-origin": transformOrigin,
      "--dice-combobox-content-available": referenceHidden ? "0" : "1",
      "--dice-combobox-content-side": placementSide,
      "--dice-combobox-content-align": placementAlign || "",
    };

    // Add arrow positioning if available
    if (typeof arrowX === "number") {
      baseStyles["--dice-combobox-content-arrow-x"] = `${arrowX}px`;
    }
    if (typeof arrowY === "number") {
      baseStyles["--dice-combobox-content-arrow-y"] = `${arrowY}px`;
    }

    return baseStyles;
  }, [
    floatingStyles,
    isPositioned,
    hideWhenDetached,
    style,
    transformOrigin,
    referenceHidden,
    placementSide,
    placementAlign,
    arrowX,
    arrowY,
  ]);

  useScrollLock({
    enabled: context.modal,
    referenceElement: context.contentRef.current,
  });

  React.useEffect(() => {
    if (context.inputRef.current) {
      // Support both DOM elements and virtual elements
      const reference = context.inputRef.current as Element | VirtualElement;
      setReference(reference);
    }
  }, [context.inputRef, setReference]);

  if (!forceMount && !context.open) {
    return null;
  }

  return (
    <Primitive.div
      data-state={context.open ? "open" : "closed"}
      data-side={placementSide}
      data-align={placementAlign}
      {...positionerProps}
      ref={composedRef}
      style={composedStyles}
    />
  );
});

ComboboxPositioner.displayName = POSITIONER_NAME;

const Positioner = ComboboxPositioner;

export { ComboboxPositioner, Positioner };
export type { ComboboxPositionerProps };
