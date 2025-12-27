/**
 * Based on React Aria's Button implementation
 * @see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Button.tsx
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
    "aria-busy"?: "true";
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
      "aria-busy"?: "true";
      "aria-disabled"?: "true";
      "data-pending"?: true;
      "data-disabled"?: true;
    } = {
      id: pendingId,
    };

    // When pending, disable interactions but keep focusable
    if (isPending) {
      props["aria-busy"] = "true";
      props["aria-disabled"] = "true";
      props["data-pending"] = true;

      // Override event handlers to prevent interaction
      // Using object spread means these will be merged by Radix Slot
      const preventEvent = (event: React.SyntheticEvent) =>
        event.preventDefault();
      const preventKeyEvent = (event: React.KeyboardEvent<T>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
        }
      };

      props.onClick = preventEvent;
      props.onPointerDown = preventEvent;
      props.onPointerUp = preventEvent;
      props.onMouseDown = preventEvent;
      props.onMouseUp = preventEvent;
      props.onKeyDown = preventKeyEvent;
      props.onKeyUp = preventKeyEvent;
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

interface PendingProps extends React.ComponentProps<typeof Slot> {
  isPending?: boolean;
  isDisabled?: boolean;
}

function Pending({ id, isPending, isDisabled, ...props }: PendingProps) {
  const { pendingProps } = usePending({ isPending, id, isDisabled });

  // Spread user props first, then pendingProps to ensure event prevention takes precedence
  return <Slot {...props} {...pendingProps} />;
}

export {
  Pending,
  //
  usePending,
};
