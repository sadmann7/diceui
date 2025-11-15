import type * as React from "react";
import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps
  extends Omit<
      React.ComponentProps<"div">,
      "defaultValue" | "value" | "onValueChange"
    >,
    CompositionProps {
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
   * The orientation of the slider.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Whether the slider is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * The minimum position value.
   * @default 0
   */
  min?: number;

  /**
   * The maximum position value.
   * @default 100
   */
  max?: number;

  /**
   * The step size for keyboard navigation.
   * @default 1
   */
  step?: number;
}

export interface BeforeProps
  extends React.ComponentProps<"div">,
    CompositionProps {
  /**
   * Label for the "before" side.
   */
  label?: string;
}

export interface AfterProps
  extends React.ComponentProps<"div">,
    CompositionProps {
  /**
   * Label for the "after" side.
   */
  label?: string;
}

export interface HandleProps
  extends React.ComponentProps<"div">,
    CompositionProps {
  /**
   * Custom icon or element to display in the handle.
   */
  children?: React.ReactNode;
}

export interface LabelProps
  extends React.ComponentProps<"div">,
    CompositionProps {
  /**
   * The side this label is for.
   */
  side?: "before" | "after";
}
