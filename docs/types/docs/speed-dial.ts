import type { VariantProps } from "class-variance-authority";
import type { Button } from "@/components/ui/button";
import type { CompositionProps, EmptyProps, Side } from "@/types";

export interface SpeedDialInteractOutsideEvent extends CustomEvent {
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
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Event handler called when the `Escape` key is pressed.
   * Can be used to prevent closing the speed dial on `Escape` key press.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Event handler called when an interaction happens outside the component.
   * Can be used to prevent closing the speed dial when clicking outside.
   */
  onInteractOutside?: (event: SpeedDialInteractOutsideEvent) => void;

  /**
   * The side where the content should appear relative to the trigger.
   * @default "top"
   */
  side?: Side;
}

export interface TriggerProps extends React.ComponentProps<typeof Button> {}

export interface ContentProps extends EmptyProps<"div">, CompositionProps {}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {}

export interface ActionProps
  extends Omit<React.ComponentProps<typeof Button>, "onSelect"> {
  /**
   * Callback fired when the action is selected.
   * The speed dial will close after the action is selected unless the event is prevented.
   */
  onSelect?: (event: Event) => void;
}

export interface LabelProps extends EmptyProps<"div">, CompositionProps {}
