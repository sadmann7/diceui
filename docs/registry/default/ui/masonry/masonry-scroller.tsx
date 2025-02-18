import { useMasonry } from "./use-masonry";
import type { UseMasonryOptions } from "./use-masonry";
import { useScroller } from "./use-scroller";

export interface MasonryScrollerProps<Item>
  extends Omit<UseMasonryOptions<Item>, "scrollTop" | "isScrolling"> {
  /**
   * This determines how often (in frames per second) to update the scroll position of the
   * browser `window` in state, and as a result the rate the masonry grid recalculates its visible cells.
   * The default value of `12` has been very reasonable in my own testing, but if you have particularly
   * heavy `render` components it may be prudent to reduce this number.
   *
   * @default 12
   */
  scrollFps?: number;
  /**
   * The vertical space in pixels between the top of the grid container and the top
   * of the browser `document.documentElement`.
   *
   * @default 0
   */
  offset?: number;
}

export function MasonryScroller<Item>(props: MasonryScrollerProps<Item>) {
  const { scrollTop, isScrolling } = useScroller(props.offset, props.scrollFps);

  return useMasonry<Item>({
    scrollTop,
    isScrolling,
    positioner: props.positioner,
    resizeObserver: props.resizeObserver,
    items: props.items,
    onRender: props.onRender,
    as: props.as,
    id: props.id,
    className: props.className,
    style: props.style,
    role: props.role,
    tabIndex: props.tabIndex,
    containerRef: props.containerRef,
    itemAs: props.itemAs,
    itemStyle: props.itemStyle,
    itemHeightEstimate: props.itemHeightEstimate,
    itemKey: props.itemKey,
    overscanBy: props.overscanBy,
    height: props.height,
    render: props.render,
  });
}

MasonryScroller.displayName = "MasonryScroller";
