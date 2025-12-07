import type { ButtonProps, CompositionProps, EmptyProps, Side } from "@/types";

interface InteractOutsideEvent extends CustomEvent {
  detail: {
    originalEvent: PointerEvent;
  };
}

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The controlled open state of the speed dial.
   */
  open?: boolean;

  /**
   * The default open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Event handler called when the open state changes.
   *
   * ```ts
   * onOpenChange={(open) => {
   *   console.log("Speed dial open:", open)
   * }}
   * ```
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Event handler called when the `Escape` key is pressed.
   * Can be used to prevent closing the speed dial on `Escape` key press.
   *
   * ```ts
   * onEscapeKeyDown={(event) => {
   *   console.log("Escape key pressed!")
   *   // To prevent closing: event.preventDefault();
   * }}
   * ```
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Event handler called when an interaction happens outside the component.
   * Can be used to prevent closing the speed dial when clicking outside.
   *
   * ```ts
   * onInteractOutside={(event) => {
   *   console.log("Interact outside:", event)
   *   // To prevent closing: event.preventDefault();
   * }}
   * ```
   */
  onInteractOutside?: (event: InteractOutsideEvent) => void;

  /**
   * The side where the content should appear relative to the trigger.
   * @default "top"
   */
  side?: Side;
}

export interface TriggerProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">> {}

export interface ContentProps extends EmptyProps<"div">, CompositionProps {}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {}

export interface ActionProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">> {
  /**
   * Callback fired when the action is selected.
   * The speed dial will close after the action is selected unless the event is prevented.
   *
   * ```ts
   * onSelect={(event) => {
   *   console.log("Action selected!")
   *   // To prevent closing: event.preventDefault();
   * }}
   * ```
   */
  onSelect?: (event: Event) => void;
}

export interface LabelProps extends EmptyProps<"div">, CompositionProps {}
