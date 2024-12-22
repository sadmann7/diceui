import {
  VAR_ANCHOR_HEIGHT,
  VAR_ANCHOR_WIDTH,
  VAR_AVAILABLE_HEIGHT,
  VAR_AVAILABLE_WIDTH,
  VAR_TRANSFORM_ORIGIN,
  useDirection,
} from "@diceui/shared";
import {
  type Boundary,
  type FloatingContext,
  type Middleware,
  type Placement,
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  collisionBoundary?: Element | Element[] | null;
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  arrowPadding?: number;
  sticky?: "partial" | "always";
  fitViewport?: boolean;
  strategy?: Strategy;
  arrowRef?: React.RefObject<HTMLDivElement | null>;
  anchorRef?: React.RefObject<HTMLElement | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
  avoidCollisions?: boolean;
  forceMount?: boolean;
  hasCustomAnchor?: boolean;
  hideWhenDetached?: boolean;
  trackAnchor?: boolean;
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
  arrowRef,
  anchorRef,
  triggerRef,
  avoidCollisions = false,
  fitViewport = false,
  forceMount = false,
  hasCustomAnchor = false,
  hideWhenDetached = false,
  trackAnchor = true,
}: UseComboboxPositionerParams): UseComboboxPositionerReturn {
  const direction = useDirection();

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

    if (arrowRef?.current) {
      middleware.push(
        arrow({
          element: arrowRef.current,
          padding: arrowPadding,
        }),
      );
    }

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

  React.useEffect(() => {
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

  const [placementSide, placementAlign] = floatingPlacement.split("-");

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

  return {
    refs,
    floatingStyles,
    placement: floatingPlacement,
    isPositioned,
    middlewareData,
    elements,
    update,
    context,
    getFloatingProps,
  };
}

export { useComboboxPositioner };

export type { UseComboboxPositionerParams, UseComboboxPositionerReturn };
