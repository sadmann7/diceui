import * as React from "react";

import { OneKeyMap, memoizeOne, trieMemoize } from "./memo";
import { useForceUpdate } from "./use-force-update";
import { useLatest } from "./use-latest";
import type { Positioner } from "./use-positioner";

// This is for triggering a remount after SSR has loaded in the client w/ hydrate()
let didEverMount = "0";

type ElementType = React.ElementType<React.HTMLAttributes<HTMLElement>>;

interface BaseItemProps extends React.HTMLAttributes<HTMLElement> {
  key?: string | number;
  ref?: (el: HTMLElement | null) => void;
  role?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface UseMasonryOptions<Item> {
  items: Item[];
  positioner: Positioner;
  resizeObserver?: {
    observe: ResizeObserver["observe"];
    disconnect: ResizeObserver["observe"];
    unobserve: ResizeObserver["unobserve"];
  };
  as?: ElementType;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  role?: "grid" | "list";
  tabIndex?: number;
  containerRef?:
    | ((element: HTMLElement) => void)
    | React.MutableRefObject<HTMLElement | null>;
  itemAs?: ElementType;
  itemStyle?: React.CSSProperties;
  itemHeightEstimate?: number;
  itemKey?: (data: Item, index: number) => string | number;
  overscanBy?: number;
  height: number;
  scrollTop: number;
  isScrolling?: boolean;
  render: React.ComponentType<RenderComponentProps<Item>>;
  onRender?: (startIndex: number, stopIndex: number, items: Item[]) => void;
}

/** Renders phases of the masonry layout and returns the grid as a React element. */
export function useMasonry<Item>({
  // Measurement and layout
  positioner,
  resizeObserver,
  // Grid items
  items,
  // Container props
  as: ContainerComponent = "div",
  id,
  className,
  style,
  role = "grid",
  tabIndex = 0,
  containerRef,
  // Item props
  itemAs: ItemComponent = "div",
  itemStyle,
  itemHeightEstimate = 300,
  itemKey = defaultGetItemKey,
  // Rendering props
  overscanBy = 2,
  scrollTop,
  isScrolling,
  height,
  render: RenderComponent,
  onRender,
}: UseMasonryOptions<Item>) {
  let startIndex = 0;
  let stopIndex: number | undefined;
  const forceUpdate = useForceUpdate();
  const setItemRef = getRefSetter(positioner, resizeObserver);
  const itemCount = items.length;
  const {
    columnWidth,
    columnCount,
    range,
    estimateHeight,
    size,
    shortestColumn,
  } = positioner;
  const measuredCount = size();
  const shortestColumnSize = shortestColumn();
  const children: React.ReactElement[] = [];
  const itemRole =
    role === "list" ? "listitem" : role === "grid" ? "gridcell" : undefined;
  const storedOnRender = useLatest(onRender);

  overscanBy = height * overscanBy;
  const rangeEnd = scrollTop + overscanBy;
  const needsFreshBatch =
    shortestColumnSize < rangeEnd && measuredCount < itemCount;

  range(
    // We overscan in both directions because users scroll both ways,
    // though one must admit scrolling down is more common and thus
    // we only overscan by half the downward overscan amount
    Math.max(0, scrollTop - overscanBy / 2),
    rangeEnd,
    (index, left, top) => {
      const data = items[index];
      if (!data) return;
      const key = itemKey(data, index);
      const phaseTwoStyle: React.CSSProperties = {
        top,
        left,
        width: columnWidth,
        writingMode: "horizontal-tb",
        position: "absolute",
      };

      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        throwWithoutData(data, index);
      }

      children.push(
        React.createElement(
          ItemComponent,
          {
            key,
            ref: setItemRef(index),
            role: itemRole,
            style:
              typeof itemStyle === "object" && itemStyle !== null
                ? Object.assign({}, phaseTwoStyle, itemStyle)
                : phaseTwoStyle,
          } as BaseItemProps,
          createRenderElement(RenderComponent, index, data, columnWidth),
        ),
      );

      if (stopIndex === void 0) {
        startIndex = index;
        stopIndex = index;
      } else {
        startIndex = Math.min(startIndex, index);
        stopIndex = Math.max(stopIndex, index);
      }
    },
  );

