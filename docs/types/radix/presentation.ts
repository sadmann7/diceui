import type { Presentation as PresentationPrimitive } from "@diceui/pptx";
import type * as React from "react";

import type { EmptyProps } from "@/types";

type OverriddenHtmlKeys<T, Html> = {
  [K in keyof T & keyof Html]-?: [T[K]] extends [Html[K]] ? never : K;
}[keyof T & keyof Html];

/** A part's own props: the host element's are dropped, except names it redefines. */
type IndieProps<T, Html> = Omit<T, keyof Html> &
  Pick<T, OverriddenHtmlKeys<T, Html>>;

type DivProps = React.ComponentProps<"div">;
type ButtonProps = React.ComponentProps<"button">;
type SpanProps = React.ComponentProps<"span">;

export type PresentationProviderProps = PresentationPrimitive.Provider.Props;

export type PresentationProps = IndieProps<
  PresentationPrimitive.Root.Props,
  DivProps
>;

export interface PresentationContentProps extends EmptyProps<"div"> {}

export type PresentationViewportProps = IndieProps<
  PresentationPrimitive.Viewport.Props,
  DivProps
>;

export type PresentationSlideProps = IndieProps<
  PresentationPrimitive.Slide.Props,
  DivProps
>;

export type PresentationSelectionProps = IndieProps<
  PresentationPrimitive.Selection.Props,
  DivProps
>;

export type PresentationSelectionBoxProps = IndieProps<
  PresentationPrimitive.SelectionBox.Props,
  DivProps
>;

export type PresentationResizeHandleProps = IndieProps<
  PresentationPrimitive.ResizeHandle.Props,
  DivProps
>;

export type PresentationRotateHandleProps = IndieProps<
  PresentationPrimitive.RotateHandle.Props,
  DivProps
>;

export type PresentationSnapGuideProps = IndieProps<
  PresentationPrimitive.SnapGuide.Props,
  DivProps
>;

export type PresentationMarqueeProps = IndieProps<
  PresentationPrimitive.Marquee.Props,
  DivProps
>;

export type PresentationLoadingProps = IndieProps<
  PresentationPrimitive.Loading.Props,
  DivProps
>;

export type PresentationErrorProps = IndieProps<
  PresentationPrimitive.Error.Props,
  DivProps
>;

export type PresentationThumbnailListProps = IndieProps<
  PresentationPrimitive.ThumbnailList.Props,
  DivProps
>;

export type PresentationThumbnailItemProps = IndieProps<
  PresentationPrimitive.ThumbnailItem.Props,
  ButtonProps
>;

export type PresentationThumbnailItemPreviewProps = IndieProps<
  PresentationPrimitive.ThumbnailItemPreview.Props,
  DivProps
>;

export type PresentationThumbnailItemNumberProps = IndieProps<
  PresentationPrimitive.ThumbnailItemNumber.Props,
  SpanProps
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
