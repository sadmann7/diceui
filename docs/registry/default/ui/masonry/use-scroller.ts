import * as React from "react";
import { useThrottle } from "./use-throttle-callback";

const requestTimeout = (fn: () => void, delay: number) => {
  const start = performance.now();
  const handle = {
    id: requestAnimationFrame(function tick(timestamp) {
      if (timestamp - start >= delay) {
        fn();
      } else {
        handle.id = requestAnimationFrame(tick);
      }
    }),
  };
  return handle;
};

const clearRequestTimeout = (handle: { id: number }) => {
  cancelAnimationFrame(handle.id);
};

/**
 * A hook for tracking whether the `window` is currently being scrolled and it's scroll position on
 * the y-axis. These values are used for determining which grid cells to render and when
 * to add styles to the masonry container that maximize scroll performance.
 *
 * @param offset - The vertical space in pixels between the top of the grid container and the top
 *  of the browser `document.documentElement`.
 * @param fps - This determines how often (in frames per second) to update the scroll position of the
 *  browser `window` in state, and as a result the rate the masonry grid recalculates its visible cells.
 *  The default value of `12` has been very reasonable in my own testing, but if you have particularly
 *  heavy `render` components it may be prudent to reduce this number.
 */
export function useScroller(
  offset = 0,
  fps = 12,
): { scrollTop: number; isScrolling: boolean } {
  const scrollTop = useWindowScroll(fps);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const didMount = React.useRef(0);

  React.useEffect(() => {
    if (didMount.current === 1) setIsScrolling(true);
    let didUnsubscribe = false;
    const to = requestTimeout(
      () => {
        if (didUnsubscribe) return;
        // This is here to prevent premature bail outs while maintaining high resolution
        // unsets. Without it there will always bee a lot of unnecessary DOM writes to style.
        setIsScrolling(false);
      },
      40 + 1000 / fps,
    );
    didMount.current = 1;
    return () => {
      didUnsubscribe = true;
      clearRequestTimeout(to);
    };
  }, [fps, scrollTop]);

  return { scrollTop: Math.max(0, scrollTop - offset), isScrolling };
}

type EventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap;
type EventTarget = HTMLElement | Document | Window | null;
type EventType = keyof EventMap;

export function useEvent<K extends EventType>(
  target: EventTarget | { current: EventTarget },
  type: K,
  listener: (ev: EventMap[K]) => void,
  cleanup?: () => void,
): void {
  const storedListener = React.useRef(listener);
  const storedCleanup = React.useRef(cleanup);

  React.useEffect(() => {
    storedListener.current = listener;
    storedCleanup.current = cleanup;
  });

  React.useEffect(() => {
    const targetEl = target && "current" in target ? target.current : target;
    if (!targetEl) return;

    let didUnsubscribe = 0;
    const eventHandler = ((ev: Event) => {
      if (didUnsubscribe) return;
      storedListener.current(ev as EventMap[K]);
    }) as EventListener;

    targetEl.addEventListener(type, eventHandler);

    return () => {
      didUnsubscribe = 1;
      targetEl.removeEventListener(type, eventHandler);
      storedCleanup.current?.();
    };
  }, [target, type]);
}

const win = typeof window === "undefined" ? null : window;
const getScrollY = (): number =>
  (win as Window).scrollY !== void 0
    ? (win as Window).scrollY
    : (win as Window).pageYOffset === void 0
      ? 0
      : (win as Window).pageYOffset;

export const useWindowScroll = (fps = 30): number => {
  const state = useThrottle(
    typeof window === "undefined" ? 0 : getScrollY,
    fps,
    true,
  );
  useEvent(win, "scroll", (): void => state[1](getScrollY()));
  return state[0];
};

export default useWindowScroll;
