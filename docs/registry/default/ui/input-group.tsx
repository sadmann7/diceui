"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ROOT_NAME = "InputGroup";
const ITEM_NAME = "InputGroupItem";

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface InputGroupContextValue {
  dir?: Direction;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

const InputGroupContext = React.createContext<InputGroupContextValue | null>(
  null,
);
InputGroupContext.displayName = ROOT_NAME;

function useInputGroupContext(consumerName: string) {
  const context = React.useContext(InputGroupContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const inputGroupItemVariants = cva("", {
  variants: {
    position: {
      first: "rounded-e-none",
      middle: "-ms-px rounded-none border-l-0",
      last: "-ms-px rounded-s-none border-l-0",
      isolated: "",
    },
    orientation: {
      horizontal: "",
      vertical: "",
    },
  },
  compoundVariants: [
    {
      position: "first",
      orientation: "vertical",
      class: "ms-0 rounded-e-md rounded-b-none border-l-1",
    },
    {
      position: "middle",
      orientation: "vertical",
      class: "-mt-px ms-0 rounded-none border-t-0 border-l-1",
    },
    {
      position: "last",
      orientation: "vertical",
      class: "-mt-px ms-0 rounded-s-md rounded-t-none border-t-0 border-l-1",
    },
  ],
  defaultVariants: {
    position: "isolated",
    orientation: "horizontal",
  },
});

interface InputGroupRootProps extends React.ComponentProps<"div"> {
  id?: string;
  dir?: Direction;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "default" | "lg";
  asChild?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

function InputGroupRoot(props: InputGroupRootProps) {
  const {
    dir: dirProp,
    orientation = "horizontal",
    size = "default",
    className,
    asChild,
    disabled,
    invalid,
    required,
    ...rootProps
  } = props;

  const id = React.useId();
  const dir = useDirection(dirProp);

  const contextValue = React.useMemo<InputGroupContextValue>(
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

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <InputGroupContext.Provider value={contextValue}>
      <RootPrimitive
        role="group"
        aria-orientation={orientation}
        data-slot="input-group"
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        data-required={required ? "" : undefined}
        {...rootProps}
        id={id}
        dir={dir}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
      />
    </InputGroupContext.Provider>
  );
}
InputGroupRoot.displayName = ROOT_NAME;

interface InputGroupItemProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputGroupItemVariants> {
  asChild?: boolean;
}

function InputGroupItem(props: InputGroupItemProps) {
  const { asChild, className, position, disabled, required, ...inputProps } =
    props;
  const context = useInputGroupContext(ITEM_NAME);

  const isDisabled = disabled ?? context.disabled;
  const isRequired = required ?? context.required;

  const InputPrimitive = asChild ? Slot : Input;

  return (
    <InputPrimitive
      data-slot="input-group-item"
      data-position={position}
      data-orientation={context.orientation}
      data-disabled={isDisabled ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      data-required={isRequired ? "" : undefined}
      aria-invalid={context.invalid}
      aria-required={isRequired}
      disabled={isDisabled}
      required={isRequired}
      {...inputProps}
      className={cn(
        inputGroupItemVariants({
          position,
          orientation: context.orientation,
        }),
        className,
      )}
    />
  );
}
InputGroupItem.displayName = ITEM_NAME;

export {
  InputGroupRoot as InputGroup,
  InputGroupItem,
  //
  InputGroupRoot as Root,
  InputGroupItem as Item,
};
