import * as React from "react";
import { MasonryScroller } from "./masonry-scroller";
import type { MasonryScrollerProps } from "./masonry-scroller";
import { useContainerPosition } from "./use-container-position";
import { usePositioner } from "./use-positioner";
import type { UsePositionerOptions } from "./use-positioner";
import { useResizeObserver } from "./use-resize-observer";
import { useScrollToIndex } from "./use-scroll-to-index";
import type { UseScrollToIndexOptions } from "./use-scroll-to-index";
import { useWindowSize } from "./use-window-size";

export interface MasonryProps<Item>
  extends Omit<
      MasonryScrollerProps<Item>,
      "offset" | "width" | "height" | "containerRef" | "positioner"
    >,
    Pick<
      UsePositionerOptions,
      | "columnWidth"
      | "columnGutter"
      | "rowGutter"
      | "columnCount"
      | "maxColumnCount"
    > {
  /**
   * Scrolls to a given index within the grid. The grid will re-scroll
   * any time the index changes.
   */
  scrollToIndex?:
    | number
    | {
        index: number;
        align: UseScrollToIndexOptions["align"];
      };
  /**
   * This is the width that will be used for the browser `window` when rendering this component in SSR.
   * This prop isn't relevant for client-side only apps.
   */
  ssrWidth?: number;
  /**
   * This is the height that will be used for the browser `window` when rendering this component in SSR.
   * This prop isn't relevant for client-side only apps.
   */
  ssrHeight?: number;
  /**
   * This determines how often (in frames per second) to update the scroll position of the
   * browser `window` in state, and as a result the rate the masonry grid recalculates its visible cells.
   * The default value of `12` has been very reasonable in my own testing, but if you have particularly
   * heavy `render` components it may be prudent to reduce this number.
   *
   * @default 12
   */
  scrollFps?: number;
}

/**
 * A "batteries included" masonry grid which includes all of the implementation details below. This component is the
 * easiest way to get off and running in your app, before switching to more advanced implementations, if necessary.
 * It will change its column count to fit its container's width and will decide how many rows to render based upon
 * the height of the browser `window`.
 *
 * @param props
 */
export function Masonry<Item>(props: MasonryProps<Item>) {
  const containerRef = React.useRef<null | HTMLElement>(null);
  const windowSize = useWindowSize({
    initialWidth: props.ssrWidth,
    initialHeight: props.ssrHeight,
  });
  const containerPos = useContainerPosition(containerRef, windowSize);
  const nextProps = Object.assign(
    {
      offset: containerPos.offset,
      width: containerPos.width || windowSize[0],
      height: windowSize[1],
      containerRef,
    },
    props,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ) as any;
  nextProps.positioner = usePositioner(nextProps);
  nextProps.resizeObserver = useResizeObserver(nextProps.positioner);
  const scrollToIndex = useScrollToIndex(nextProps.positioner, {
    height: nextProps.height,
    offset: containerPos.offset,
    align:
      typeof props.scrollToIndex === "object"
        ? props.scrollToIndex.align
        : void 0,
  });
  const index =
    props.scrollToIndex &&
    (typeof props.scrollToIndex === "number"
      ? props.scrollToIndex
      : props.scrollToIndex.index);

  React.useEffect(() => {
    if (index !== void 0) scrollToIndex(index);
  }, [index, scrollToIndex]);

  return React.createElement(MasonryScroller, nextProps);
}

Masonry.displayName = "Masonry";
