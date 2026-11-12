/**
 * @see https://github.com/facebook/react/issues/14099
 */

import * as React from "react";

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Returns a stable callback that always calls the latest `callback`.
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

  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return React.useCallback((event: E, ...args: Parameters<T>) => {
    const fn = callbackRef.current;
    return fn(event, ...args);
  }, []);
}

/**
 * Like `useEventCallback`, without a separate event type parameter.
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

export { useEvent, useEventCallback };
