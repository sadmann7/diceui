"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useDirection } from "@/registry/bases/base/ui/direction";
import { Input } from "@/registry/bases/base/ui/input";

const ROOT_NAME = "SegmentedInput";
const ITEM_NAME = "SegmentedInputItem";

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type Size = "default" | "sm" | "lg";
type Position = "isolated" | "first" | "middle" | "last";

interface SegmentedInputContextValue {
  dir?: Direction;
  orientation?: Orientation;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

const SegmentedInputContext =
  React.createContext<SegmentedInputContextValue | null>(null);

function useSegmentedInputContext(consumerName: string) {
  const context = React.useContext(SegmentedInputContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface SegmentedInputProps
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {
  dir?: Direction;
  orientation?: Orientation;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

function SegmentedInput(props: SegmentedInputProps) {
  const {
    size = "default",
    dir: dirProp,
    orientation = "horizontal",
    children,
    className,
    render,
    disabled,
    invalid,
    required,
    ...rootProps
  } = props;

  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;

  const contextValue = React.useMemo<SegmentedInputContextValue>(
    () => ({
      dir,
      orientation,
      size,
      disabled,
      invalid,
      required,
    }),
    [dir, orientation, size, disabled, invalid, required],
  );

  const childrenArray = React.Children.toArray(children);
  const childrenCount = childrenArray.length;

  const segmentedInputItems = React.Children.map(children, (child, index) => {
    if (React.isValidElement<SegmentedInputItemProps>(child)) {
      if (!child.props.position) {
        let position: Position;

        if (childrenCount === 1) {
          position = "isolated";
        } else if (index === 0) {
          position = "first";
        } else if (index === childrenCount - 1) {
          position = "last";
        } else {
          position = "middle";
        }

        return React.cloneElement(child, { position });
      }
    }
    return child;
  });

  return (
    <SegmentedInputContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(
          {
            role: "group",
            "aria-orientation": orientation,
            dir,
            className: cn(
              "flex",
              orientation === "horizontal" ? "flex-row" : "flex-col",
              className,
            ),
            children: segmentedInputItems,
          },
          rootProps,
        ),
        render,
        state: {
          slot: "segmented-input",
          orientation,
          ...(disabled && { disabled: "" }),
          ...(invalid && { invalid: "" }),
          ...(required && { required: "" }),
        },
      })}
    </SegmentedInputContext.Provider>
  );
}

const segmentedInputItemVariants = cva("", {
  variants: {
    position: {
      isolated: "",
      first: "rounded-e-none",
      middle: "-ms-px rounded-none border-l-0",
      last: "-ms-px rounded-s-none border-l-0",
    },
    orientation: {
      horizontal: "",
      vertical: "",
    },
    size: {
      sm: "h-8 px-2 text-xs",
      default: "h-9 px-3",
      lg: "h-11 px-4",
    },
  },
  compoundVariants: [
    {
      position: "first",
      orientation: "vertical",
      class: "ms-0 rounded-e-md rounded-b-none border-l",
    },
    {
      position: "middle",
      orientation: "vertical",
      class: "ms-0 -mt-px rounded-none border-t-0 border-l",
    },
    {
      position: "last",
      orientation: "vertical",
      class: "ms-0 -mt-px rounded-s-md rounded-t-none border-t-0 border-l",
    },
  ],
  defaultVariants: {
    position: "isolated",
    orientation: "horizontal",
    size: "default",
  },
});

interface SegmentedInputItemProps
  extends React.ComponentProps<"input">,
    Omit<VariantProps<typeof segmentedInputItemVariants>, "size">,
    useRender.ComponentProps<"input"> {}

function SegmentedInputItem(props: SegmentedInputItemProps) {
  const { render, className, position, disabled, required, ...inputProps } =
    props;
  const context = useSegmentedInputContext(ITEM_NAME);

  const isDisabled = disabled ?? context.disabled;
  const isRequired = required ?? context.required;

  const itemClassName = cn(
    segmentedInputItemVariants({
      position,
      orientation: context.orientation,
      size: context.size,
      className,
    }),
  );

  const renderedElement = useRender({
    defaultTagName: "input",
    props: mergeProps<"input">(
      {
        "aria-invalid": context.invalid,
        "aria-required": isRequired,
        disabled: isDisabled,
        required: isRequired,
        className: itemClassName,
      },
      inputProps,
    ),
    render,
    state: {
      slot: "segmented-input-item",
      orientation: context.orientation,
      position,
      ...(isDisabled && { disabled: "" }),
      ...(context.invalid && { invalid: "" }),
      ...(isRequired && { required: "" }),
    },
  });

  if (render) {
    return renderedElement;
  }

  return (
    <Input
      aria-invalid={context.invalid}
      aria-required={isRequired}
      data-disabled={isDisabled ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      data-orientation={context.orientation}
      data-position={position}
      data-required={isRequired ? "" : undefined}
      data-slot="segmented-input-item"
      disabled={isDisabled}
      required={isRequired}
      {...inputProps}
      className={itemClassName}
    />
  );
}

export {
  SegmentedInput,
  SegmentedInputItem,
  //
  type SegmentedInputProps,
};
