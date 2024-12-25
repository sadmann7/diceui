import * as React from "react";

export function useAnchor<T extends HTMLElement>() {
  const anchorRef = React.useRef<T | null>(null);
  const [hasAnchor, setHasAnchor] = React.useState(false);

  const onAnchorChange = React.useCallback((node: T | null) => {
    anchorRef.current = node;
  }, []);

  const onHasAnchorChange = React.useCallback((value: boolean) => {
    setHasAnchor(value);
  }, []);

  const onAnchorAdd = React.useCallback(() => {
    setHasAnchor(true);
  }, []);

  const onAnchorRemove = React.useCallback(() => {
    setHasAnchor(false);
  }, []);

  return {
    anchorRef,
    onAnchorChange,
    hasAnchor,
    onHasAnchorChange,
    onAnchorAdd,
    onAnchorRemove,
  };
}
