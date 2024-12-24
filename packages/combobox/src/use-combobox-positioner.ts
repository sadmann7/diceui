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

interface UseComboboxPositionerParams {
  /** Whether the combobox is open. */
  open: boolean;

  /** Event handler called when the combobox is opened or closed. */
  onOpenChange: (open: boolean) => void;

  /**
   * The preferred placement of the combobox relative to its anchor element.
   * If there is not enough space, it will be adjusted automatically.
   * @default "bottom"
   */
  side?: Side;

  /**
   * The distance between the combobox and its anchor element.
   * This creates a gap between the anchor and combobox.
   * @default 4
   */
  sideOffset?: number;

  /**
   * The alignment of the combobox relative to its anchor element.
   * - 'start': Align with the start edge of the anchor
   * - 'center': Center align with the anchor
   * - 'end': Align with the end edge of the anchor
   * @default "start"
   */
  align?: Align;

  /**
   * The distance from the aligned edge when using align.
   * Allows the combobox to be offset from its default aligned position.
   * @default 0
   */
  alignOffset?: number;

  /**
   * The element or elements that constrain where the combobox can be positioned.
   * By default, this is the viewport (browser window).
   * @default undefined
   */
  collisionBoundary?: Element | Element[] | null;

  /**
   * The amount of padding around the boundary edges for collision detection.
   * This prevents the combobox from touching the edges of its container.
   * @default 0
   */
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;

  /**
   * The padding between the arrow element and the combobox edges.
   * Prevents the arrow from reaching the very edge of the combobox.
   * @default 0
   */
  arrowPadding?: number;

  /**
   * Controls how the combobox responds to scroll events.
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
   * Whether the combobox should automatically adjust its placement to stay in view.
   * When enabled, changes position when there's not enough space in the current placement.
   * @default true
   */
  avoidCollisions?: boolean;

  /**
   * Whether the combobox should be constrained to the viewport dimensions.
   * When true, the combobox will not exceed the browser window width/height.
   * @default false
   */
  fitViewport?: boolean;

  /**
   * Whether the combobox should be mounted in the DOM even when closed.
   * Useful for animations or when you need to measure the combobox before displaying it.
   * @default false
   */
  forceMount?: boolean;

  /**
   * Whether to use a custom anchor element instead of the trigger.
   * When true, allows positioning relative to any element using anchorRef.
   * @default false
   */
  hasCustomAnchor?: boolean;

  /**
   * Whether the combobox should be hidden when it would be positioned outside its boundary.
   * Useful for preventing partially visible comboboxes.
   * @default false
   */
  hideWhenDetached?: boolean;

  /**
   * Whether the combobox should track the trigger element's position changes.
   * When true, updates position on scroll and resize events.
   * @default true
   */
  trackAnchor?: boolean;

  /**
   * Reference to a custom anchor element.
   * Used when hasCustomAnchor is true to position relative to a custom element.
   * @default undefined
   */
  anchorRef?: React.RefObject<HTMLElement | null>;

  /**
   * Reference to the trigger element that opens the combobox.
   * Used as the default reference point for positioning.
   * @default undefined
   */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

interface UseComboboxPositionerReturn {
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
  arrowRef: React.RefObject<HTMLElement | null>;
  renderedSide: "top" | "right" | "bottom" | "left";
  renderedAlign: "start" | "center" | "end";
  arrowDisplaced: boolean;
  anchorHidden: boolean;
}

function useComboboxPositioner({
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
  avoidCollisions = false,
  fitViewport = false,
  forceMount = false,
  hasCustomAnchor = false,
  hideWhenDetached = false,
  trackAnchor = true,
  anchorRef,
  triggerRef,
}: UseComboboxPositionerParams): UseComboboxPositionerReturn {
  const direction = useDirection();
  const arrowRef = React.useRef<HTMLElement | null>(null);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
      }),
    );

    if (hideWhenDetached) {
      middleware.push(hide());
    }

    middleware.push(
      arrow({
        element: arrowRef.current,
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
    arrowRef,
  ]);

  const autoUpdateOptions = React.useMemo(
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

    const reference =
      hasCustomAnchor && anchorRef?.current
        ? anchorRef.current
        : triggerRef?.current;

    if (reference) {
      refs.setReference(reference);
      update();
    }
  }, [open, hasCustomAnchor, anchorRef, triggerRef, refs, update]);

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
    const longhand = {
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
    [placementSide, placementAlign],
  );

  const floatingStyles = React.useMemo(
    () =>
      ({
        position: floatingStrategy,
        top: y ?? 0,
        left: x ?? 0,
        [VAR_TRANSFORM_ORIGIN]: transformOrigin,
      }) as const,
    [floatingStrategy, x, y, transformOrigin],
  );

  const arrowStyles = React.useMemo(
    () => ({
      position: "absolute" as const,
      top: middlewareData.arrow?.y,
      left: middlewareData.arrow?.x,
    }),
    [middlewareData.arrow],
  );

  console.log({ arrowMiddlewareData: middlewareData.arrow, arrowStyles });

  const arrowDisplaced = middlewareData.arrow?.centerOffset !== 0;
  const anchorHidden = !!middlewareData.hide?.referenceHidden;

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
      arrowRef: arrowRef ?? { current: null },
      renderedSide: placementSide,
      renderedAlign: placementAlign,
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
    ],
  );

  return positionerContext;
}

export { useComboboxPositioner };

export type { UseComboboxPositionerParams, UseComboboxPositionerReturn };
