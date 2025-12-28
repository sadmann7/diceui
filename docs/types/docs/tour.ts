import type * as React from "react";
import type { Button } from "@/components/ui/button";
import type {
  Align,
  CompositionProps,
  Direction,
  EmptyProps,
  PointerDownOutsideEvent,
  Side,
} from "@/types";

interface ButtonProps extends React.ComponentProps<typeof Button> {}

export interface TourProps extends EmptyProps<"div">, CompositionProps {
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
   * Event handler called when a pointer down event occurs outside the tour step.
   * You can prevent the dismissing behavior by calling event.preventDefault().
   *
   * The event is a CustomEvent containing the original PointerEvent in event.detail.originalEvent.
   *
   * ```ts
   * onPointerDownOutside={(event) => {
   *   console.log("Pointer down outside:", event)
   *   console.log("Original event:", event.detail.originalEvent)
   *   // To prevent dismissing: event.preventDefault();
   * }}
   * ```
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;

  /**
   * Event handler called when an interaction (pointer or focus) occurs outside the tour step.
   * You can prevent the dismissing behavior by calling event.preventDefault().
   *
   * The event is a CustomEvent containing the original event in event.detail.originalEvent.
   *
   * ```ts
   * onInteractOutside={(event) => {
   *   console.log("Interact outside:", event)
   *   console.log("Original event:", event.detail.originalEvent)
   *   // To prevent dismissing: event.preventDefault();
   * }}
   * ```
   */
  onInteractOutside?: (
    event: CustomEvent<{ originalEvent: PointerEvent | FocusEvent }>,
  ) => void;

  /**
   * Event handler called when auto-focusing on opening the tour.
   * You can prevent the default auto-focus behavior by calling event.preventDefault().
   *
   * ```ts
   * onOpenAutoFocus={(event) => {
   *   console.log("Auto-focusing on open")
   *   // To prevent auto-focus: event.preventDefault();
   * }}
   * ```
   */
  onOpenAutoFocus?: (event: CustomEvent) => void;

  /**
   * Event handler called when auto-focusing on closing the tour.
   * You can prevent the default focus restoration by calling event.preventDefault().
   *
   * ```ts
   * onCloseAutoFocus={(event) => {
   *   console.log("Restoring focus on close")
   *   // To prevent focus restoration: event.preventDefault();
   * }}
   * ```
   */
  onCloseAutoFocus?: (event: CustomEvent) => void;

  /**
   * The text direction of the tour component.
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The default offset in pixels along the alignment axis for all steps.
   * Can be overridden per step using the step's alignOffset prop.
   *
   * @default 0
   */
  alignOffset?: number;

  /**
   * The default distance in pixels from the target element for all steps.
   * Can be overridden per step using the step's sideOffset prop.
   *
   * @default 16
   */
  sideOffset?: number;

  /**
   * The padding around the highlighted element in the spotlight effect.
   *
   * @default 4
   */
  spotlightPadding?: number;

  /**
   * Whether to automatically scroll to the highlighted element when navigating between steps.
   *
   * @default true
   */
  autoScroll?: boolean;

  /**
   * The scroll behavior when navigating to elements.
   * Respects user preferences by default - uses `"auto"` if `prefers-reduced-motion` is set to `reduce`, otherwise `"smooth"`.
   *
   * @default "auto" if reduced motion, "smooth" otherwise
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
   * Whether the tour can be dismissed by clicking outside.
   *
   * @default true
   */
  dismissible?: boolean;

  /**
   * Whether the tour is modal.
   *
   * @default true
   */
  modal?: boolean;

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

export interface TourSpotlightProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * Whether to force mount the spotlight even when closed.
   *
   * @default false
   */
  forceMount?: boolean;
}

export interface TourSpotlightRingProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * Whether to force mount the spotlight ring even when closed.
   *
   * @default false
   */
  forceMount?: boolean;
}

export interface TourStepProps extends EmptyProps<"div">, CompositionProps {
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
   * The side of the target element on which to position the popover.
   *
   * @default "bottom"
   */
  side?: Side;

  /**
   * The distance in pixels from the target element.
   *
   * @default 8
   */
  sideOffset?: number;

  /**
   * The alignment of the popover relative to the target element.
   *
   * @default "center"
   */
  align?: Align;

  /**
   * The offset in pixels along the alignment axis.
   *
   * @default 0
   */
  alignOffset?: number;

  /**
   * The boundary elements used to prevent collisions. Can be a single element or an array of elements.
   *
   * ```ts
   * collisionBoundary={document.querySelector('.scroll-container')}
   * // or
   * collisionBoundary={[element1, element2]}
   * ```
   *
   * @default []
   */
  collisionBoundary?: Element | null | (Element | null)[];

  /**
   * The padding between the popover and the edge of the viewport to prevent collisions.
   * Can be a single number for all sides or an object with individual side values.
   *
   * @default 0
   */
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;

  /**
   * The minimum padding between the arrow and the edges of the popover.
   *
   * @default 0
   */
  arrowPadding?: number;

  /**
   * The sticky behavior of the popover when it reaches the boundary.
   * - "partial": The popover will partially stick to the boundary
   * - "always": The popover will always stick to the boundary
   *
   * @default "partial"
   */
  sticky?: "partial" | "always";

  /**
   * Whether to hide the popover when the target element is fully occluded.
   *
   * @default false
   */
  hideWhenDetached?: boolean;

  /**
   * Whether to enable collision detection to keep the popover in view.
   *
   * @default true
   */
  avoidCollisions?: boolean;

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

export interface TourCloseProps
  extends EmptyProps<"button">,
    CompositionProps {}

export interface TourHeaderProps extends EmptyProps<"div">, CompositionProps {}

export interface TourTitleProps extends EmptyProps<"h2">, CompositionProps {}

export interface TourDescriptionProps
  extends EmptyProps<"p">,
    CompositionProps {}

export interface TourFooterProps extends EmptyProps<"div">, CompositionProps {}

export interface TourStepCounterProps
  extends EmptyProps<"div">,
    CompositionProps {
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

export interface TourPrevProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {}

export interface TourNextProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {}

export interface TourSkipProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {}

export interface TourArrowProps extends EmptyProps<"svg">, CompositionProps {
  /**
   * The width of the arrow.
   *
   * @default 10
   */
  width?: number;

  /**
   * The height of the arrow.
   *
   * @default 10
   */
  height?: number;
}
