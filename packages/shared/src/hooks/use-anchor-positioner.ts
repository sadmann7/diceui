import {
  arrow,
  autoUpdate,
  type AutoUpdateOptions,
  type Boundary,
  flip,
  type FloatingContext,
  hide,
  inline,
  limitShift,
  offset,
  type Placement,
  shift,
  size,
  type Strategy,
  useFloating,
  type UseFloatingReturn,
  type VirtualElement,
} from "@floating-ui/react";
import * as React from "react";

import type { Align, Side } from "../types";

import {
  VAR_ANCHOR_HEIGHT,
  VAR_ANCHOR_WIDTH,
  VAR_AVAILABLE_HEIGHT,
  VAR_AVAILABLE_WIDTH,
  VAR_TRANSFORM_ORIGIN,
} from "../constants";
import { useDirection } from "./use-direction";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

const LONGHAND_SIDES: Record<Side, Side> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
} as const;

const ARROW_TRANSFORMS: Record<Side, string> = {
  top: "translateY(100%)",
  right: "translateY(50%) rotate(90deg) translateX(-50%)",
  bottom: "rotate(180deg)",
  left: "translateY(50%) rotate(-90deg) translateX(50%)",
} as const;

function isValidNumber(value: unknown): value is number {
  return (
    typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value)
  );
}

interface UseAnchorPositionerProps {
  /** Whether the popover is open. */
  open: boolean;

  /** Event handler called when the popover is opened or closed. */
  onOpenChange: (open: boolean) => void;

  /** The anchor element, as a ref or a virtual element. */
  anchorRef?: React.RefObject<HTMLElement | null> | VirtualElement | null;

  /**
   * The preferred side of the anchor to render against, flipped when there is not enough space.
   * @default "bottom"
   */
  side?: Side;

  /**
   * The distance in pixels from the anchor element to the popover.
   * @default 4
   */
  sideOffset?: number;

  /**
   * The alignment of the popover relative to its anchor element.
   * @default "start"
   */
  align?: Align;

  /**
   * The offset in pixels from the aligned edge.
   * @default 0
   */
  alignOffset?: number;

  /** The element or elements that constrain where the popover can be positioned, the viewport by default. */
  collisionBoundary?: Boundary;

  /**
   * The padding around the boundary edges for collision detection.
   * @default 0
   */
  collisionPadding?: number | Partial<Record<Side, number>>;

  /**
   * The padding between the arrow element and the popover edges.
   * @default 0
   */
  arrowPadding?: number;

  /**
   * Whether the popover may go partially out of view or always shifts to stay fully visible.
   * @default "partial"
   */
  sticky?: "partial" | "always";

  /**
   * The CSS positioning strategy to use.
   * @default "absolute"
   */
  strategy?: Strategy;

  /**
   * Whether the popover should change its placement to stay in view.
   * @default true
   */
  avoidCollisions?: boolean;

  /**
   * Whether to skip rendering and positioning the arrow.
   * @default false
   */
  disableArrow?: boolean;

  /**
   * Whether the popover should be constrained to the viewport dimensions.
   * @default false
   */
  fitViewport?: boolean;

  /**
   * Whether the popover should stay mounted in the DOM when closed.
   * @default false
   */
  forceMount?: boolean;

  /**
   * Whether the popover should be hidden when its anchor is outside the boundary.
   * @default false
   */
  hideWhenDetached?: boolean;

  /**
   * Whether the popover should follow the anchor on scroll and resize.
   * @default true
   */
  trackAnchor?: boolean;
}

type AnchorPositionerProps = Omit<
  UseAnchorPositionerProps,
  "open" | "onOpenChange" | "anchorRef" | "disableArrow"
>;

interface UseAnchorPositionerReturn {
  refs: UseFloatingReturn["refs"];
  floatingStyles: React.CSSProperties;
  placement: Placement;
  isPositioned: boolean;
  middlewareData: UseFloatingReturn["middlewareData"];
  elements: UseFloatingReturn["elements"];
  update: () => void;
  context: FloatingContext;
  getFloatingProps: (
    floatingProps?: React.HTMLAttributes<HTMLElement>,
  ) => Record<string, unknown>;
  arrowStyles: React.CSSProperties;
  onArrowChange: (arrow: HTMLElement | null) => void;
  side: Side;
  align: Align;
  arrowDisplaced: boolean;
  anchorHidden: boolean;
}

