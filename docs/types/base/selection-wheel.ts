import type {
  BaseButtonProps as ButtonProps,
  Direction,
  PointerDownOutsideEvent,
  RenderProps,
} from "@/types";

export interface SelectionWheelProps extends RenderProps {
  /**
   * What picking an item means.
   * - `"radio"`: the wheel holds a value, like a weapon or tool wheel. Items are radios in a radiogroup.
   * - `"menu"`: each item runs an action. Items are menu items in a menu.
   *
   * @default "radio"
   */
  type?: "radio" | "menu";

  /**
   * The controlled value of the selected item.
   */
  value?: string;

  /**
   * The default selected value when uncontrolled.
   */
  defaultValue?: string;

  /**
   * Event handler called when an item is selected.
   *
   * ```ts
   * onValueChange={(value) => {
   *   console.log("Selected:", value)
   * }}
   * ```
   */
  onValueChange?: (value: string) => void;

  /**
   * The controlled open state of the wheel.
   * Only applies when the wheel has a `SelectionWheelTrigger`.
   */
  open?: boolean;

  /**
   * The default open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Event handler called when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The reading direction. Swaps the Left and Right arrow keys in RTL.
   * Inherits from `DirectionProvider` when omitted.
   */
  dir?: Direction;

  /**
   * Whether the wheel is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface SelectionWheelTriggerProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}

export interface SelectionWheelAreaProps extends RenderProps {
  /**
   * A key that opens the wheel at the pointer while held, like a game's weapon wheel.
   * Releasing it picks the highlighted item, or closes the wheel when nothing is highlighted.
   * The area becomes focusable so it can receive the key.
   */
  openKey?: string;

  /**
   * When `true`, right-clicks and the open key do nothing.
   * @default false
   */
  disabled?: boolean;
}

export interface SelectionWheelContentProps extends RenderProps {
  /**
   * The diameter of the wheel in pixels.
   * @default 240
   */
  size?: number;

  /**
   * The radius of the center area in pixels. Pointing inside it highlights nothing,
   * so releasing there cancels instead of picking.
   * @default 40
   */
  deadZone?: number;

  /**
   * When `true`, keeps the overlay mounted while closed.
   * Useful for controlling animations with external animation libraries.
   * @default false
   */
  forceMount?: boolean;

  /**
   * The element to portal the overlay into.
   * @default document.body
   */
  container?: HTMLElement | ShadowRoot | null;

  /**
   * Event handler called when the `Escape` key is pressed while the overlay is open.
   *
   * ```ts
   * onEscapeKeyDown={(event) => {
   *   // To prevent closing: event.preventDefault();
   * }}
   * ```
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Event handler called when the pointer goes down outside the overlay.
   *
   * ```ts
   * onInteractOutside={(event) => {
   *   // To prevent closing: event.preventDefault();
   * }}
   * ```
   */
  onInteractOutside?: (event: PointerDownOutsideEvent) => void;
}

export interface SelectionWheelIndicatorProps extends RenderProps {}

export interface SelectionWheelItemProps extends RenderProps {
  /**
   * The value of the item. Must be unique within the wheel.
   */
  value: string;

  /**
   * The accessible name of the item, also shown by `SelectionWheelLabel`.
   * Use it when the item only renders an icon.
   */
  label?: string;

  /**
   * Whether the item is disabled. Pointing at it highlights nothing.
   * @default false
   */
  disabled?: boolean;

  /**
   * Event handler called when the item is picked.
   * The overlay closes after the pick unless the event is prevented.
   *
   * ```ts
   * onSelect={(event) => {
   *   console.log("Picked!")
   *   // To keep the wheel open: event.preventDefault();
   * }}
   * ```
   */
  onSelect?: (event: Event) => void;
}

export interface SelectionWheelSubTriggerProps extends Omit<
  SelectionWheelItemProps,
  "onSelect"
> {}

export interface SelectionWheelLabelProps extends RenderProps {}
