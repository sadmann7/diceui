/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/presence/src/Presence.tsx
 */

import * as React from "react";

import { useLayoutEffect, useStateMachine } from "../hooks";
import { useComposedRefs } from "../lib";
import { getElementRef } from "../lib/get-element-ref";

interface PresenceProps {
  children:
    | React.ReactElement
    | ((props: { present: boolean }) => React.ReactElement);
  present: boolean;
}

const Presence: React.FC<PresenceProps> = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);

  const child = (
    typeof children === "function"
      ? children({ present: presence.isPresent })
      : React.Children.only(children)
  ) as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;

  const ref = useComposedRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent
    ? React.cloneElement(child, { ref })
    : null;
};

Presence.displayName = "Presence";

function usePresence(present: boolean) {
  const [node, setNode] = React.useState<HTMLElement>();
  const stylesRef = React.useRef<CSSStyleDeclaration>(
    {} as unknown as CSSStyleDeclaration,
  );
  const prevPresentRef = React.useRef(present);
  const prevAnimationNameRef = React.useRef<string>("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine({
    initial: initialState,
    states: {
      mounted: {
        UNMOUNT: "unmounted",
        ANIMATION_OUT: "unmountSuspended",
      },
      unmountSuspended: {
        MOUNT: "mounted",
        ANIMATION_END: "unmounted",
      },
      unmounted: {
        MOUNT: "mounted",
      },
    },
  });

  React.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current =
      state === "mounted" ? currentAnimationName : "none";
  }, [state]);

  useLayoutEffect(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;

    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);

      if (present) {
        send("MOUNT");
      } else if (
        currentAnimationName === "none" ||
        styles?.display === "none"
      ) {
        // Without an exit animation, or with the element hidden, no animation runs,
        // so it unmounts right away.
        send("UNMOUNT");
      } else {
        // There is no `animationrun` event, and `animationstart` fires after
        // `animation-delay`, so a changed animation-name signals the exit animation.
        const isAnimating = prevAnimationName !== currentAnimationName;

        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }

      prevPresentRef.current = present;
    }
  }, [present, send]);

  useLayoutEffect(() => {
    if (node) {
      let timeoutId: number;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      /**
       * An ANIMATION_OUT during ANIMATION_IN fires `animationcancel` for ANIMATION_IN
       * after entering `unmountSuspended`, so only the active animation ends it.
       */
      function onAnimationEnd(event: AnimationEvent) {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(
          event.animationName,
        );
        if (event.target === node && isCurrentAnimation) {
          // With React 18 concurrency this update lands a frame after the animation
          // ends, so the "forwards" fill mode keeps the last keyframe to avoid a flash.
          // flushSync instead removed the node before animationEnd reached user handlers.
          // https://github.com/radix-ui/primitives/pull/1849
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            // Reset the style after the node had time to unmount (for cases
            // where the component chooses not to unmount). Doing this any
            // sooner than `setTimeout` (e.g. with `requestAnimationFrame`)
            // still causes a flash.
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      }
      function onAnimationStart(event: AnimationEvent) {
        if (event.target === node) {
          // if animation occurred, store its name as the previous animation.
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      }
      node.addEventListener("animationstart", onAnimationStart);
      node.addEventListener("animationcancel", onAnimationEnd);
      node.addEventListener("animationend", onAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", onAnimationStart);
        node.removeEventListener("animationcancel", onAnimationEnd);
        node.removeEventListener("animationend", onAnimationEnd);
      };
    }

    // Transition to the unmounted state if the node is removed prematurely.
    // We avoid doing so during cleanup as the node may change but still exist.
    send("ANIMATION_END");
  }, [node, send]);

  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: React.useCallback((element: HTMLElement) => {
      if (element) stylesRef.current = getComputedStyle(element);
      setNode(element);
    }, []),
  };
}

function getAnimationName(styles?: CSSStyleDeclaration) {
  return styles?.animationName ?? "none";
}

export type { PresenceProps };
export { Presence };
