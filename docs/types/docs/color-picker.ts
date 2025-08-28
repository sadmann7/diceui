import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Select, SelectTrigger } from "@/components/ui/select";
import type * as SliderPrimitive from "@radix-ui/react-slider";

import type { CompositionProps, EmptyProps } from "@/types";

export type ColorFormat = "hex" | "rgb" | "hsl" | "hsb";

export type Direction = "ltr" | "rtl";

export interface RootProps
  extends Omit<React.ComponentProps<"div">, "onValueChange">,
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
  extends React.ComponentProps<typeof PopoverTrigger>,
    CompositionProps {}

export interface ContentProps
  extends React.ComponentProps<typeof PopoverContent>,
    CompositionProps {}

export interface AreaProps extends EmptyProps<"div">, CompositionProps {}

export interface HueSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root>,
    CompositionProps {}

export interface AlphaSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root>,
    CompositionProps {}

export interface SwatchProps extends EmptyProps<"div">, CompositionProps {}

export interface EyeDropperProps
  extends React.ComponentProps<typeof Button>,
    CompositionProps {}

export interface FormatSelectProps
  extends Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange">,
    Pick<React.ComponentProps<typeof SelectTrigger>, "className"> {
  /**
   * The size of the select trigger.
   *
   * @default "sm"
   */
  size?: React.ComponentProps<typeof SelectTrigger>["size"];
}

export interface InputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "value" | "onChange" | "color"
  > {
  /**
   * When `true`, hides the alpha channel input.
   *
   * @default false
   */
  withoutAlpha?: boolean;
}
