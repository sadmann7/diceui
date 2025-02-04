import type { EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div"> {
  /**
   * The unique identifier for the editable component.
   * @default React.useId()
   */

  id?: string;

  /**
   * The default value for uncontrolled usage.
   * @default ""
   */
  defaultValue?: string;

  /**
   * The controlled value of the editable component.
   */
  value?: string;

  /**
   * Callback fired when the value changes.
   */
  onValueChange?: (value: string) => void;

  /**
   * The default editing state.
   * @default false
   */
  defaultEditing?: boolean;

  /**
   * The controlled editing state.
   */
  editing?: boolean;

  /**
   * Event handler called when the `Escape` key is pressed.
   *
   * Can be used to prevent input value from being reset on `Escape` key press.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Callback fired when editing is cancelled.
   */
  onCancel?: () => void;

  /**
   * Callback fired when editing begins.
   */
  onEdit?: () => void;

  /**
   * Callback fired when changes are submitted.
   */
  onSubmit?: (value: string) => void;

  /**
   * The name of the editable for form submission.
   */
  name?: string;

  /**
   * Placeholder text shown when value is empty.
   */
  placeholder?: string;

  /**
   * The trigger mode for entering edit mode.
   *
   * - `click`: Clicking the editable component will enter edit mode.
   * - `dblclick`: Double-clicking the editable component will enter edit mode.
   * - `focus`: Focusing the editable component will enter edit mode.
   *
   * @default "click"
   */
  triggerMode?: "click" | "dblclick" | "focus";

  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;

  /**
   * Whether the input should automatically resize based on content.
   * @default false
   */
  autosize?: boolean;

  /**
   * Whether the editable component is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the editable component is read-only.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether the editable component is required.
   * @default false
   */
  required?: boolean;

  /**
   * Whether the editable component is in an invalid state.
   * @default false
   */
  invalid?: boolean;
}

export interface LabelProps extends EmptyProps<"label"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface AreaProps extends EmptyProps<"div"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface PreviewProps extends EmptyProps<"div"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface InputProps extends EmptyProps<"input"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface TriggerProps extends EmptyProps<"button"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;

  /**
   * Whether to force mount the trigger.
   * @default false
   */
  forceMount?: boolean;
}

export interface ToolbarProps extends EmptyProps<"div"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;

  /**
   * The orientation of the toolbar.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

export interface SubmitProps extends EmptyProps<"button"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface CancelProps extends EmptyProps<"button"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}
