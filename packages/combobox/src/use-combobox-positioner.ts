import { useDirection } from "@diceui/shared";
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
import * as React from "react";

interface UseComboboxPositionerParams {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
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
  arrowRef?: React.RefObject<HTMLDivElement | null>;
}

interface UseComboboxPositionerReturn {
  floating: {
    refs: {
      setFloating: (node: HTMLElement | null) => void;
      setReference: (node: Element | VirtualElement | null) => void;
    };
    floatingStyles: React.CSSProperties;
    placement: Placement;
    isPositioned: boolean;
    middlewareData: {
      arrow?: { x?: number; y?: number };
      hide?: { referenceHidden?: boolean };
      size?: { availableWidth?: number; availableHeight?: number };
    };
  };
  getFloatingProps: (
    userProps?: React.HTMLAttributes<HTMLElement>,
  ) => Record<string, unknown>;
  getStyles: () => React.CSSProperties & {
    "--dice-combobox-content-transform-origin": string;
    "--dice-combobox-content-available-width"?: string;
    "--dice-combobox-content-available-height"?: string;
    "--dice-combobox-content-anchor-width"?: string;
    "--dice-combobox-content-anchor-height"?: string;
  };
}

export function useComboboxPositioner({
  open,
  onOpenChange,
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
  arrowRef,
}: UseComboboxPositionerParams): UseComboboxPositionerReturn {
  const direction = useDirection();

  // Handle RTL and side placement
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
            apply({ availableHeight, availableWidth, elements }) {
              Object.assign(elements.floating.style, {
                maxHeight: `${availableHeight}px`,
                maxWidth: `${availableWidth}px`,
              });
            },
          }),
        );
      }
    }

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

  const floating = useFloating({
    open,
    onOpenChange,
    placement,
    middleware,
    whileElementsMounted: autoUpdate,
    strategy,
  });

  const { placement: placementProp, middlewareData } = floating;

  // Calculate transform origin based on placement
  const [placementSide, placementAlign] = placementProp.split("-");

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
    (userProps: React.HTMLAttributes<HTMLElement> = {}) => ({
      ...userProps,
      "data-side": placementSide,
      "data-align": placementAlign,
    }),
    [placementSide, placementAlign],
  );

  const getStyles = React.useCallback(() => {
    const {
      size: { width: anchorWidth, height: anchorHeight } = {},
      dimensions: { width: availableWidth, height: availableHeight } = {},
    } = middlewareData;

    const styles: ReturnType<UseComboboxPositionerReturn["getStyles"]> = {
      ...floating.floatingStyles,
      "--dice-combobox-content-transform-origin": transformOrigin,
    };

    if (availableWidth) {
      styles["--dice-combobox-content-available-width"] = `${availableWidth}px`;
    }
    if (availableHeight) {
      styles["--dice-combobox-content-available-height"] =
        `${availableHeight}px`;
    }
    if (anchorWidth) {
      styles["--dice-combobox-content-anchor-width"] = `${anchorWidth}px`;
    }
    if (anchorHeight) {
      styles["--dice-combobox-content-anchor-height"] = `${anchorHeight}px`;
    }

    return styles;
  }, [floating.floatingStyles, transformOrigin, middlewareData]);

  return {
    floating,
    getFloatingProps,
    getStyles,
  };
}

export type { UseComboboxPositionerParams, UseComboboxPositionerReturn };