  if (needsFreshBatch) {
    const batchSize = Math.min(
      itemCount - measuredCount,
      Math.ceil(
        ((scrollTop + overscanBy - shortestColumnSize) / itemHeightEstimate) *
          columnCount,
      ),
    );

    let index = measuredCount;
    const phaseOneStyle = getCachedSize(columnWidth);

    for (; index < measuredCount + batchSize; index++) {
      const data = items[index];
      if (!data) continue;
      const key = itemKey(data, index);

      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        throwWithoutData(data, index);
      }

      children.push(
        React.createElement(
          ItemComponent,
          {
            key,
            ref: setItemRef(index),
            role: itemRole,
            style:
              typeof itemStyle === "object"
                ? Object.assign({}, phaseOneStyle, itemStyle)
                : phaseOneStyle,
          } as BaseItemProps,
          createRenderElement(RenderComponent, index, data, columnWidth),
        ),
      );
    }
  }

  // Calls the onRender callback if the rendered indices changed
  React.useEffect(() => {
    if (typeof storedOnRender.current === "function" && stopIndex !== void 0)
      storedOnRender.current(startIndex, stopIndex, items);

    didEverMount = "1";
  }, [startIndex, stopIndex, items, storedOnRender]);
  // If we needed a fresh batch we should reload our components with the measured
  // sizes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (needsFreshBatch) forceUpdate();
  }, [needsFreshBatch, positioner]);

  // gets the container style object based upon the estimated height and whether or not
  // the page is being scrolled
  const containerStyle = getContainerStyle(
    isScrolling,
    estimateHeight(itemCount, itemHeightEstimate),
  );

  const containerProps = {
    ref: containerRef,
    key: didEverMount,
    id,
    role,
    className,
    tabIndex,
    style:
      typeof style === "object" && style !== null
        ? assignUserStyle(containerStyle, style as React.CSSProperties)
        : containerStyle,
  } as const;

  return React.createElement(ContainerComponent, containerProps, children);
}

function throwWithoutData(data: unknown, index: number) {
  if (!data) {
    throw new Error(
      [
        `No data was found at index: ${index}`,
        "",
        'This usually happens when you\'ve mutated or changed the "items" array in a',
        'way that makes it shorter than the previous "items" array. Masonic knows nothing',
        "about your underlying data and when it caches cell positions, it assumes you aren't",
        'mutating the underlying "items".',
        "",
        "See https://codesandbox.io/s/masonic-w-react-router-example-2b5f9?file=/src/index.js for",
        "an example that gets around this limitations. For advanced implementations, see",
        "https://codesandbox.io/s/masonic-w-react-router-and-advanced-config-example-8em42?file=/src/index.js",
        "",
        'If this was the result of your removing an item from your "items", see this issue:',
        "https://github.com/jaredLunde/masonic/issues/12",
      ].join("\n"),
    );
  }
}

export interface RenderComponentProps<Item> {
  /**
   * The index of the cell in the `items` prop array.
   */
  index: number;
  /**
   * The rendered width of the cell's column.
   */
  width: number;
  /**
   * The data at `items[index]` of your `items` prop array.
   */
  data: Item;
}

//
// Render-phase utilities

// ~5.5x faster than createElement without the memo
const createRenderElement = trieMemoize(
  [OneKeyMap, {}, WeakMap, OneKeyMap],
  <Item,>(
    RenderComponent: React.ComponentType<RenderComponentProps<Item>>,
    index: number,
    data: Item,
    columnWidth: number,
  ) =>
    React.createElement(RenderComponent, {
      index,
      data,
      width: columnWidth,
    }),
);

const getContainerStyle = memoizeOne(
  (
    isScrolling: boolean | undefined,
    estimateHeight: number,
  ): React.CSSProperties => ({
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    height: Math.ceil(estimateHeight),
    maxHeight: Math.ceil(estimateHeight),
    willChange: isScrolling ? "contents" : undefined,
    pointerEvents: isScrolling ? "none" : undefined,
  }),
);

const cmp2 = (args: IArguments, pargs: IArguments | unknown[]): boolean =>
  args[0] === pargs[0] && args[1] === pargs[1];

const assignUserStyle = memoizeOne(
  (
    containerStyle: React.CSSProperties,
    userStyle: React.CSSProperties,
  ): React.CSSProperties => Object.assign({}, containerStyle, userStyle),
  // @ts-expect-error
  cmp2,
);

function defaultGetItemKey<Item>(_: Item, i: number) {
  return i;
}

// the below memoizations for for ensuring shallow equal is reliable for pure
// component children
const getCachedSize = memoizeOne(
  (width: number): React.CSSProperties => ({
    width,
    zIndex: -1000,
    visibility: "hidden",
    position: "absolute",
    writingMode: "horizontal-tb",
  }),
  (args, pargs) => args[0] === pargs[0],
);

const getRefSetter = memoizeOne(
  (
    positioner: Positioner,
    resizeObserver?: UseMasonryOptions<unknown>["resizeObserver"],
  ) =>
    (index: number) =>
    (el: HTMLElement | null): void => {
      const elementsCache: WeakMap<Element, number> = new WeakMap();

      if (el === null) return;
      if (resizeObserver) {
        resizeObserver.observe(el);
        elementsCache.set(el, index);
      }
      if (positioner.get(index) === void 0)
        positioner.set(index, el.offsetHeight);
    },
  // @ts-expect-error - This is a memoization function that compares two arguments
  cmp2,
);
