import * as React from "react";
import { useCallbackRef } from "./use-callback-ref";

interface UseEscapeKeydownParams {
  ownerDocument: Document;
  onEscapeKeyDown: (event: KeyboardEvent) => void;
  enabled?: boolean;
}

function useEscapeKeydown({
  ownerDocument,
  onEscapeKeyDown,
  enabled,
}: UseEscapeKeydownParams) {
  const onEscapeKeyDownCallback = useCallbackRef(onEscapeKeyDown);

  React.useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscapeKeyDownCallback?.(event);
      }
    }
    ownerDocument.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      ownerDocument.removeEventListener("keydown", onKeyDown, {
        capture: true,
      });
  }, [enabled, onEscapeKeyDownCallback, ownerDocument]);
}

export { useEscapeKeydown };