function useAnchorPositioner({
  open,
  onOpenChange,
  anchorRef,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  collisionBoundary,
  collisionPadding = 0,
  arrowPadding = 0,
  sticky = "partial",
  strategy = "absolute",
  avoidCollisions = true,
  disableArrow = false,
  fitViewport = false,
  forceMount = false,
  hideWhenDetached = false,
  trackAnchor = true,
}: UseAnchorPositionerProps): UseAnchorPositionerReturn {
  const direction = useDirection();
  const [positionerArrow, setPositionerArrow] =
    React.useState<HTMLElement | null>(null);

  const rtlAlign = React.useMemo(() => {
    if (direction !== "rtl") return align;
    return align === "start" ? "end" : align === "end" ? "start" : "center";
  }, [align, direction]);

  const placement = React.useMemo<Placement>(
    () => `${side}-${rtlAlign}` as Placement,
    [side, rtlAlign],
  );

  const baseMiddleware = React.useMemo(
    () => [
      offset({
        mainAxis: sideOffset,
        alignmentAxis: alignOffset,
      }),
      inline(),
    ],
    [sideOffset, alignOffset],
  );

  const collisionMiddleware = React.useMemo(
    () =>
      avoidCollisions
        ? [
            flip({
              boundary: collisionBoundary,
              padding: collisionPadding,
              fallbackStrategy:
                sticky === "partial" ? "bestFit" : "initialPlacement",
            }),
            shift({
              boundary: collisionBoundary,
              padding: collisionPadding,
              limiter: sticky === "partial" ? limitShift() : undefined,
            }),
          ]
        : [],
    [avoidCollisions, collisionBoundary, collisionPadding, sticky],
  );

  const sizeMiddleware = React.useMemo(
    () => [
      size({
        padding: collisionPadding,
        apply({
          elements: { floating },
          rects: { reference },
          availableWidth,
          availableHeight,
        }) {
          const styles = {
            [VAR_AVAILABLE_WIDTH]: `${availableWidth}px`,
            [VAR_AVAILABLE_HEIGHT]: `${availableHeight}px`,
            [VAR_ANCHOR_WIDTH]: `${reference.width}px`,
            [VAR_ANCHOR_HEIGHT]: `${reference.height}px`,
          };

          for (const [key, value] of Object.entries(styles)) {
            floating.style.setProperty(key, value);
          }

          if (fitViewport) {
            Object.assign(floating.style, {
              maxHeight: `${availableHeight}px`,
              maxWidth: `${availableWidth}px`,
            });
          }
        },
      }),
    ],
    [collisionPadding, fitViewport],
  );

  const arrowMiddleware = React.useMemo(
    () =>
      !disableArrow && positionerArrow
        ? [
            arrow({
              element: positionerArrow,
              padding: arrowPadding,
            }),
          ]
        : [],
    [disableArrow, positionerArrow, arrowPadding],
  );

  const middleware = React.useMemo(
    () => [
      ...baseMiddleware,
      ...collisionMiddleware,
      ...sizeMiddleware,
      ...(hideWhenDetached ? [hide()] : []),
      ...arrowMiddleware,
    ],
    [
      baseMiddleware,
      collisionMiddleware,
      sizeMiddleware,
      hideWhenDetached,
      arrowMiddleware,
    ],
  );

  const autoUpdateOptions = React.useMemo<AutoUpdateOptions>(
    () => ({
      ancestorScroll: trackAnchor,
      ancestorResize: true,
      elementResize: trackAnchor && typeof ResizeObserver !== "undefined",
      layoutShift: trackAnchor && typeof IntersectionObserver !== "undefined",
    }),
    [trackAnchor],
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
    whileElementsMounted: forceMount
      ? undefined
      : (...args) => autoUpdate(...args, autoUpdateOptions),
    strategy,
  });

  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    const isVirtualAnchor = anchorRef && "getBoundingClientRect" in anchorRef;

    const anchor = isVirtualAnchor ? anchorRef : anchorRef?.current;

    if (!anchor) return;

    if (isVirtualAnchor) {
      refs.setPositionReference(anchor);
    } else {
      refs.setReference(anchor);
    }
    update();
  }, [open, anchorRef, refs, update]);

  React.useEffect(() => {
    if (forceMount && open && elements.reference && elements.floating) {
      return autoUpdate(
        elements.reference,
        elements.floating,
        update,
        autoUpdateOptions,
      );
    }
    return undefined;
  }, [forceMount, open, elements, update, autoUpdateOptions]);

  const [placementSide = "bottom", placementAlign = "start"] =
    floatingPlacement.split("-") as [Side?, Align?];

  const transformOrigin = React.useMemo(() => {
    const oppositeSide = LONGHAND_SIDES[placementSide];
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
    [placementSide, placementAlign],
  );

  const floatingStyles = React.useMemo(() => {
    const validY = isValidNumber(y) ? y : 0;
    const validX = isValidNumber(x) ? x : 0;

    return {
      position: floatingStrategy,
      top: validY,
      left: validX,
      [VAR_TRANSFORM_ORIGIN]: transformOrigin,
    } as const;
  }, [floatingStrategy, x, y, transformOrigin]);

  const anchorHidden = !!middlewareData.hide?.referenceHidden;
  const arrowDisplaced = disableArrow
    ? false
    : middlewareData.arrow?.centerOffset !== 0;

  const arrowStyles = React.useMemo<React.CSSProperties>(() => {
    if (disableArrow) return {};

    return {
      position: "absolute" as const,
      top: middlewareData.arrow?.y,
      left: middlewareData.arrow?.x,
      [placementSide]: 0,
      transformOrigin,
      transform: ARROW_TRANSFORMS[placementSide],
    };
  }, [middlewareData.arrow, placementSide, transformOrigin, disableArrow]);

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
      onArrowChange: disableArrow ? () => {} : setPositionerArrow,
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
      disableArrow,
    ],
  );

  return positionerContext;
}

export type { AnchorPositionerProps };
export { useAnchorPositioner };
