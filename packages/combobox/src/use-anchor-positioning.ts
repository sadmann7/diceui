import type { VirtualElement } from "@floating-ui/react";
import * as React from "react";

interface UseAnchorPositioningParams {
  anchorRef: React.RefObject<HTMLElement | null>;
  inputRef: React.RefObject<HTMLElement | null>;
  hasCustomAnchor: boolean;
}

interface UseAnchorPositioningReturn {
  reference: VirtualElement | HTMLElement | null;
  updateReference: () => void;
}

export function useAnchorPositioning({
  anchorRef,
  inputRef,
  hasCustomAnchor,
}: UseAnchorPositioningParams): UseAnchorPositioningReturn {
  const [reference, setReference] = React.useState<
    VirtualElement | HTMLElement | null
  >(null);

  const updateReference = React.useCallback(() => {
    if (hasCustomAnchor && anchorRef.current) {
      setReference(anchorRef.current);
    } else if (inputRef.current) {
      setReference(inputRef.current);
    }
  }, [hasCustomAnchor, anchorRef, inputRef]);

  React.useEffect(() => {
    updateReference();
  }, [updateReference]);

  // Update reference when anchor or input changes
  React.useEffect(() => {
    const anchorNode = anchorRef.current;
    const inputNode = inputRef.current;

    if (!anchorNode && !inputNode) return;

    const observer = new MutationObserver(updateReference);
    const resizeObserver = new ResizeObserver(updateReference);

    if (hasCustomAnchor && anchorNode) {
      observer.observe(anchorNode, {
        attributes: true,
        childList: true,
        subtree: true,
      });
      resizeObserver.observe(anchorNode);
    } else if (inputNode) {
      observer.observe(inputNode, {
        attributes: true,
        childList: true,
        subtree: true,
      });
      resizeObserver.observe(inputNode);
    }

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [hasCustomAnchor, anchorRef, inputRef, updateReference]);

  return {
    reference,
    updateReference,
  };
}

export type { UseAnchorPositioningParams, UseAnchorPositioningReturn };
