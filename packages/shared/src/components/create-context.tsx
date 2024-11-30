import * as React from "react";

/**
 * Creates a type-safe context and provider with automatic error handling
 * @template T The type of the context value
 * @param name The name of the root component for error messages
 * @param defaultValue Optional default value for the context
 */
function createContext<T extends object | null>(
  name: string,
  defaultValue?: T,
) {
  const Context = React.createContext<T | undefined>(defaultValue);
  Context.displayName = name;

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

  Provider.displayName = `${name}Provider`;

  function useContext(consumerName: string): T {
    const context = React.useContext(Context);

    if (context) return context;
    if (defaultValue !== undefined) return defaultValue;

    throw new Error(`\`${consumerName}\` must be used within \`${name}\``);
  }

  return [Provider, useContext] as const;
}

export { createContext };
