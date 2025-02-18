import * as React from "react";
import { trieMemoize } from "./memo";
import { useForceUpdate } from "./use-force-update";
import type { Positioner } from "./use-positioner";

type WrapperFn<T extends unknown[]> = {
  (...args: T): void;
  cancel: () => void;
};

function rafSchd<T extends unknown[]>(fn: (...args: T) => void): WrapperFn<T> {
  let lastArgs: T = [] as unknown as T;
  let frameId: number | null = null;

  const wrapperFn = (...args: T): void => {
    // Always capture the latest value
    lastArgs = args;

    // There is already a frame queued
    if (frameId) {
      return;
    }

    // Schedule a new frame
    frameId = requestAnimationFrame(() => {
      frameId = null;
      fn(...lastArgs);
    });
  };

  // Adding cancel property to result function
  wrapperFn.cancel = () => {
    if (!frameId) {
      return;
    }

    cancelAnimationFrame(frameId);
    frameId = null;
  };

  return wrapperFn;
}

/**
 * Creates a resize observer that forces updates to the grid cell positions when mutations are
 * made to cells affecting their height.
 *
 * @param positioner - The masonry cell positioner created by the `usePositioner()` hook.
 */
export function useResizeObserver(positioner: Positioner) {
  const forceUpdate = useForceUpdate();
  const resizeObserver = createResizeObserver(positioner, forceUpdate);
  // Cleans up the resize observers when they change or the
  // component unmounts
  React.useEffect(() => () => resizeObserver.disconnect(), [resizeObserver]);
  return resizeObserver;
}

/**
 * Creates a resize observer that fires an `updater` callback whenever the height of
 * one or many cells change. The `useResizeObserver()` hook is using this under the hood.
 *
 * @param positioner - A cell positioner created by the `usePositioner()` hook or the `createPositioner()` utility
 * @param updater - A callback that fires whenever one or many cell heights change.
 */
export const createResizeObserver = trieMemoize(
  [WeakMap],
  // TODO: figure out a way to test this
  /* istanbul ignore next */
  (positioner: Positioner, updater: (updates: number[]) => void) => {
    const updates: number[] = [];
    const elementsCache = new WeakMap<Element, number>();

    const update = rafSchd(() => {
      if (updates.length > 0) {
        // Updates the size/positions of the cell with the resize
        // observer updates
        positioner.update(updates);
        updater(updates);
      }
      updates.length = 0;
    });

    const commonHandler = (target: HTMLElement) => {
      const height = target.offsetHeight;
      if (height > 0) {
        const index = elementsCache.get(target);
        if (index !== void 0) {
          const position = positioner.get(index);
          if (position !== void 0 && height !== position.height) {
            updates.push(index, height);
          }
        }
      }
      update();
    };

    const handlers = new Map<number, WrapperFn<[HTMLElement]>>();
    const handleEntries: ResizeObserverCallback = (entries) => {
      for (const entry of entries) {
        if (!entry) continue;
        const index = elementsCache.get(entry.target);

        if (index === void 0) continue;
        let handler = handlers.get(index);
        if (!handler) {
          handler = rafSchd(commonHandler);
          handlers.set(index, handler);
        }
        handler(entry.target as HTMLElement);
      }
    };

    const ro = new ResizeObserver(handleEntries);
    // Overrides the original disconnect to include cancelling handling the entries.
    // Ideally this would be its own method but that would result in a breaking
    // change.
    const disconnect = ro.disconnect.bind(ro);
    ro.disconnect = () => {
      disconnect();
      for (const [, handler] of handlers) {
        handler.cancel();
      }
    };

    return ro;
  }
);
