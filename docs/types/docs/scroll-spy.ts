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
   * @default undefined
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

  /**
   * An optional scroll container where the scroll observation should happen.
   * If not provided, uses the window scroll.
   * @example
   * ```tsx
   * const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
   *
   * <ScrollSpy scrollContainer={scrollContainer}>
   *   <ScrollSpyViewport ref={setScrollContainer} className="h-screen overflow-y-auto">
   *     // content
   *   </ScrollSpyViewport>
   * </ScrollSpy>
   * ```
   */
  scrollContainer?: HTMLElement | null;
}

export interface NavProps extends EmptyProps<"nav">, CompositionProps {}

export interface LinkProps extends EmptyProps<"a">, CompositionProps {
  /**
   * The unique value that links the link with the section.
   *
   * ```ts
   * value="introduction"
   * ```
   */
  value: string;
}

export interface ViewportProps extends EmptyProps<"div">, CompositionProps {}

export interface SectionProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique value that links the section with the link.
   *
   * ```ts
   * value="introduction"
   * ```
   */
  value: string;
}
