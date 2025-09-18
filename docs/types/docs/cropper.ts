import type * as React from "react";
import type { CompositionProps } from "@/types";

/**
 * Represents a point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents dimensions with width and height.
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Represents a rectangular area with position and dimensions.
 */
export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Represents media dimensions including natural size.
 */
export interface MediaSize {
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

/**
 * The shape of the crop area.
 */
export type Shape = "rectangular" | "circular";

/**
 * The object fit behavior for the media.
 */
export type ObjectFit =
  | "contain"
  | "cover"
  | "horizontal-cover"
  | "vertical-cover";

export interface RootProps
  extends Omit<React.ComponentProps<"div">, "children">,
    CompositionProps {
  /**
   * The current crop position.
   *
   * @default { x: 0, y: 0 }
   */
  crop?: Point;

  /**
   * The current zoom level.
   *
   * @default 1
   */
  zoom?: number;

  /**
   * The minimum zoom level allowed.
   *
   * @default 1
   */
  minZoom?: number;

  /**
   * The maximum zoom level allowed.
   *
   * @default 3
   */
  maxZoom?: number;

  /**
   * The speed of zoom when using mouse wheel.
   *
   * @default 1
   */
  zoomSpeed?: number;

  /**
   * The current rotation angle in degrees.
   *
   * @default 0
   */
  rotation?: number;

  /**
   * The step size for keyboard navigation.
   *
   * @default 1
   */
  keyboardStep?: number;

  /**
   * The aspect ratio of the crop area.
   *
   * @default 4/3
   * @example 1 // Square
   * @example 16/9 // Widescreen
   */
  aspectRatio?: number;

  /**
   * The shape of the crop area.
   *
   * @default "rectangular"
   */
  shape?: Shape;

  /**
   * How the media should fit within the container.
   *
   * @default "contain"
   */
  objectFit?: ObjectFit;

  /**
   * Whether to allow the crop area to overflow beyond the media bounds.
   *
   * @default false
   */
  allowOverflow?: boolean;

  /**
   * Whether to prevent zoom via mouse wheel/trackpad.
   *
   * @default false
   */
  preventScrollZoom?: boolean;

  /**
   * Whether to show the grid overlay on the crop area.
   *
   * @default false
   */
  withGrid?: boolean;

  /**
   * Event handler called when the crop position changes.
   */
  onCropChange?: (crop: Point) => void;

  /**
   * Event handler called when the crop size changes.
   */
  onCropSizeChange?: (cropSize: Size) => void;

  /**
   * Event handler called when the crop area changes.
   */
  onCropAreaChange?: (croppedArea: Area, croppedAreaPixels: Area) => void;

  /**
   * Event handler called when cropping is complete (interaction ends).
   */
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;

  /**
   * Event handler called when the zoom level changes.
   */
  onZoomChange?: (zoom: number) => void;

  /**
   * Event handler called when the rotation angle changes.
   */
  onRotationChange?: (rotation: number) => void;

  /**
   * Event handler called when media is loaded.
   */
  onMediaLoaded?: (mediaSize: MediaSize) => void;

  /**
   * Event handler called when user interaction starts.
   */
  onInteractionStart?: () => void;

  /**
   * Event handler called when user interaction ends.
   */
  onInteractionEnd?: () => void;

  /**
   * The children to render inside the cropper.
   */
  children?: React.ReactNode;
}

export interface ContentProps
  extends Omit<React.ComponentProps<"div">, "children">,
    CompositionProps {
  /**
   * Event handler called when wheel zoom occurs.
   */
  onWheelZoom?: (event: WheelEvent) => void;

  /**
   * The children to render inside the content area.
   */
  children?: React.ReactNode;
}

export interface ImageProps
  extends Omit<React.ComponentProps<"img">, "children">,
    CompositionProps {
  /**
   * How the image should fit within the container.
   * Overrides the root objectFit prop if provided.
   */
  objectFit?: ObjectFit;

  /**
   * Whether to snap transforms to device pixels for crisp rendering.
   *
   * @default false
   */
  snapPixels?: boolean;
}

export interface VideoProps
  extends Omit<React.ComponentProps<"video">, "children">,
    CompositionProps {
  /**
   * How the video should fit within the container.
   * Overrides the root objectFit prop if provided.
   */
  objectFit?: ObjectFit;

  /**
   * Whether to snap transforms to device pixels for crisp rendering.
   *
   * @default false
   */
  snapPixels?: boolean;
}

export interface AreaProps
  extends Omit<React.ComponentProps<"div">, "children">,
    CompositionProps {
  /**
   * The shape of the crop area.
   * Overrides the root shape prop if provided.
   */
  shape?: Shape;

  /**
   * Whether to show the grid overlay.
   * Overrides the root withGrid prop if provided.
   */
  withGrid?: boolean;

  /**
   * Whether to snap dimensions to device pixels for crisp rendering.
   *
   * @default false
   */
  snapPixels?: boolean;
}
