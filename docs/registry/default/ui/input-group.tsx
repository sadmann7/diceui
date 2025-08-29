"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { useComposedRefs } from "@/lib/compose-refs";
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
  rootRef: React.RefObject<HTMLDivElement | null>;
  dir?: Direction;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "default" | "lg";
  arrowNavigation?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  loop?: boolean;
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
  arrowNavigation?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  loop?: boolean;
  required?: boolean;
}

function InputGroupRoot(props: InputGroupRootProps) {
  const {
    dir: dirProp,
    orientation = "horizontal",
    size = "default",
    className,
    ref,
    arrowNavigation,
    asChild,
    disabled,
    invalid,
    loop,
    required,
    ...rootProps
  } = props;

  const id = React.useId();
  const dir = useDirection(dirProp);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);

  const contextValue = React.useMemo<InputGroupContextValue>(
    () => ({
      rootRef,
      dir,
      orientation,
      size,
      disabled,
      invalid,
      loop,
      required,
      arrowNavigation,
    }),
    [
      dir,
      orientation,
      size,
      arrowNavigation,
      disabled,
      invalid,
      loop,
      required,
    ],
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
        ref={composedRef}
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

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      inputProps.onKeyDown?.(event);
      if (event.defaultPrevented || isDisabled || !context.arrowNavigation)
        return;

      const target = event.currentTarget;
      const root = context.rootRef?.current;
      if (!root) return;

      const cursorPosition = target.selectionStart ?? 0;
      const textLength = target.value.length;

      const elements = Array.from(
        root.querySelectorAll(
          'input[data-slot="input-group-item"]:not([disabled])',
        ),
      );

      const inputs = elements.filter(
        (el): el is HTMLInputElement => el instanceof HTMLInputElement,
      );

      const currentIndex = inputs.indexOf(target);

      if (currentIndex === -1) return;

      let nextIndex = -1;

      if (context.orientation === "horizontal") {
        if (event.key === "ArrowLeft" && cursorPosition === 0) {
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          } else if (context.loop) {
            nextIndex = inputs.length - 1;
          }
        } else if (
          event.key === "ArrowRight" &&
          cursorPosition === textLength
        ) {
          if (currentIndex < inputs.length - 1) {
            nextIndex = currentIndex + 1;
          } else if (context.loop) {
            nextIndex = 0;
          }
        }
      } else {
        if (event.key === "ArrowUp" && cursorPosition === 0) {
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          } else if (context.loop) {
            nextIndex = inputs.length - 1;
          }
        } else if (event.key === "ArrowDown" && cursorPosition === textLength) {
          if (currentIndex < inputs.length - 1) {
            nextIndex = currentIndex + 1;
          } else if (context.loop) {
            nextIndex = 0;
          }
        }
      }

      if (nextIndex !== -1) {
        event.preventDefault();
        const targetInput = inputs[nextIndex];
        if (targetInput) {
          targetInput.focus();

          const isNavigatingBackward =
            (context.orientation === "horizontal" &&
              event.key === "ArrowLeft") ||
            (context.orientation === "vertical" && event.key === "ArrowUp");

          const cursorPos = isNavigatingBackward ? targetInput.value.length : 0;
          targetInput.setSelectionRange(cursorPos, cursorPos);
        }
      }
    },
    [
      inputProps.onKeyDown,
      isDisabled,
      context.orientation,
      context.rootRef,
      context.loop,
      context.arrowNavigation,
    ],
  );

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
      onKeyDown={onKeyDown}
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
