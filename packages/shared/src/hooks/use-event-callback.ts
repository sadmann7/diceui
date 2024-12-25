/**
 * @see https://github.com/facebook/react/issues/14099
 */

import * as React from "react";

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * A hook that returns a stable callback reference that can access the latest props/state
 * and receive events. This is useful for callbacks that need to be passed to child components
 * while still having access to the latest values without causing unnecessary re-renders.
 *
 * @example
 * ```tsx
 * const MyComponent = ({ value }) => {
 *   const handleClick = useEventCallback((event: React.MouseEvent) => {
 *     console.log('Current value:', value);
 *     console.log('Event:', event);
 *   });
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * };
 * ```
 */
function useEventCallback<E, T extends AnyFunction>(
  callback: (event: E, ...args: Parameters<T>) => ReturnType<T>,
): (event: E, ...args: Parameters<T>) => ReturnType<T> {
  const callbackRef = React.useRef(callback);

  // Update ref each render so the callback stays fresh
  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // Return stable function reference
  return React.useCallback((event: E, ...args: Parameters<T>) => {
    const fn = callbackRef.current;
    return fn(event, ...args);
  }, []);
}

/**
 * A simpler version of useEventCallback that doesn't require explicit event typing.
 * Useful when you don't need to type the event parameter.
 *
 * @example
 * ```tsx
 * const MyComponent = ({ value }) => {
 *   const handleClick = useEvent(() => {
 *     console.log('Current value:', value);
 *   });
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * };
 * ```
 */
function useEvent<T extends AnyFunction>(callback: T): T {
  const callbackRef = React.useRef(callback);

  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return React.useCallback((...args: Parameters<T>) => {
    const fn = callbackRef.current;
    return fn(...args);
  }, []) as T;
}

export { useEventCallback, useEvent };
