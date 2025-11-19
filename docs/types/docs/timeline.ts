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

  /**
   * The visual variant of the timeline.
   * Affects the color scheme of all markers and connectors in the timeline.
   * @default "default"
   */
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

export interface ItemProps extends EmptyProps<"li">, CompositionProps {
  /**
   * Whether this is the current/active timeline item.
   * Applies different visual styling to highlight the active state.
   * @default false
   */
  active?: boolean;
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
