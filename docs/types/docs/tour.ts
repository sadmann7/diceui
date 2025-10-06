import type * as React from "react";
import type { Button } from "@/components/ui/button";
import type { CompositionProps, Direction, EmptyProps } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether the tour is open.
   *
   * ```ts
   * open={true}
   * ```
   */
  open?: boolean;

  /**
   * The default open state for uncontrolled usage.
   *
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Event handler called when the open state changes.
   *
   * ```ts
   * onOpenChange={(open) => {
   *   console.log("Tour open:", open)
   * }}
   * ```
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The current active step index.
   *
   * ```ts
   * currentStep={2}
   * ```
   */
  currentStep?: number;

  /**
   * The default current step for uncontrolled usage.
   *
   * @default 0
   */
  defaultCurrentStep?: number;

  /**
   * Event handler called when the current step changes.
   *
   * ```ts
   * onCurrentStepChange={(step) => {
   *   console.log("Current step:", step)
   * }}
   * ```
   */
  onCurrentStepChange?: (step: number) => void;

  /**
   * Event handler called when the tour is completed.
   *
   * ```ts
   * onComplete={() => {
   *   console.log("Tour completed!")
   * }}
   * ```
   */
  onComplete?: () => void;

  /**
   * Event handler called when the tour is skipped.
   *
   * ```ts
   * onSkip={() => {
   *   console.log("Tour skipped!")
   * }}
   * ```
   */
  onSkip?: () => void;

  /**
   * The text direction of the tour component.
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * Whether to show the backdrop overlay.
   *
   * @default true
   */
  showBackdrop?: boolean;

  /**
   * Whether to close the tour when clicking the backdrop.
   *
   * @default false
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether to close the tour when pressing the Escape key.
   *
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * The padding around the highlighted element.
   *
   * @default 4
   */
  padding?: number;

  /**
   * The border radius of the highlight mask.
   *
   * @default 8
   */
  borderRadius?: number;

  /**
   * Whether to scroll to the highlighted element.
   *
   * @default true
   */
  scrollToElement?: boolean;

  /**
   * The scroll behavior when navigating to elements.
   *
   * @default "smooth"
   */
  scrollBehavior?: ScrollBehavior;

  /**
   * The offset from the viewport edges when scrolling to elements.
   *
   * @default { top: 100, bottom: 100 }
   */
  scrollOffset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };

  /**
   * Default footer element to be used for all steps that don't have their own footer.
   *
   * Steps can override the default footer by including their own TourFooter component.
   *
   * ```tsx
   * stepFooter={
   *   <TourFooter>
   *     <div className="flex w-full items-center justify-between">
   *       <TourStepCounter />
   *       <div className="flex gap-2">
   *         <TourPrev />
   *         <TourNext />
   *       </div>
   *     </div>
   *   </TourFooter>
   * }
   * ```
   */
  stepFooter?: React.ReactElement;
}

export interface StepProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The target element selector or element reference for this step.
   *
   * ```ts
   * target="#my-element"
   * // or
   * target={elementRef}
   * ```
   */
  target: string | React.RefObject<HTMLElement> | HTMLElement;

  /**
   * The placement of the popover relative to the target element.
   *
   * @default "bottom"
   */
  placement?:
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end";

  /**
   * The offset distance from the target element.
   *
   * @default 8
   */
  offset?: number;

  /**
   * Whether this step is required and cannot be skipped.
   *
   * @default false
   */
  required?: boolean;

  /**
   * Whether to show the step when the target element is not found.
   *
   * @default false
   */
  showOnTargetNotFound?: boolean;

  /**
   * Event handler called when this step becomes active.
   *
   * ```ts
   * onStepEnter={() => {
   *   console.log("Entered step")
   * }}
   * ```
   */
  onStepEnter?: () => void;

  /**
   * Event handler called when this step becomes inactive.
   *
   * ```ts
   * onStepLeave={() => {
   *   console.log("Left step")
   * }}
   * ```
   */
  onStepLeave?: () => void;
}

export interface ContentProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether to show the close button.
   *
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether to show the step counter.
   *
   * @default true
   */
  showStepCounter?: boolean;

  /**
   * Whether to show navigation buttons.
   *
   * @default true
   */
  showNavigation?: boolean;

  /**
   * Whether to show the skip button.
   *
   * @default true
   */
  showSkipButton?: boolean;
}

export interface HeaderProps extends EmptyProps<"div">, CompositionProps {}

export interface TitleProps extends EmptyProps<"h2">, CompositionProps {}

export interface DescriptionProps extends EmptyProps<"p">, CompositionProps {}

export interface FooterProps extends EmptyProps<"div">, CompositionProps {}

export interface CloseButtonProps extends ButtonProps, CompositionProps {
  /**
   * The accessible label for the close button.
   *
   * @default "Close tour"
   */
  "aria-label"?: string;
}

export interface StepCounterProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Custom format function for the step counter.
   *
   * ```ts
   * format={(current, total) => `${current} of ${total}`}
   * ```
   *
   * @default (current, total) => `${current} / ${total}`
   */
  format?: (current: number, total: number) => string;
}

export interface NavigationProps extends EmptyProps<"div">, CompositionProps {}

export interface PrevProps extends ButtonProps, CompositionProps {
  /**
   * The accessible label for the previous button.
   *
   * @default "Previous step"
   */
  "aria-label"?: string;
}

export interface NextProps extends ButtonProps, CompositionProps {
  /**
   * The accessible label for the next button.
   *
   * @default "Next step"
   */
  "aria-label"?: string;
}

export interface SkipProps extends ButtonProps, CompositionProps {
  /**
   * The accessible label for the skip button.
   *
   * @default "Skip tour"
   */
  "aria-label"?: string;
}

export interface OverlayProps extends EmptyProps<"div">, CompositionProps {}
