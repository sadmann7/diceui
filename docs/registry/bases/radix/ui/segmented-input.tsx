"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

interface SegmentedInputProps extends React.ComponentProps<"div"> {
  dir?: Direction;
  orientation?: Orientation;
  size?: Size;
  asChild?: boolean;
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
    asChild,
    disabled,
    invalid,
    required,
    ...rootProps
  } = props;

  const dir = DirectionPrimitive.useDirection(dirProp);

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

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SegmentedInputContext.Provider value={contextValue}>
      <RootPrimitive
        role="group"
        aria-orientation={orientation}
        data-slot="segmented-input"
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        data-required={required ? "" : undefined}
        dir={dir}
        {...rootProps}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
      >
        {segmentedInputItems}
      </RootPrimitive>
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
    Omit<VariantProps<typeof segmentedInputItemVariants>, "size"> {
  asChild?: boolean;
}

function SegmentedInputItem(props: SegmentedInputItemProps) {
  const { asChild, className, position, disabled, required, ...inputProps } =
    props;
  const context = useSegmentedInputContext(ITEM_NAME);

  const isDisabled = disabled ?? context.disabled;
  const isRequired = required ?? context.required;

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : Input;

  return (
    <ItemPrimitive
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
      className={cn(
        segmentedInputItemVariants({
          position,
          orientation: context.orientation,
          size: context.size,
          className,
        }),
      )}
    />
  );
}

export {
  SegmentedInput,
  SegmentedInputItem,
  //
  type SegmentedInputProps,
};
