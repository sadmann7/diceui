"use client";

import * as React from "react";
import { useLayoutEffect } from "../hooks";
import { useComposedRefs } from "../lib";
import { getElementRef } from "../lib/get-element-ref";

interface PresenceProps {
  children:
    | React.ReactElement
    | ((props: { present: boolean }) => React.ReactElement);
  present: boolean;
}

function usePresence(present: boolean) {
  const [node, setNode] = React.useState<HTMLElement>();
  const [isPresent, setIsPresent] = React.useState(present);
  const stylesRef = React.useRef<CSSStyleDeclaration>();

  useLayoutEffect(() => {
    if (!node) return;

    function onAnimationEnd(event: AnimationEvent) {
      if (event.target === node) {
        setIsPresent(present);
      }
    }

    function onAnimationStart(event: AnimationEvent) {
      if (event.target === node) {
        stylesRef.current = getComputedStyle(node);
      }
    }

    node.addEventListener("animationstart", onAnimationStart);
    node.addEventListener("animationend", onAnimationEnd);
    node.addEventListener("animationcancel", onAnimationEnd);

    return () => {
      node.removeEventListener("animationstart", onAnimationStart);
      node.removeEventListener("animationend", onAnimationEnd);
      node.removeEventListener("animationcancel", onAnimationEnd);
    };
  }, [node, present]);

  return {
    isPresent: present || isPresent,
    ref: React.useCallback((node: HTMLElement) => {
      if (node) setNode(node);
    }, []),
  };
}

const Presence: React.FC<PresenceProps> = ({ present, children }) => {
  const presence = usePresence(present);

  const child = (
    typeof children === "function"
      ? children({ present: presence.isPresent })
      : React.Children.only(children)
  ) satisfies React.ReactElement;

  const forceMount = typeof children === "function";

  if (!forceMount && !presence.isPresent) return null;

  const composedRef = useComposedRefs(presence.ref, getElementRef(child));

  return React.cloneElement(child, { ref: composedRef });
};

Presence.displayName = "Presence";

export { Presence };
