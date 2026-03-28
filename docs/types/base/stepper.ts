import type * as React from "react";
import type {
  ButtonProps,
  Direction,
  EmptyProps,
  Orientation,
  RenderProps,
} from "@/types";

export interface StepperProps extends RenderProps {
  /**
   * The current active step value.
   *
   * ```ts
   * value="step-2"
   * ```
   */
  value?: string;

  /**
   * The default active step value.
   *
   * ```ts
   * defaultValue="step-1"
   * ```
   */
  defaultValue?: string;

  /**
   * Event handler called when the active step changes.
   *
   * ```ts
   * onValueChange={(value) => {
   *   console.log(value)
   * }}
   * ```
   */
  onValueChange?: (value: string) => void;

  /**
   * Event handler called when a step is completed.
   *
   * ```ts
   * onValueComplete={(value, completed) => {
   *   console.log(value, completed)
   * }}
   * ```
   */
  onValueComplete?: (value: string, completed: boolean) => void;

  /**
   * Event handler called to validate the current step before changing steps.
   *
   * Accepts the current step value and the direction of the change (next or prev), and returns a boolean or Promise<boolean>.
   *
   * ```ts
   * onValidate={(value, direction) => {
   *   if (direction === "prev") return true
   *   // Validate the current step
   *   return validateCurrentStep(value)
   * }}
   * ```
   */
  onValidate?: (
    value: string,
    direction: "next" | "prev",
  ) => boolean | Promise<boolean>;

  /**
   * Event handler called when a step is added to the stepper.
   *
   * ```ts
   * onValueAdd={(value) => {
   *   console.log(value)
   * }}
   * ```
   */
  onValueAdd?: (value: string) => void;

  /**
   * Event handler called when a step is removed from the stepper.
   *
   * ```ts
   * onValueRemove={(value) => {
   *   console.log(value)
   * }}
   * ```
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
  orientation?: Orientation;

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
}

export interface StepperListProps extends RenderProps {}

export interface StepperItemProps extends RenderProps {
  /**
   * The unique value that links the item with the content.
   *
   * ```ts
   * value="step-1"
   * ```
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

export interface StepperTriggerProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    RenderProps {}

export interface StepperIndicatorProps extends Omit<RenderProps, "children"> {
  /**
   * The display content for the indicator (e.g., step number).
   *
   * Can be a React node or a function that receives the current data state.
   *
   * ```tsx
   * children={1}
   * children={(dataState) => dataState === "completed" ? <CheckIcon /> : <span>1</span>}
   * ```
   */
  children?:
    | React.ReactNode
    | ((dataState: "inactive" | "active" | "completed") => React.ReactNode);
}

export interface StepperSeparatorProps extends RenderProps {}

export interface StepperTitleProps extends RenderProps {}

export interface StepperDescriptionProps extends RenderProps {}

export interface StepperContentProps extends RenderProps {
  /**
   * The unique value that links the content with the item.
   *
   * ```ts
   * value="step-1"
   * ```
   */
  value: string;

  /**
   * When `true`, forces the content to be rendered even if it's not active.
   * Useful for controlling animations with external animation libraries.
   *
   * @default false
   */
  forceMount?: boolean;
}

export interface StepperPrevProps extends RenderProps {}

export interface StepperNextProps extends RenderProps {}
