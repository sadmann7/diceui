/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/context/src/createContext.tsx
 */

import * as React from "react";

/** Creates a context provider and a hook that throws outside it unless the context is optional. */
function createContext<T extends object | null>(
  rootComponentName: string,
  defaultValue?: T,
) {
  const Context = React.createContext<T | undefined>(defaultValue);
  Context.displayName = rootComponentName;

  function Provider(props: T & { children: React.ReactNode }) {
    const { children, ...contextValue } = props;

    const value = React.useMemo(
      () => contextValue,
      // oxlint-disable-next-line react/exhaustive-deps -- memoized by every context value
      Object.values(contextValue),
    ) as T;

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  Provider.displayName = `${rootComponentName}Provider`;

  type ContextReturn<Optional extends boolean> = Optional extends true
    ? T | undefined
    : T;

  function useContext<Optional extends boolean = false>(
    consumerName: string,
    optional?: Optional,
  ): ContextReturn<Optional> {
    const context = React.useContext(Context);

    if (!context && !optional) {
      throw new Error(
        `\`${consumerName}\` must be used within \`${rootComponentName}\``,
      );
    }

    if (context) return context;
    if (defaultValue !== undefined) return defaultValue;

    return undefined as ContextReturn<Optional>;
  }

  return [Provider, useContext] as const;
}

export { createContext };
