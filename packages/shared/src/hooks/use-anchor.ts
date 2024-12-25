import * as React from "react";

export function useAnchor<T extends HTMLElement>() {
  const anchorRef = React.useRef<T | null>(null);
  const [hasAnchor, setHasAnchor] = React.useState(false);

  const onAnchorAdd = React.useCallback(() => {
    setHasAnchor(true);
  }, []);

  const onAnchorRemove = React.useCallback(() => {
    setHasAnchor(false);
  }, []);

  const onHasAnchorChange = React.useCallback((value: boolean) => {
    setHasAnchor(value);
  }, []);

  return {
    anchorRef,
    hasAnchor,
    onAnchorAdd,
    onAnchorRemove,
    onHasAnchorChange,
  };
}
