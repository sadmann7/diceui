import * as React from "react";
import { useDebounceState } from "./use-debounce-state";

const emptyObj = {};

export interface DebouncedWindowSizeOptions {
  initialWidth?: number;
  initialHeight?: number;
  wait?: number;
  leading?: boolean;
}

const win = typeof window === "undefined" ? null : window;
const wv =
  win && typeof win.visualViewport !== "undefined" ? win.visualViewport : null;

const getSize = () =>
  [
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  ] as const;

export const useWindowSize = (
  options: DebouncedWindowSizeOptions = emptyObj
): readonly [number, number] => {
  const { wait, leading, initialWidth = 0, initialHeight = 0 } = options;
  const [size, setDebouncedSize] = useDebounceState<readonly [number, number]>(
    typeof document === "undefined" ? [initialWidth, initialHeight] : getSize(),
    { wait, leading }
  );

  React.useEffect(() => {
    const setSize = () => setDebouncedSize(getSize());

    win?.addEventListener("resize", setSize);
    wv?.addEventListener("resize", setSize);
    win?.addEventListener("orientationchange", setSize);

    return () => {
      win?.removeEventListener("resize", setSize);
      wv?.removeEventListener("resize", setSize);
      win?.removeEventListener("orientationchange", setSize);
    };
  }, [setDebouncedSize]);

  return size;
};

export const useWindowHeight = (
  options?: Omit<DebouncedWindowSizeOptions, "initialWidth">
): number => useWindowSize(options)[1];

export const useWindowWidth = (
  options?: Omit<DebouncedWindowSizeOptions, "initialHeight">
): number => useWindowSize(options)[0];
