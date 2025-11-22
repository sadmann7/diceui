import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The orientation of the timeline.
   * @default "vertical"
   */
  orientation?: Orientation;

  /**
   * The visual variant of the timeline.
   * @default "default"
   */
  variant?: "default" | "alternate";

  /**
   * The reading direction of the timeline.
   * This affects the layout direction and works with RTL languages.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The zero-based index of the active item in the timeline.
   * When set, items before this index will be marked as "completed",
   * the item at this index will be "active", and items after will be "pending".
   */
  activeIndex?: number;
}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {}

export interface HeaderProps extends EmptyProps<"div">, CompositionProps {}

export interface TitleProps extends EmptyProps<"h3">, CompositionProps {}

export interface DescriptionProps extends EmptyProps<"p">, CompositionProps {}

export interface ContentProps extends EmptyProps<"div">, CompositionProps {}

export interface TimeProps extends EmptyProps<"time">, CompositionProps {
  /**
   * The datetime attribute for the time element.
   */
  dateTime?: string;
}

export interface DotProps extends EmptyProps<"div">, CompositionProps {}

export interface ConnectorProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Force the connector to be rendered even if it's the last item.
   * @default false
   */
  forceMount?: boolean;
}
