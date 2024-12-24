/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/context/src/createContext.tsx
 */

import * as React from "react";

/**
 * Creates a type-safe context and provider with automatic error handling
 * @template T The type of the context value
 * @param name The name of the root component for error messages
 * @param defaultValue Optional default value for the context
 */
function createContext<T extends object | null>(
  rootComponentName: string,
  defaultValue?: T,
) {
  const Context = React.createContext<T | undefined>(defaultValue);
  Context.displayName = rootComponentName;

  function Provider(props: T & { children: React.ReactNode }) {
    const { children, ...contextValue } = props;

    // Memoize the context value by its values
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const value = React.useMemo(
      () => contextValue,
      Object.values(contextValue),
    ) as T;

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  Provider.displayName = `${rootComponentName}Provider`;

  type ContextReturn<Required extends boolean> = Required extends true
    ? T
    : T | undefined;

  /**
   * @param consumerName The name of the component that is consuming the context
   * @param required Whether the context is required
   */
  function useContext<Required extends boolean = true>(
    consumerName: string,
    required?: Required,
  ): ContextReturn<Required> {
    const context = React.useContext(Context);

    if (context) return context;
    if (defaultValue !== undefined) return defaultValue;

    if (required) {
      throw new Error(
        `\`${consumerName}\` must be used within \`${rootComponentName}\``,
      );
    }

    return undefined as ContextReturn<Required>;
  }

  return [Provider, useContext] as const;
}

export { createContext };
