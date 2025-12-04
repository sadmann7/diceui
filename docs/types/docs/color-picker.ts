import type { Slider } from "@radix-ui/react-slider";
import type * as React from "react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Select, SelectTrigger } from "@/components/ui/select";
import type { CompositionProps, ControlledProps, Direction } from "@/types";

type ColorFormat = "hex" | "rgb" | "hsl" | "hsb";

type ButtonProps = React.ComponentProps<typeof Button>;

type SelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;

type SliderProps = React.ComponentProps<typeof Slider>;

export interface RootProps
  extends Omit<React.ComponentProps<"div">, keyof ControlledProps<"div">>,
    CompositionProps {
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
   * onOpenChange={(open) => {
   *   console.log("Color picker open:", open)
   * }}
   * ```
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The modality of the color picker. When set to `true`, interaction with outside elements
   * will be disabled and only color picker content will be visible to screen readers.
   *
   * @default true
   */
  modal?: boolean;
}

export interface TriggerProps
  extends Omit<
      React.ComponentProps<typeof PopoverTrigger>,
      keyof React.ComponentProps<"button">
    >,
    CompositionProps {}

export interface ContentProps
  extends Omit<
      React.ComponentProps<typeof PopoverContent>,
      keyof React.ComponentProps<"div">
    >,
    CompositionProps {}

export interface AreaProps
  extends Omit<React.ComponentProps<"div">, keyof React.ComponentProps<"div">>,
    CompositionProps {}

export interface HueSliderProps
  extends Omit<SliderProps, keyof React.ComponentProps<"span">>,
    CompositionProps {}

export interface AlphaSliderProps
  extends Omit<SliderProps, keyof React.ComponentProps<"span">>,
    CompositionProps {}

export interface SwatchProps
  extends Omit<React.ComponentProps<"div">, keyof React.ComponentProps<"div">>,
    CompositionProps {}

export interface EyeDropperProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {
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

export interface FormatSelectProps
  extends Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange">,
    Pick<SelectTriggerProps, "className">,
    CompositionProps {
  /**
   * The size of the select trigger.
   *
   * @default "sm"
   */
  size?: SelectTriggerProps["size"];
}

export interface InputProps
  extends Omit<
      React.ComponentProps<typeof Input>,
      "value" | "onChange" | "color" | keyof React.ComponentProps<"input">
    >,
    CompositionProps {
  /**
   * When `true`, hides the alpha channel input.
   *
   * @default false
   */
  withoutAlpha?: boolean;
}
