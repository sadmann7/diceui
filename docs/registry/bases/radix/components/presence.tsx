"use client";

import * as React from "react";

interface StateMachineConfig<TState extends string, TEvent extends string> {
  initial: TState;
  states: Record<TState, Partial<Record<TEvent, TState>>>;
}

function useStateMachine<TState extends string, TEvent extends string>(
  config: StateMachineConfig<TState, TEvent>,
) {
  const [state, setState] = React.useState<TState>(config.initial);

  const send = React.useCallback(
    (event: TEvent) => {
      setState((currentState) => {
        const transition = config.states[currentState]?.[event];
        return transition ?? currentState;
      });
    },
    [config.states],
  );

  return [state, send] as const;
}

function getAnimationName(styles?: CSSStyleDeclaration) {
  return styles?.animationName ?? "none";
}

interface PresenceProps {
  present: boolean;
  children?:
    | React.ReactElement<{ ref?: React.Ref<HTMLElement> }>
    | ((props: { present: boolean }) => React.ReactElement<{
        ref?: React.Ref<HTMLElement>;
      }>);
  forceMount?: boolean;
  onExitComplete?: () => void;
}

function Presence({
  present,
  children,
  forceMount = false,
  onExitComplete,
}: PresenceProps) {
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const stylesRef = React.useRef<CSSStyleDeclaration>(
    {} as CSSStyleDeclaration,
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

  React.useLayoutEffect(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;

    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);

      if (present) {
        send("MOUNT");
      } else if (node) {
        const hasAnimation =
          (currentAnimationName !== "none" && styles?.display !== "none") ||
          (styles.transitionProperty !== "none" &&
            Number.parseFloat(styles.transitionDuration) > 0);

        if (!hasAnimation) {
          send("UNMOUNT");
        } else {
          const isAnimating = prevAnimationName !== currentAnimationName;
          if (wasPresent && isAnimating) {
            send("ANIMATION_OUT");
          } else {
            send("UNMOUNT");
          }
        }
      } else {
        send("UNMOUNT");
      }
      prevPresentRef.current = present;
    }
  }, [present, node, send]);

  React.useLayoutEffect(() => {
    if (!node) return;

    let timeoutId: number;
    const ownerWindow = node.ownerDocument.defaultView ?? window;

    function onAnimationEnd(event: AnimationEvent) {
      if (!node) return;
      const currentAnimationName = getAnimationName(stylesRef.current);
      const isCurrentAnimation = currentAnimationName.includes(
        event.animationName,
      );

      if (event.target === node && isCurrentAnimation) {
        send("ANIMATION_END");
        if (!prevPresentRef.current) {
          const currentFillMode = node.style.animationFillMode;
          node.style.animationFillMode = "forwards";
          timeoutId = ownerWindow.setTimeout(() => {
            if (node && node.style.animationFillMode === "forwards") {
              node.style.animationFillMode = currentFillMode;
            }
          });
        }
      }
    }

    function onTransitionEnd(event: TransitionEvent) {
      if (!node) return;
      if (event.target === node && !prevPresentRef.current) {
        send("ANIMATION_END");
      }
    }

    function onAnimationStart(event: AnimationEvent) {
      if (!node) return;
      if (event.target === node) {
        prevAnimationNameRef.current = getAnimationName(stylesRef.current);
      }
    }

    node.addEventListener("animationstart", onAnimationStart);
    node.addEventListener("animationend", onAnimationEnd);
    node.addEventListener("animationcancel", onAnimationEnd);
    node.addEventListener("transitionend", onTransitionEnd);
    node.addEventListener("transitioncancel", onTransitionEnd);

    return () => {
      ownerWindow.clearTimeout(timeoutId);
      if (!node) return;
      node.removeEventListener("animationstart", onAnimationStart);
      node.removeEventListener("animationend", onAnimationEnd);
      node.removeEventListener("animationcancel", onAnimationEnd);
      node.removeEventListener("transitionend", onTransitionEnd);
      node.removeEventListener("transitioncancel", onTransitionEnd);
    };
  }, [node, send]);

  React.useEffect(() => {
    if (state === "unmounted" && !present && onExitComplete) {
      onExitComplete();
    }
  }, [state, present, onExitComplete]);

  const isPresent = ["mounted", "unmountSuspended"].includes(state);

  if (!isPresent && !forceMount) return null;

  const child =
    typeof children === "function"
      ? children({ present: isPresent })
      : React.Children.only(children);

  if (!child) return null;

  return React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      if (node) stylesRef.current = getComputedStyle(node);
      setNode(node);
    },
  });
}

export { Presence };
