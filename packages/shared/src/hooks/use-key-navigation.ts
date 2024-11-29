import * as React from "react";

interface UseKeyNavigationProps {
  containerRef: React.RefObject<HTMLElement>;
  itemCount: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  itemSelector?: string;
  dir?: "ltr" | "rtl";
  loop?: boolean;
  orientation?: "horizontal" | "vertical" | "both";
  preventScroll?: boolean;
  focus?: boolean;
}

export function useKeyNavigation({
  containerRef,
  itemCount,
  currentIndex,
  onIndexChange,
  itemSelector = "[data-dice-collection-item]",
  dir = "ltr",
  loop = false,
  orientation = "both",
  preventScroll = true,
  focus = false,
}: UseKeyNavigationProps) {
  const findNextEnabledIndex = React.useCallback(
    (currentIdx: number, direction: "next" | "prev"): number => {
      const rootElement = containerRef.current;
      if (!rootElement) return -1;

      const items = Array.from(rootElement.querySelectorAll(itemSelector));
      console.log({ items });
      let nextIndex = currentIdx;

      do {
        if (direction === "next") {
          nextIndex =
            nextIndex >= itemCount - 1 ? (loop ? 0 : -1) : nextIndex + 1;
        } else {
          nextIndex =
            nextIndex <= 0 ? (loop ? itemCount - 1 : -1) : nextIndex - 1;
        }

        if (nextIndex === -1) break;

        const item = items[nextIndex];
        if (item && !item.hasAttribute("data-disabled")) {
          return nextIndex;
        }
      } while (
        nextIndex !== currentIdx &&
        (loop || (nextIndex >= 0 && nextIndex < itemCount))
      );

      return -1;
    },
    [containerRef, itemCount, loop, itemSelector],
  );

  const onKeyNavigation = React.useCallback(
    (event: React.KeyboardEvent) => {
      const goingVertical =
        event.key === "ArrowUp" || event.key === "ArrowDown";
      const goingHorizontal =
        event.key === "ArrowLeft" || event.key === "ArrowRight";

      if (
        (!event.key.startsWith("Arrow") &&
          event.key !== "Home" &&
          event.key !== "End") ||
        (orientation === "vertical" && goingHorizontal) ||
        (orientation === "horizontal" && goingVertical)
      ) {
        return;
      }

      if (preventScroll) {
        event.preventDefault();
      }

      const target = event.target as HTMLElement;
      const isArrowLeft =
        (event.key === "ArrowLeft" && dir === "ltr") ||
        (event.key === "ArrowRight" && dir === "rtl");
      const isArrowRight =
        (event.key === "ArrowRight" && dir === "ltr") ||
        (event.key === "ArrowLeft" && dir === "rtl");

      let nextIndex = -1;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight": {
          if (currentIndex !== -1) {
            nextIndex = findNextEnabledIndex(
              currentIndex,
              isArrowLeft ? "prev" : "next",
            );
            if (nextIndex !== -1) {
              onIndexChange(nextIndex);
              event.preventDefault();
            } else if (isArrowRight) {
              onIndexChange(-1);
              if (target instanceof HTMLInputElement) {
                target.setSelectionRange(0, 0);
              }
            }
          }
          break;
        }
        case "Home": {
          if (currentIndex !== -1) {
            nextIndex = findNextEnabledIndex(-1, "next");
            onIndexChange(nextIndex);
            event.preventDefault();
          }
          break;
        }
        case "End": {
          if (currentIndex !== -1) {
            nextIndex = findNextEnabledIndex(itemCount, "prev");
            onIndexChange(nextIndex);
            event.preventDefault();
          }
          break;
        }
      }

      if (focus && nextIndex !== -1) {
        const items = containerRef.current?.querySelectorAll(itemSelector);
        (items?.[nextIndex] as HTMLElement)?.focus();
      }
    },
    [
      currentIndex,
      dir,
      findNextEnabledIndex,
      itemCount,
      onIndexChange,
      orientation,
      preventScroll,
      focus,
      itemSelector,
      containerRef,
    ],
  );

  return {
    onKeyNavigation,
    findNextEnabledIndex,
  };
}
