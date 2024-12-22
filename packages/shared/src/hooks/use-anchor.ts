import * as React from "react";

export function useAnchor<T extends HTMLElement>() {
  const anchorRef = React.useRef<T | null>(null);
  const [hasCustomAnchor, setHasCustomAnchor] = React.useState(false);

  const onCustomAnchorAdd = React.useCallback(() => {
    setHasCustomAnchor(true);
  }, []);

  const onCustomAnchorRemove = React.useCallback(() => {
    setHasCustomAnchor(false);
  }, []);

  return {
    hasCustomAnchor,
    onCustomAnchorAdd,
    onCustomAnchorRemove,
    anchorRef,
  };
}
