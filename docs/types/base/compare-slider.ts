import type { useRender } from "@base-ui/react/use-render";
import type { EmptyProps, Orientation } from "@/types";

export interface CompareSliderProps
  extends EmptyProps<"div", "defaultValue" | "value" | "onValueChange">,
    useRender.ComponentProps<"div"> {
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

export interface CompareSliderBeforeProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {
  /**
   * Label for the "before" side.
   *
   * ```ts
   * label="Before"
   * ```
   */
  label?: string;
}

export interface CompareSliderAfterProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {
  /**
   * Label for the "after" side.
   *
   * ```ts
   * label="After"
   * ```
   */
  label?: string;
}

export interface CompareSliderHandleProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {}

export interface CompareSliderLabelProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {
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
