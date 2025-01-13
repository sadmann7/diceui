import * as React from "react";

interface UseLabelProps {
  defaultValue?: string;
}

function useLabel<T extends HTMLElement>({ defaultValue }: UseLabelProps) {
  const [label, setLabel] = React.useState(defaultValue ?? "");

  const onLabelChange = React.useCallback((node: T | null) => {
    setLabel((node?.textContent ?? "").trim());
  }, []);

  return { label: defaultValue ?? label, onLabelChange };
}

export { useLabel };
