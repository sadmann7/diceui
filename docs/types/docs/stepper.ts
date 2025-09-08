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
  onValueComplete?: (value: string) => void;

  /**
   * Event handler called when a step is added to the stepper.
   */
  onValueAdd?: (value: string) => void;

  /**
   * Event handler called when a step is removed from the stepper.
   */
  onValueRemove?: (value: string) => void;

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
   * When `true`, prevents interaction with step navigation.
   *
   * @default false
   */
  nonInteractive?: boolean;

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
   * The unique value for this step trigger.
   *
   * @example "step-1"
   */
  value: string;

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

export interface ItemIndicatorProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The unique value for this step indicator.
   *
   * @example "step-1"
   */
  value: string;

  /**
   * The display content for the indicator (e.g., step number).
   *
   * @example 1
   */
  children?: React.ReactNode;
}

export interface SeparatorProps extends EmptyProps<"div">, CompositionProps {
  /**
   * When `true`, marks this separator as completed.
   *
   * @default false
   */
  completed?: boolean;
}

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
}
