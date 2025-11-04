import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The currently active section ID.
   * Use for controlled behavior.
   *
   * ```ts
   * value="introduction"
   * ```
   */
  value?: string;

  /**
   * The default active section ID.
   * Use for uncontrolled behavior.
   * @default undefined
   */
  defaultValue?: string;

  /**
   * Callback fired when the active section changes.
   */
  onValueChange?: (value: string) => void;

  /**
   * Root margin for the intersection observer.
   * Useful for adjusting when sections become "active".
   * @default "0px 0px -80% 0px"
   * @example "-100px 0px 0px 0px"
   */
  rootMargin?: string;

  /**
   * Intersection threshold for detecting visibility.
   * @default 0.1
   */
  threshold?: number | number[];

  /**
   * Scroll offset when navigating to sections.
   * Useful for fixed headers.
   * @default 0
   */
  offset?: number;

  /**
   * Scroll behavior when navigating to sections.
   * @default "smooth"
   */
  scrollBehavior?: ScrollBehavior;

  /**
   * The direction of the scrollspy.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the scrollspy.
   * @default "horizontal"
   */
  orientation?: Orientation;
}

export interface ItemGroupProps extends EmptyProps<"nav">, CompositionProps {}

export interface ItemProps extends EmptyProps<"a">, CompositionProps {
  /**
   * The unique value that links the item with the content.
   *
   * ```ts
   * value="introduction"
   * ```
   */
  value: string;
}

export interface ContentGroupProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface ContentProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique value that links the content with the item.
   *
   * ```ts
   * value="introduction"
   * ```
   */
  value: string;
}
