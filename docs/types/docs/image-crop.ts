import type * as React from "react";
import type { Button } from "@/components/ui/button";
import type { CompositionProps, ControlledProps } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;

export interface RootProps
  extends Omit<React.ComponentProps<"div">, "defaultValue">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
  /**
   * The image source URL to crop.
   *
   * @example "/path/to/image.jpg"
   */
  src?: string;

  /**
   * The alt text for the image.
   *
   * @example "Profile picture"
   */
  alt?: string;

  /**
   * The aspect ratio of the crop area.
   *
   * @default 1
   * @example 16/9
   */
  aspect?: number;

  /**
   * The current crop value.
   */
  value?: CropValue;

  /**
   * The default crop value.
   */
  defaultValue?: CropValue;

  /**
   * Event handler called when the crop value changes.
   */
  onValueChange?: (value: CropValue) => void;

  /**
   * The minimum zoom level.
   *
   * @default 1
   */
  minZoom?: number;

  /**
   * The maximum zoom level.
   *
   * @default 3
   */
  maxZoom?: number;

  /**
   * The zoom value.
   */
  zoom?: number;

  /**
   * The default zoom value.
   *
   * @default 1
   */
  defaultZoom?: number;

  /**
   * Event handler called when the zoom value changes.
   */
  onZoomChange?: (zoom: number) => void;

  /**
   * The rotation value in degrees.
   */
  rotation?: number;

  /**
   * The default rotation value in degrees.
   *
   * @default 0
   */
  defaultRotation?: number;

  /**
   * Event handler called when the rotation value changes.
   */
  onRotationChange?: (rotation: number) => void;

  /**
   * When `true`, prevents the user from interacting with the crop area.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * When `true`, prevents the user from changing the crop value.
   *
   * @default false
   */
  readOnly?: boolean;

  /**
   * The crop shape.
   *
   * @default "rect"
   */
  cropShape?: "rect" | "round";

  /**
   * When `true`, shows the grid lines on the crop area.
   *
   * @default true
   */
  showGrid?: boolean;

  /**
   * The quality of the output image.
   *
   * @default 0.92
   */
  quality?: number;

  /**
   * The output format of the cropped image.
   *
   * @default "image/jpeg"
   */
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";

  /**
   * Event handler called when the crop is complete.
   */
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;

  /**
   * Event handler called when the media is loaded.
   */
  onMediaLoaded?: (mediaSize: { width: number; height: number }) => void;
}

export interface CropAreaProps
  extends React.ComponentProps<"div">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
}

export interface ImageProps
  extends React.ComponentProps<"img">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
}

export interface ControlsProps
  extends React.ComponentProps<"div">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
}

export interface ZoomSliderProps
  extends Omit<React.ComponentProps<"div">, "min" | "max" | "step">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
  /**
   * The minimum zoom value.
   */
  min?: number;

  /**
   * The maximum zoom value.
   */
  max?: number;

  /**
   * The zoom step value.
   *
   * @default 0.1
   */
  step?: number;
}

export interface RotateButtonProps
  extends React.ComponentProps<"button">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
  /**
   * The rotation direction.
   *
   * @default "left"
   */
  direction?: "left" | "right";

  /**
   * The variant of the rotate button.
   *
   * @default "outline"
   */
  variant?: ButtonProps["variant"];

  /**
   * The size of the rotate button.
   *
   * @default "sm"
   */
  size?: ButtonProps["size"];
}

export interface ResetButtonProps
  extends React.ComponentProps<"button">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
  /**
   * The variant of the reset button.
   *
   * @default "outline"
   */
  variant?: ButtonProps["variant"];

  /**
   * The size of the reset button.
   *
   * @default "sm"
   */
  size?: ButtonProps["size"];
}

export interface CropButtonProps
  extends React.ComponentProps<"button">,
    CompositionProps {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * @default false
   */
  asChild?: boolean;
  /**
   * The variant of the crop button.
   *
   * @default "default"
   */
  variant?: ButtonProps["variant"];

  /**
   * The size of the crop button.
   *
   * @default "sm"
   */
  size?: ButtonProps["size"];
}

export interface CropValue {
  /**
   * The x coordinate of the crop area.
   */
  x: number;

  /**
   * The y coordinate of the crop area.
   */
  y: number;

  /**
   * The width of the crop area.
   */
  width: number;

  /**
   * The height of the crop area.
   */
  height: number;
}

export interface Area {
  /**
   * The x coordinate of the area.
   */
  x: number;

  /**
   * The y coordinate of the area.
   */
  y: number;

  /**
   * The width of the area.
   */
  width: number;

  /**
   * The height of the area.
   */
  height: number;
}

export interface Point {
  /**
   * The x coordinate.
   */
  x: number;

  /**
   * The y coordinate.
   */
  y: number;
}
