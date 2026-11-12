/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-size/src/useSize.tsx
 */

import * as React from "react";

import { useLayoutEffect } from "./use-layout-effect";

function useSize(element: HTMLElement | null) {
  const [size, setSize] = React.useState<
    { width: number; height: number } | undefined
  >(undefined);

  useLayoutEffect(() => {
    if (element) {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });

      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) return;

        if (!entries.length) return;

        const entry = entries[0];
        let width: number;
        let height: number;

        if (entry && "borderBoxSize" in entry) {
          const borderSizeEntry = entry.borderBoxSize;
          // Some browsers report a single entry instead of an array.
          const borderSize = Array.isArray(borderSizeEntry)
            ? borderSizeEntry[0]
            : borderSizeEntry;
          width = borderSize.inlineSize;
          height = borderSize.blockSize;
        } else {
          // Browsers without `borderBoxSize` measure the border box from offset sizes.
          width = element.offsetWidth;
          height = element.offsetHeight;
        }

        setSize({ width, height });
      });

      resizeObserver.observe(element, { box: "border-box" });

      return () => resizeObserver.unobserve(element);
    }

    // Resets only when the element becomes `null`, not when it changes to another one.
    setSize(undefined);
  }, [element]);

  return size;
}

export { useSize };
