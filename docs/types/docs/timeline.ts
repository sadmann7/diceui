import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface RootProps extends EmptyProps<"ol">, CompositionProps {
  /**
   * The orientation of the timeline.
   * @default "vertical"
   */
  orientation?: Orientation;

  /**
   * The reading direction of the timeline.
   * This affects the layout direction and works with RTL languages.
   * @default "ltr"
   */
  dir?: Direction;
}

export interface ItemProps extends EmptyProps<"li">, CompositionProps {
  /**
   * Whether this timeline item is completed.
   * Completed items will be styled with the primary color.
   * @default false
   */
  completed?: boolean;
}

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

export interface ConnectorProps extends EmptyProps<"div">, CompositionProps {}
