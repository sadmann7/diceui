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
   *
   * @default undefined
   */
  defaultValue?: string;

  /**
   * Callback fired when the active section changes.
   *
   * ```ts
   * onValueChange={(value) => {
   *   console.log(value);
   * }}
   * ```
   */
  onValueChange?: (value: string) => void;

  /**
   * Root margin for the intersection observer.
   * Useful for adjusting when sections become "active".
   *
   * ```ts
   * rootMargin="-100px 0px 0px 0px"
   * ```
   *
   * @default undefined
   */
  rootMargin?: string;

  /**
   * Intersection threshold for detecting visibility.
   *
   * ```ts
   * threshold={0.5}
   * ```
   *
   * @default 0.1
   */
  threshold?: number | number[];

  /**
   * Scroll offset when navigating to sections.
   * Useful for fixed headers.
   *
   * ```ts
   * offset={100}
   * ```
   *
   * @default 0
   */
  offset?: number;

  /**
   * Scroll behavior when navigating to sections.
   * Respects user preferences by default - uses `"auto"` if `prefers-reduced-motion` is set to `reduce`, otherwise `"smooth"`.
   *
   * ```ts
   * scrollBehavior="smooth"
   * ```
   *
   * @default "auto" if reduced motion, "smooth" otherwise
   */
  scrollBehavior?: ScrollBehavior;

  /**
   * The direction of the scrollspy.
   *
   * ```ts
   * dir="rtl"
   * ```
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the scrollspy.
   *
   * ```ts
   * orientation="vertical"
   * ```
   *
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * An optional scroll container where the scroll observation should happen.
   * If not provided, uses the window scroll.
   *
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
