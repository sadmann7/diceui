import type * as React from "react";
import type { Button } from "@/components/ui/button";
import type { CompositionProps, Direction, EmptyProps } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The current active step value.
   *
   * @example "step-2"
   */
  value?: string;

  /**
   * The default active step value.
   *
   * @example "step-1"
   */
  defaultValue?: string;

  /**
   * Event handler called when the active step changes.
   */
  onValueChange?: (value: string) => void;

  /**
   * Event handler called when a step is completed.
   */
  onValueComplete?: (value: string, completed: boolean) => void;

  /**
   * Event handler called when a step is added to the stepper.
   */
  onValueAdd?: (value: string) => void;

  /**
   * Event handler called when a step is removed from the stepper.
   */
  onValueRemove?: (value: string) => void;

  /**
   * Controls how steps are activated during keyboard navigation.
   *
   * - `"automatic"`: Arrow keys immediately activate the focused step (selection follows focus)
   * - `"manual"`: Arrow keys only move focus, Enter/Space keys activate the focused step
   *
   * @default "automatic"
   *
   * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ WAI-ARIA Tabs Pattern}
   */
  activationMode?: "automatic" | "manual";

  /**
   * The reading direction of the stepper.
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the stepper.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * When `true`, prevents the user from interacting with the stepper.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether keyboard navigation should loop around
   * @defaultValue false
   */
  loop?: boolean;

  /**
   * When `true`, prevents interaction with step navigation.
   *
   * @default false
   */
  nonInteractive?: boolean;

  /**
   * An accessible label for the stepper.
   * Provides screen readers with context about the stepper.
   */
  label?: string;

  /**
   * The name of the stepper. Used for form submission.
   */
  name?: string;
}

export interface ListProps extends EmptyProps<"ol">, CompositionProps {}

export interface ItemProps extends EmptyProps<"li">, CompositionProps {
  /**
   * The unique value for this step item.
   *
   * @example "step-1"
   */
  value: string;

  /**
   * When `true`, marks this step as completed.
   *
   * @default false
   */
  completed?: boolean;

  /**
   * When `true`, prevents the user from interacting with this step.
   *
   * @default false
   */
  disabled?: boolean;
}

export interface TriggerProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {
  /**
   * The variant of the trigger button.
   *
   * @default "ghost"
   */
  variant?: ButtonProps["variant"];

  /**
   * The size of the trigger button.
   *
   * @default "sm"
   */
  size?: ButtonProps["size"];
}

export interface IndicatorProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The display content for the indicator (e.g., step number).
   * Can be a React node or a function that receives the current data state.
   *
   * @example 1
   * @example (dataState) => dataState === "completed" ? <CheckIcon /> : <span>1</span>
   */
  children?:
    | React.ReactNode
    | ((dataState: "inactive" | "active" | "completed") => React.ReactNode);
}

export interface SeparatorProps extends EmptyProps<"div">, CompositionProps {}

export interface TitleProps extends EmptyProps<"span">, CompositionProps {}

export interface DescriptionProps
  extends EmptyProps<"span">,
    CompositionProps {}

export interface ContentProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique value for this step content.
   *
   * @example "step-1"
   */
  value: string;

  /**
   * Used to force mounting of content when not active.
   * Useful for controlling animations with external animation libraries.
   *
   * @default false
   */
  forceMount?: boolean;
}
