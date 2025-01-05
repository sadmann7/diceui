import {
  type AutoUpdateOptions,
  type Boundary,
  type FloatingContext,
  type Middleware,
  type Placement,
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
import {
  VAR_ANCHOR_HEIGHT,
  VAR_ANCHOR_WIDTH,
  VAR_AVAILABLE_HEIGHT,
  VAR_AVAILABLE_WIDTH,
  VAR_TRANSFORM_ORIGIN,
} from "../constants";
import type { Align, Side } from "../types";
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

  /**
   * Reference to the anchor element.
   * Can be either a VirtualElement or React ref to an HTMLElement element.
   */
  anchorRef?: React.RefObject<HTMLElement | null> | VirtualElement | null;

  /**
   * The preferred placement of the popover relative to its anchor element.
   * If there is not enough space, it will be adjusted automatically.
   * - 'top': Position the popover above the anchor
   * - 'right': Position the popover to the right of the anchor
   * - 'bottom': Position the popover below the anchor
   * - 'left': Position the popover to the left of the anchor
   * @default "bottom"
   */
  side?: Side;

  /**
   * The distance in pixels from the anchor element to the popover.
   * This creates a gap between the anchor and popover.
   * @default 4
   */
  sideOffset?: number;

  /**
   * The alignment of the popover relative to its anchor element.
   * - 'start': Align with the start edge of the anchor
   * - 'center': Center align with the anchor
   * - 'end': Align with the end edge of the anchor
   * @default "start"
   */
  align?: Align;

  /**
   * The distance in pixels from the aligned edge when using align.
   * Allows the popover to be offset from its default aligned position.
   * @default 0
   */
  alignOffset?: number;

  /**
   * The element or elements that constrain where the popover can be positioned.
   * By default, this is the viewport (browser window).
   */
  collisionBoundary?: Boundary;

  /**
   * The amount of padding around the boundary edges for collision detection.
   * This prevents the popover from touching the edges of its container.
   * @default 0
   */
  collisionPadding?: number | Partial<Record<Side, number>>;

  /**
   * The padding between the arrow element and the popover edges.
   * Prevents the arrow from reaching the very edge of the popover.
   * @default 0
   */
  arrowPadding?: number;

  /**
   * Controls how the popover responds to scroll events.
   * - 'partial': Allows partial visibility when scrolling
   * - 'always': Maintains full visibility by shifting position
   * @default "partial"
   */
  sticky?: "partial" | "always";

  /**
   * The positioning strategy to use.
   * - 'absolute': Position relative to closest positioned ancestor
   * - 'fixed': Position relative to viewport
   * @default "absolute"
   */
  strategy?: Strategy;

  /**
   * Whether the popover should automatically adjust its placement to stay in view.
   * When enabled, changes position when there's not enough space in the current placement.
   * @default true
   */
  avoidCollisions?: boolean;

  /**
   * Whether to disable the floating pointer/indicator.
   * When true, the pointer will not be rendered and pointer middleware will not be added.
   * @default false
   */
  disableArrow?: boolean;

  /**
   * Whether the popover should be constrained to the viewport dimensions.
   * When true, the popover will not exceed the browser window width/height.
   * @default false
   */
  fitViewport?: boolean;

  /**
   * Whether the popover should be mounted in the DOM even when closed.
   * Useful for animations or when you need to measure the popover before displaying it.
   * @default false
   */
  forceMount?: boolean;

  /**
   * Whether the popover should be hidden when it would be positioned outside its boundary.
   * Useful for preventing partially visible popovers.
   * @default false
   */
  hideWhenDetached?: boolean;

  /**
   * Whether the popover should track the anchor element's position changes.
   * When true, updates position on scroll and resize events.
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
  avoidCollisions = false,
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

    isVirtualAnchor
      ? refs.setPositionReference(anchor)
      : refs.setReference(anchor);
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

export { useAnchorPositioner };

export type { AnchorPositionerProps };
