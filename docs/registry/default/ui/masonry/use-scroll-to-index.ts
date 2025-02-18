import * as React from "react";
import { useLatest } from "./use-latest";
import type { Positioner, PositionerItem } from "./use-positioner";
import { useEvent } from "./use-scroller";
import { useThrottleCallback } from "./use-throttle-callback";

const defaultState = {
  index: void 0,
  position: void 0,
  prevTop: void 0,
} as const;

export type UseScrollToIndexOptions = {
  /**
   * The window element or a React ref for the window element. That is,
   * this is the grid container.
   *
   * @default window
   */
  element?: Window | HTMLElement | React.RefObject<HTMLElement> | null;
  /**
   * Sets the vertical alignment of the cell within the grid container.
   *
   * @default "top"
   */
  align?: "center" | "top" | "bottom";
  /**
   * The height of the grid.
   *
   * @default window.innerHeight
   */
  height?: number;
  /**
   * The vertical space in pixels between the top of the grid container and the top
   * of the window.
   *
   * @default 0
   */
  offset?: number;
};

/**
 * A hook that creates a callback for scrolling to a specific index in
 * the "items" array.
 *
 * @param positioner - A positioner created by the `usePositioner()` hook
 * @param options - Configuration options
 */
export function useScrollToIndex(
  positioner: Positioner,
  options: UseScrollToIndexOptions
) {
  const {
    align = "top",
    element = typeof window !== "undefined" && window,
    offset = 0,
    height = typeof window !== "undefined" ? window.innerHeight : 0,
  } = options;
  const latestOptions = useLatest({
    positioner,
    element,
    align,
    offset,
    height,
  } as const);
  const getTarget = React.useRef(() => {
    const latestElement = latestOptions.current.element;
    return latestElement && "current" in latestElement
      ? latestElement.current
      : latestElement;
  }).current;
  const [state, dispatch] = React.useReducer(
    (
      state: {
        position: PositionerItem | undefined;
        index: number | undefined;
        prevTop: number | undefined;
      },
      action:
        | { type: "scrollToIndex"; value: number | undefined }
        | { type: "setPosition"; value: PositionerItem | undefined }
        | { type: "setPrevTop"; value: number | undefined }
        | { type: "reset" }
    ) => {
      const nextState = {
        position: state.position,
        index: state.index,
        prevTop: state.prevTop,
      };

      /* istanbul ignore next */
      if (action.type === "scrollToIndex") {
        return {
          position: latestOptions.current.positioner.get(action.value ?? -1),
          index: action.value,
          prevTop: void 0,
        };
      }
      if (action.type === "setPosition") {
        nextState.position = action.value;
      }
      if (action.type === "setPrevTop") {
        nextState.prevTop = action.value;
      }
      if (action.type === "reset") {
        return defaultState;
      }

      return nextState;
    },
    defaultState
  );
  const throttledDispatch = useThrottleCallback(dispatch, 15);

  // If we find the position along the way we can immediately take off
  // to the correct spot.
  useEvent(getTarget() as Window, "scroll", () => {
    if (!state.position && state.index) {
      const position = latestOptions.current.positioner.get(state.index);

      if (position) {
        dispatch({ type: "setPosition", value: position });
      }
    }
  });

  // If the top changes out from under us in the case of dynamic cells, we
  // want to keep following it.
  const currentTop =
    state.index !== void 0 &&
    latestOptions.current.positioner.get(state.index)?.top;

  React.useEffect(() => {
    const target = getTarget();
    if (!target) return;
    const { height, align, offset, positioner } = latestOptions.current;

    if (state.position) {
      let scrollTop = state.position.top;

      if (align === "bottom") {
        scrollTop = scrollTop - height + state.position.height;
      } else if (align === "center") {
        scrollTop -= (height - state.position.height) / 2;
      }

      target.scrollTo(0, Math.max(0, (scrollTop += offset)));
      // Resets state after 400ms, an arbitrary time I determined to be
      // still visually pleasing if there is a slow network reply in dynamic
      // cells
      let didUnsubscribe = false;
      const timeout = setTimeout(
        () => !didUnsubscribe && dispatch({ type: "reset" }),
        400
      );
      return () => {
        didUnsubscribe = true;
        clearTimeout(timeout);
      };
    }
    if (state.index !== void 0) {
      // Estimates the top based upon the average height of current cells
      let estimatedTop =
        (positioner.shortestColumn() / positioner.size()) * state.index;
      if (state.prevTop)
        estimatedTop = Math.max(estimatedTop, state.prevTop + height);
      target.scrollTo(0, estimatedTop);
      throttledDispatch({ type: "setPrevTop", value: estimatedTop });
    }
  }, [currentTop, state, latestOptions, getTarget, throttledDispatch]);

  return React.useRef((index: number) => {
    dispatch({ type: "scrollToIndex", value: index });
  }).current;
}
