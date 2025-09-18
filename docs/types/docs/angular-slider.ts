import type * as React from "react";
import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The controlled values of the slider.
   */
  value?: number[];

  /**
   * The default values of the slider when uncontrolled.
   */
  defaultValue?: number[];

  /**
   * Event handler called when the values change.
   */
  onValueChange?: (value: number[]) => void;

  /**
   * Event handler called when the values are committed (drag ends).
   */
  onValueCommit?: (value: number[]) => void;

  /**
   * The name of the slider for form submission.
   */
  name?: string;

  /**
   * The minimum value of the slider.
   * @default 0
   */
  min?: number;

  /**
   * The maximum value of the slider.
   * @default 100
   */
  max?: number;

  /**
   * The step size for value increments.
   * @default 1
   */
  step?: number;

  /**
   * The minimum number of steps between thumbs.
   * @default 0
   */
  minStepsBetweenThumbs?: number;

  /**
   * The reading direction of the slider.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the slider.
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * When `true`, prevents the user from interacting with the slider.
   * @default false
   */
  disabled?: boolean;

  /**
   * When `true`, the slider range will be inverted.
   * @default false
   */
  inverted?: boolean;

  /**
   * The form id to associate the slider with.
   */
  form?: string;
}

export interface TrackProps extends EmptyProps<"div">, CompositionProps {}

export interface RangeProps extends EmptyProps<"div">, CompositionProps {}

export interface ThumbProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The index of the thumb.
   */
  index?: number;

  /**
   * The name of the thumb for form submission.
   */
  name?: string;
}
