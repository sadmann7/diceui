import type { EmptyProps, Orientation, RenderProps } from "@/types";

export interface CompareSliderProps
  extends EmptyProps<"div", "defaultValue" | "value" | "onValueChange">,
    RenderProps {
  /**
   * The position of the slider as a percentage (0-100).
   * @default 50
   */
  value?: number;

  /**
   * The default position of the slider as a percentage (0-100).
   * @default 50
   */
  defaultValue?: number;

  /**
   * Callback fired when the slider position changes.
   */
  onValueChange?: (value: number) => void;

  /**
   * The interaction mode for the slider.
   * - "drag": Requires clicking and dragging to change the value
   * - "hover": Updates the value as the pointer moves over the slider
   * @default "drag"
   */
  interaction?: "hover" | "drag";

  /**
   * The orientation of the slider.
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * The step size for keyboard navigation.
   * @default 1
   */
  step?: number;
}

export interface CompareSliderBeforeProps extends RenderProps {
  /**
   * Label for the "before" side.
   *
   * ```ts
   * label="Before"
   * ```
   */
  label?: string;
}

export interface CompareSliderAfterProps extends RenderProps {
  /**
   * Label for the "after" side.
   *
   * ```ts
   * label="After"
   * ```
   */
  label?: string;
}

export interface CompareSliderHandleProps extends RenderProps {}

export interface CompareSliderLabelProps extends RenderProps {
  /**
   * The side this label is for.
   *
   * ```ts
   * // For the "before" side
   * <CompareSliderLabel side="before" />
   *
   * // For the "after" side
   * <CompareSliderLabel side="after" />
   * ```
   */
  side?: "before" | "after";
}
