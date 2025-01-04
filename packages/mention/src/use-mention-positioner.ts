import {
  type Align,
  VAR_ANCHOR_HEIGHT,
  VAR_ANCHOR_WIDTH,
  VAR_AVAILABLE_HEIGHT,
  VAR_AVAILABLE_WIDTH,
  VAR_TRANSFORM_ORIGIN,
  useDirection,
  useIsomorphicLayoutEffect,
} from "@diceui/shared";
import {
  type Boundary,
  type FloatingContext,
  type Middleware,
  type Placement,
  type Side,
  type Strategy,
  type UseFloatingReturn,
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
import * as React from "react";

interface UseMentionPositionerProps {
  /** Whether the mention menu is open. */
  open: boolean;

  /** Event handler called when the mention menu is opened or closed. */
  onOpenChange: (open: boolean) => void;

  /** The preferred side of the anchor to place the mention menu. */
  side?: Side;

  /** The distance in pixels from the anchor */
  sideOffset?: number;

  /** The preferred alignment against the anchor. */
  align?: Align;

  /** The distance in pixels from the aligned edge. */
  alignOffset?: number;

  /** Elements that constrain the positioning. */
  collisionBoundary?: Element | Element[] | null;

  /** Padding between the mention menu and the boundary edges. */
  collisionPadding?: number | Partial<Record<Side, number>>;

  /** Padding between the arrow and the mention menu edges. */
  arrowPadding?: number;

  /** How the mention menu responds to scroll. */
  sticky?: "partial" | "always";

  /** The positioning strategy to use. */
  strategy?: Strategy;

  /** Whether to automatically adjust placement. */
  avoidCollisions?: boolean;

  /** Whether to constrain the mention menu to viewport. */
  fitViewport?: boolean;

  /** Whether to mount the mention menu even when closed. */
  forceMount?: boolean;

  /** Whether to hide when detached. */
  hideWhenDetached?: boolean;

  /** Whether to track the anchor position. */
  trackAnchor?: boolean;

  /** Reference to the trigger element. */
  triggerRef?: React.RefObject<HTMLInputElement | null>;

  /** Virtual anchor for positioning. Must be used with `setPositionReference`. */
  virtualAnchor?: VirtualElement | null;
}

interface UseMentionPositionerReturn {
  refs: UseFloatingReturn["refs"];
  floatingStyles: React.CSSProperties;
  placement: Placement;
  isPositioned: boolean;
  middlewareData: UseFloatingReturn["middlewareData"];
  elements: UseFloatingReturn["elements"];
  update: () => void;
  context: FloatingContext;
  getFloatingProps: (
    floatingProps?: React.HTMLAttributes<HTMLElement>
  ) => Record<string, unknown>;
  arrowStyles: React.CSSProperties;
  onArrowChange: (arrow: HTMLElement | null) => void;
  side: Side;
  align: Align;
  arrowDisplaced: boolean;
  anchorHidden: boolean;
}

function useMentionPositioner({
  open,
  onOpenChange,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  collisionBoundary,
  collisionPadding,
  arrowPadding = 0,
  sticky = "partial",
  strategy = "absolute",
  avoidCollisions = true,
  fitViewport = false,
  forceMount = false,
  hideWhenDetached = false,
  trackAnchor = true,
  triggerRef,
  virtualAnchor,
}: UseMentionPositionerProps): UseMentionPositionerReturn {
  const direction = useDirection();
  const [positionerArrow, setPositionerArrow] =
    React.useState<HTMLElement | null>(null);

  const placement = React.useMemo((): Placement => {
    const rtlAlign =
      direction === "rtl"
        ? align === "start"
          ? "end"
          : align === "end"
          ? "start"
          : "center"
        : align;
    return `${side}-${rtlAlign}` as Placement;
  }, [align, direction, side]);

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
        })
      );

      middleware.push(
        shift({
          boundary: collisionBoundary as Boundary | undefined,
          padding: collisionPadding || 0,
          limiter: sticky === "partial" ? limitShift() : undefined,
        })
      );
    }

    middleware.push(
      size({
        padding: collisionPadding || 0,
        apply({
          elements: { floating },
          rects: { reference },
          availableWidth,
          availableHeight,
        }) {
          for (const [key, value] of Object.entries({
            [VAR_AVAILABLE_WIDTH]: `${availableWidth}px`,
            [VAR_AVAILABLE_HEIGHT]: `${availableHeight}px`,
            [VAR_ANCHOR_WIDTH]: `${reference.width}px`,
            [VAR_ANCHOR_HEIGHT]: `${reference.height}px`,
          })) {
            floating.style.setProperty(key, value);
          }

          if (fitViewport) {
            Object.assign(floating.style, {
              maxHeight: `${availableHeight}px`,
              maxWidth: `${availableWidth}px`,
            });
          }
        },
      })
    );

    if (hideWhenDetached) {
      middleware.push(hide());
    }

    middleware.push(
      arrow({
        element: positionerArrow,
        padding: arrowPadding,
      })
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
    positionerArrow,
  ]);

  const autoUpdateOptions = React.useMemo(
    () => ({
      ancestorScroll: trackAnchor,
      ancestorResize: true,
      elementResize: trackAnchor && typeof ResizeObserver !== "undefined",
      layoutShift: trackAnchor && typeof IntersectionObserver !== "undefined",
      animationFrame: true,
    }),
    [trackAnchor]
  );

  const {
    x,
    y,
    refs,
    strategy: floatingStrategy,
    context,
    placement: floatingPlacement,
    middlewareData,
    isPositioned,
    update,
    elements,
  } = useFloating({
    open,
    onOpenChange,
    placement,
    middleware,
    whileElementsMounted: (...args) => autoUpdate(...args, autoUpdateOptions),
    strategy,
  });

  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    if (virtualAnchor) {
      refs.setPositionReference(virtualAnchor);
    } else if (triggerRef?.current) {
      refs.setPositionReference(triggerRef.current);
    }

    requestAnimationFrame(update);
  }, [open, triggerRef, virtualAnchor, refs, update]);

  React.useEffect(() => {
    if (!open || !trackAnchor) return;

    const handleScroll = () => {
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open, update, trackAnchor]);

  React.useEffect(() => {
    if (forceMount && open && elements.reference && elements.floating) {
      return autoUpdate(
        elements.reference,
        elements.floating,
        update,
        autoUpdateOptions
      );
    }
    return undefined;
  }, [forceMount, open, elements, update, autoUpdateOptions]);

  const [placementSide = "bottom", placementAlign = "start"] =
    floatingPlacement.split("-") as [Side?, Align?];

  const transformOrigin = React.useMemo(() => {
    const longhand: Record<Side, Side> = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    };

    const oppositeSide = longhand[placementSide];
    const oppositeAlign =
      placementAlign === "end"
        ? "start"
        : placementAlign === "start"
        ? "end"
        : "center";

    return `${oppositeAlign} ${oppositeSide}`;
  }, [placementSide, placementAlign]);

  const getFloatingProps = React.useCallback(
    (floatingProps: React.HTMLAttributes<HTMLElement> = {}) => ({
      ...floatingProps,
      "data-side": placementSide,
      "data-align": placementAlign,
    }),
    [placementSide, placementAlign]
  );

  const floatingStyles = React.useMemo(
    () =>
      ({
        position: floatingStrategy,
        top: y ?? 0,
        left: x ?? 0,
        [VAR_TRANSFORM_ORIGIN]: transformOrigin,
      } as const),
    [floatingStrategy, x, y, transformOrigin]
  );

  const anchorHidden = !!middlewareData.hide?.referenceHidden;

  const arrowDisplaced = middlewareData.arrow?.centerOffset !== 0;

  const arrowStyles = React.useMemo<React.CSSProperties>(
    () => ({
      position: "absolute",
      top: middlewareData.arrow?.y,
      left: middlewareData.arrow?.x,
      [placementSide]: 0,
      transformOrigin,
      transform: {
        top: "translateY(100%)",
        right: "translateY(50%) rotate(90deg) translateX(-50%)",
        bottom: "rotate(180deg)",
        left: "translateY(50%) rotate(-90deg) translateX(50%)",
      }[placementSide],
    }),
    [middlewareData.arrow, placementSide, transformOrigin]
  );

  const positionerContext = React.useMemo(
    () => ({
      refs,
      floatingStyles,
      placement: floatingPlacement,
      isPositioned,
      middlewareData,
      elements,
      update,
      context,
      getFloatingProps,
      arrowStyles,
      onArrowChange: setPositionerArrow,
      side: placementSide,
      align: placementAlign,
      arrowDisplaced,
      anchorHidden,
    }),
    [
      refs,
      floatingStyles,
      floatingPlacement,
      isPositioned,
      middlewareData,
      elements,
      update,
      context,
      getFloatingProps,
      arrowStyles,
      placementSide,
      placementAlign,
      arrowDisplaced,
      anchorHidden,
    ]
  );

  return positionerContext;
}

export { useMentionPositioner };

export type { UseMentionPositionerProps };
