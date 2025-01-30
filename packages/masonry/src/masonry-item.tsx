import { Primitive } from "@diceui/shared";
import * as React from "react";
import { useMasonryContext } from "./masonry-root";

const ITEM_NAME = "MasonryItem";

interface MasonryItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** The index of this item in the items array */
  index: number;
}

const MasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  (props, forwardedRef) => {
    const { index, children, style, ...itemProps } = props;
    const itemRef = React.useRef<HTMLDivElement>(null);
    const { columnCount, columnWidth, columnGutter, rowGutter, onItemResize } =
      useMasonryContext(ITEM_NAME);

    // Calculate item position
    const column = index % columnCount;
    const left = column * (columnWidth + columnGutter);

    // Monitor item height changes
    React.useLayoutEffect(() => {
      const element = itemRef.current;
      if (!element) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          if (height > 0) {
            onItemResize(index, height);
          }
        }
      });

      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }, [index, onItemResize]);

    return (
      <Primitive.div
        ref={itemRef}
        style={{
          position: "absolute",
          top: 0,
          left,
          width: columnWidth,
          ...style,
        }}
        {...itemProps}
      >
        {children}
      </Primitive.div>
    );
  },
);

MasonryItem.displayName = ITEM_NAME;

export { MasonryItem };
export type { MasonryItemProps };
