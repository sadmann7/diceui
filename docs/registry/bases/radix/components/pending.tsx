/**
 * Based on React Aria's Button implementation
 * @see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Button.tsx
 */

import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

interface UsePendingOptions {
  id?: string;
  isPending?: boolean;
  disabled?: boolean;
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
  const { id, isPending = false, disabled = false } = options;

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

    if (isPending) {
      props["aria-busy"] = "true";
      props["aria-disabled"] = "true";
      props["data-pending"] = true;

      function onEventPrevent(event: React.SyntheticEvent) {
        event.preventDefault();
      }

      function onKeyEventPrevent(event: React.KeyboardEvent<T>) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
        }
      }

      props.onClick = onEventPrevent;
      props.onPointerDown = onEventPrevent;
      props.onPointerUp = onEventPrevent;
      props.onMouseDown = onEventPrevent;
      props.onMouseUp = onEventPrevent;
      props.onKeyDown = onKeyEventPrevent;
      props.onKeyUp = onKeyEventPrevent;
    }

    if (disabled) {
      props["data-disabled"] = true;
    }

    return props;
  }, [isPending, disabled, pendingId]);

  return React.useMemo(() => {
    return {
      pendingProps,
      isPending,
    };
  }, [pendingProps, isPending]);
}

interface PendingProps extends React.ComponentProps<typeof SlotPrimitive.Slot> {
  isPending?: boolean;
  disabled?: boolean;
}

function Pending({ id, isPending, disabled, ...props }: PendingProps) {
  const { pendingProps } = usePending({ id, isPending, disabled });

  return <SlotPrimitive.Slot {...props} {...pendingProps} />;
}

export {
  Pending,
  //
  usePending,
};
