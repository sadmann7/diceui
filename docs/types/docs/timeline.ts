import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"ol">, CompositionProps {
  /**
   * The orientation of the timeline.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";

  /**
   * The position of the timeline items relative to the line.
   * Only applies to vertical orientation.
   * @default "left"
   */
  position?: "left" | "right" | "alternate";
}

export interface ItemProps extends EmptyProps<"li">, CompositionProps {
  /**
   * Whether this is the current/active timeline item.
   * Applies different visual styling to highlight the active state.
   * @default false
   */
  active?: boolean;

  /**
   * The status/variant of the timeline item.
   * Affects the color scheme of the marker and connector.
   * @default "default"
   */
  status?: "default" | "primary" | "success" | "warning" | "destructive";
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
