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
      // Provide size as early as possible.
      setSize({ width: element.offsetWidth, height: element.offsetHeight });

      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) return;

        // Only one element is observed, so the first entry is enough.
        if (!entries.length) return;

        const entry = entries[0];
        let width: number;
        let height: number;

        if (entry && "borderBoxSize" in entry) {
          const borderSizeEntry = entry.borderBoxSize;
          // iron out differences between browsers.
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

    // We only want to reset to `undefined` when the element becomes `null`,
    // not if it changes to another element.
    setSize(undefined);
  }, [element]);

  return size;
}

export { useSize };
