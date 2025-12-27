/**
 * Based on React Aria's Button implementation
 * @see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Button.tsx
 *
 * Copyright 2022 Adobe. All rights reserved.
 * Licensed under the Apache License, Version 2.0
 */

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

interface UsePendingOptions {
  isPending?: boolean;
  id?: string;
  isDisabled?: boolean;
}

interface UsePendingReturn<T extends HTMLElement = HTMLElement> {
  pendingProps: React.HTMLAttributes<T> & {
    "aria-disabled"?: "true";
    "data-pending"?: true;
    "data-disabled"?: true;
  };
  isPending: boolean;
}

function usePending<T extends HTMLElement = HTMLElement>(
  options: UsePendingOptions = {},
): UsePendingReturn<T> {
  const { id, isPending = false, isDisabled = false } = options;

  const instanceId = React.useId();
  const pendingId = id || instanceId;

  // Track previous pending state for announcements
  const wasPending = React.useRef(isPending);
  const [isFocused, setIsFocused] = React.useState(false);

  // Announce state changes to screen readers when focused
  React.useEffect(() => {
    if (isFocused) {
      if (!wasPending.current && isPending) {
        // Announce when entering pending state
        const message =
          document.getElementById(pendingId)?.textContent || "Loading";
        announce(message, "assertive");
      } else if (wasPending.current && !isPending) {
        // Announce when leaving pending state
        const message =
          document.getElementById(pendingId)?.textContent || "Ready";
        announce(message, "assertive");
      }
    }
    wasPending.current = isPending;
  }, [isPending, isFocused, pendingId]);

  const pendingProps = React.useMemo(() => {
    const props: React.HTMLAttributes<T> & {
      "aria-disabled"?: "true";
      "data-pending"?: true;
      "data-disabled"?: true;
    } = {
      id: pendingId,
      onFocus: () => {
        setIsFocused(true);
      },
      onBlur: () => {
        setIsFocused(false);
      },
    };

    // When pending, disable interactions but keep focusable
    if (isPending) {
      props["aria-disabled"] = "true";
      props["data-pending"] = true;

      // Disable all interaction event handlers
      props.onClick = (event) => event.preventDefault();
      props.onPointerDown = (event) => event.preventDefault();
      props.onPointerUp = (event) => event.preventDefault();
      props.onMouseDown = (event) => event.preventDefault();
      props.onMouseUp = (event) => event.preventDefault();
      props.onKeyDown = (event) => {
        // Prevent Enter/Space from triggering actions
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
        }
      };
      props.onKeyUp = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
        }
      };
    }

    // Mark as disabled if explicitly disabled
    if (isDisabled) {
      props["data-disabled"] = true;
    }

    return props;
  }, [isPending, isDisabled, pendingId]);

  return React.useMemo(() => {
    return {
      pendingProps,
      isPending,
    };
  }, [pendingProps, isPending]);
}

interface PendingProps {
  id?: string;
  isPending?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}

function Pending({ id, isPending, isDisabled }: PendingProps) {
  const { pendingProps } = usePending({ isPending, id, isDisabled });

  return <Slot {...pendingProps} />;
}

function announce(
  message: string,
  politeness: "polite" | "assertive" = "polite",
) {
  // Check if we already have an announcer
  let announcer = document.querySelector<HTMLElement>(
    `[data-live-announcer="${politeness}"]`,
  );

  if (!announcer) {
    announcer = document.createElement("div");
    announcer.setAttribute("data-live-announcer", politeness);
    announcer.setAttribute(
      "role",
      politeness === "assertive" ? "alert" : "status",
    );
    announcer.setAttribute("aria-live", politeness);
    announcer.setAttribute("aria-atomic", "true");

    // Visually hide but keep accessible
    Object.assign(announcer.style, {
      position: "absolute",
      left: "-10000px",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    });

    document.body.appendChild(announcer);
  }

  // Clear and set new message
  announcer.textContent = "";
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  }, 100);
}

export {
  Pending,
  //
  usePending,
};
