import type { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type * as React from "react";
import type { Input } from "@/registry/bases/base/ui/input";
import type {
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/base/ui/popover";
import type { Select, SelectTrigger } from "@/registry/bases/radix/ui/select";
import type {
  ButtonProps,
  ControlledProps,
  Direction,
  RenderProps,
} from "@/types";

type ColorFormat = "hex" | "rgb" | "hsl" | "hsb";

type SelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;

type SliderProps = SliderPrimitive.Root.Props;

export interface ColorPickerProps
  extends Omit<React.ComponentProps<"div">, keyof ControlledProps<"div">>,
    RenderProps {
  /**
   * The current color value as a string.
   *
   * @example "#3b82f6"
   */
  value?: string;

  /**
   * The default color value as a string.
   *
   * @default "#000000"
   */
  defaultValue?: string;

  /**
   * Event handler called when the color value changes.
   *
   * ```ts
   * onValueChange={(value) => {
   *   console.log("Color value:", value)
   * }}
   * ```
   */
  onValueChange?: (value: string) => void;

  /**
   * The reading direction of the color picker.
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The current color format.
   */
  format?: ColorFormat;

  /**
   * The default color format.
   *
   * @default "hex"
   */
  defaultFormat?: ColorFormat;

  /**
   * Event handler called when the color format changes.
   *
   * ```ts
   * onFormatChange={(format) => {
   *   console.log("Color format:", format)
   * }}
   * ```
   */
  onFormatChange?: (format: ColorFormat) => void;

  /**
   * The name of the color picker. Used for form submission.
   */
  name?: string;

  /**
   * When `true`, prevents the user from interacting with the color picker.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * When `true`, renders the color picker inline instead of in a popover.
   *
   * @default false
   */
  inline?: boolean;

  /**
   * When `true`, prevents the user from changing the color value.
   *
   * @default false
   */
  readOnly?: boolean;

  /**
   * When `true`, indicates that the user must specify a color value
   * before the owning form can be submitted.
   *
   * @default false
   */
  required?: boolean;

  /**
   * The open state of the color picker when it is initially rendered.
   * Use when you do not need to control its open state.
   */
  defaultOpen?: boolean;

  /**
   * The controlled open state of the color picker.
   * Must be used in conjunction with `onOpenChange`.
   */
  open?: boolean;

  /**
   * Event handler called when the open state of the color picker changes.
   *
   * ```ts
   * onOpenChange={(open, eventDetails) => {
   *   console.log("Color picker open:", open)
   *   console.log("Event reason:", eventDetails?.reason)
   * }}
   * ```
   */
  onOpenChange?: (
    open: boolean,
    eventDetails?: PopoverPrimitive.Root.ChangeEventDetails,
  ) => void;

  /**
   * The modality of the color picker. When set to `true`, interaction with outside elements
   * will be disabled and only color picker content will be visible to screen readers.
   *
   * @default true
   */
  modal?: boolean;
}

export interface ColorPickerTriggerProps
  extends Omit<
    React.ComponentProps<typeof PopoverTrigger>,
    keyof React.ComponentProps<"button">
  > {}

export interface ColorPickerContentProps
  extends Omit<
    React.ComponentProps<typeof PopoverContent>,
    keyof React.ComponentProps<"div">
  > {}

export interface ColorPickerAreaProps
  extends React.ComponentProps<"div">,
    RenderProps {}

export interface ColorPickerHueSliderProps
  extends Omit<SliderProps, keyof React.ComponentProps<"span">> {}

export interface ColorPickerAlphaSliderProps
  extends Omit<SliderProps, keyof React.ComponentProps<"span">> {}

export interface ColorPickerSwatchProps
  extends React.ComponentProps<"div">,
    RenderProps {}

export interface ColorPickerEyeDropperProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">> {
  /**
   * The variant of the eye dropper button.
   *
   * @default "default"
   */
  variant?: ButtonProps["variant"];

  /**
   * The size of the eye dropper button.
   *
   * @default "sm"
   */
  size?: ButtonProps["size"];
}

export interface ColorPickerFormatSelectProps
  extends Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange">,
    Pick<SelectTriggerProps, "className"> {
  /**
   * The size of the select trigger.
   *
   * @default "sm"
   */
  size?: SelectTriggerProps["size"];
}

export interface ColorPickerInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "value" | "onChange" | "color" | keyof React.ComponentProps<"input">
  > {
  /**
   * When `true`, hides the alpha channel input.
   *
   * @default false
   */
  withoutAlpha?: boolean;
}
