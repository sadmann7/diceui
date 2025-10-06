import type * as React from "react";
import type { CompositionProps, Direction, EmptyProps } from "@/types";

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
   * value={2}
   * ```
   */
  value?: number;

  /**
   * The default current step for uncontrolled usage.
   *
   * @default 0
   */
  defaultValue?: number;

  /**
   * Event handler called when the current step changes.
   *
   * ```ts
   * onValueChange={(step) => {
   *   console.log("Current step:", step)
   * }}
   * ```
   */
  onValueChange?: (step: number) => void;

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
   * Event handler called when the Escape key is pressed.
   * You can prevent the default behavior by calling event.preventDefault().
   *
   * ```ts
   * onEscapeKeyDown={(event) => {
   *   console.log("Escape pressed!")
   *   // To prevent closing: event.preventDefault();
   * }}
   * ```
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

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
   * @default false
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
   * @default { top: 100, bottom: 100, left: 0, right: 0 }
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

export interface OverlayProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether to force mount the overlay even when closed.
   *
   * @default false
   */
  forceMount?: boolean;
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
  forceMount?: boolean;

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

export interface CloseProps extends EmptyProps<"button">, CompositionProps {}

export interface HeaderProps extends EmptyProps<"div">, CompositionProps {}

export interface TitleProps extends EmptyProps<"h2">, CompositionProps {}

export interface DescriptionProps extends EmptyProps<"p">, CompositionProps {}

export interface FooterProps extends EmptyProps<"div">, CompositionProps {}

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

export interface PrevProps extends EmptyProps<"button">, CompositionProps {}

export interface NextProps extends EmptyProps<"button">, CompositionProps {}

export interface SkipProps extends EmptyProps<"button">, CompositionProps {}
