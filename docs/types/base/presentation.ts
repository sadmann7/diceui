import type { Presentation as PresentationPrimitive } from "@diceui/pptx";

import type { EmptyCompProps, EmptyProps } from "@/types";

export type PresentationProviderProps = PresentationPrimitive.Provider.Props;

export type PresentationProps = EmptyCompProps<
  PresentationPrimitive.Root.Props,
  "div"
>;

export interface PresentationContentProps extends EmptyProps<"div"> {}

export type PresentationViewportProps = EmptyCompProps<
  PresentationPrimitive.Viewport.Props,
  "div"
>;

export type PresentationSlideProps = EmptyCompProps<
  PresentationPrimitive.Slide.Props,
  "div"
>;

export type PresentationSelectionProps = EmptyCompProps<
  PresentationPrimitive.Selection.Props,
  "div"
>;

export type PresentationSelectionBoxProps = EmptyCompProps<
  PresentationPrimitive.SelectionBox.Props,
  "div"
>;

export type PresentationResizeHandleProps = EmptyCompProps<
  PresentationPrimitive.ResizeHandle.Props,
  "div"
>;

export type PresentationRotateHandleProps = EmptyCompProps<
  PresentationPrimitive.RotateHandle.Props,
  "div"
>;

export type PresentationSnapGuideProps = EmptyCompProps<
  PresentationPrimitive.SnapGuide.Props,
  "div"
>;

export type PresentationMarqueeProps = EmptyCompProps<
  PresentationPrimitive.Marquee.Props,
  "div"
>;

export type PresentationControlsProps = EmptyCompProps<
  PresentationPrimitive.Controls.Props,
  "div"
>;

export type PresentationLoadingProps = EmptyCompProps<
  PresentationPrimitive.Loading.Props,
  "div"
>;

export type PresentationErrorProps = EmptyCompProps<
  PresentationPrimitive.Error.Props,
  "div"
>;

export type PresentationThumbnailListProps = EmptyCompProps<
  PresentationPrimitive.ThumbnailList.Props,
  "div"
>;

export type PresentationThumbnailItemProps = EmptyCompProps<
  PresentationPrimitive.ThumbnailItem.Props,
  "button"
>;

export type PresentationThumbnailItemPreviewProps = EmptyCompProps<
  PresentationPrimitive.ThumbnailItemPreview.Props,
  "div"
>;

export type PresentationThumbnailItemNumberProps = EmptyCompProps<
  PresentationPrimitive.ThumbnailItemNumber.Props,
  "span"
>;

export interface PresentationZoomSelectProps {
  /**
   * Zoom levels offered alongside Fit, where `1` equals 100%.
   *
   * @default [0.5, 0.75, 1, 1.5, 2]
   */
  levels?: number[];
}

export type {
  UseHistoryResult,
  UsePresentationResult,
  UseSelectionResult,
  UseSlideResult,
  UseZoomResult,
} from "@diceui/pptx";
