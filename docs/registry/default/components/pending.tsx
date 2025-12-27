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
  id?: string;
  isPending?: boolean;
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

  const pendingProps = React.useMemo(() => {
    const props: React.HTMLAttributes<T> & {
      "aria-disabled"?: "true";
      "data-pending"?: true;
      "data-disabled"?: true;
    } = {
      id: pendingId,
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

function Pending({ id, isPending, isDisabled, children }: PendingProps) {
  const { pendingProps } = usePending({ isPending, id, isDisabled });

  return <Slot {...pendingProps}>{children}</Slot>;
}

export {
  Pending,
  //
  usePending,
};
