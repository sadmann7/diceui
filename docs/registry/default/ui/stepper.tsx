"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

type Direction = "ltr" | "rtl";

interface StepperContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation: "horizontal" | "vertical";
  disabled: boolean;
  clickable: boolean;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepperContext(consumerName?: string) {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error(
      `${consumerName || "Stepper component"} must be used within a Stepper`,
    );
  }
  return context;
}

const stepperVariants = cva("flex", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

interface StepperRootProps extends React.ComponentProps<"div"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: Direction;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  clickable?: boolean;
  name?: string;
  asChild?: boolean;
}

function Stepper(
  props: StepperRootProps & VariantProps<typeof stepperVariants>,
) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    disabled = false,
    clickable = true,
    name,
    className,
    children,
    ref,
    ...rootProps
  } = props;

  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const [formTrigger, setFormTrigger] = React.useState<HTMLDivElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, setFormTrigger);
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!disabled && clickable) {
        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      }
    },
    [disabled, clickable, controlledValue, onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      orientation,
      disabled,
      clickable,
    }),
    [value, handleValueChange, orientation, disabled, clickable],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        ref={composedRef}
        className={cn(stepperVariants({ orientation }), className)}
        {...rootProps}
      >
        {children}
      </div>
      {isFormControl && name && (
        <VisuallyHiddenInput
          type="hidden"
          control={formTrigger}
          name={name}
          value={value || ""}
          disabled={disabled}
        />
      )}
    </StepperContext.Provider>
  );
}

const stepperListVariants = cva("flex items-start", {
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col items-start",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

interface StepperListProps extends React.ComponentProps<"ol"> {
  asChild?: boolean;
}

function StepperList(props: StepperListProps) {
  const { className, children, ref, ...listProps } = props;
  const { orientation } = useStepperContext("StepperList");

  return (
    <ol
      ref={ref}
      className={cn(stepperListVariants({ orientation }), className)}
      {...listProps}
    >
      {children}
    </ol>
  );
}

const stepperItemVariants = cva("flex", {
  variants: {
    orientation: {
      horizontal: "flex-col items-center text-center",
      vertical: "flex-row items-start gap-4 text-left",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

interface StepperItemProps extends React.ComponentProps<"li"> {
  value: string;
  completed?: boolean;
  disabled?: boolean;
  asChild?: boolean;
}

function StepperItem(props: StepperItemProps) {
  const { value, className, children, ref, ...itemProps } = props;
  const { orientation } = useStepperContext("StepperItem");

  return (
    <li
      ref={ref}
      className={cn(stepperItemVariants({ orientation }), className)}
      data-value={value}
      {...itemProps}
    >
      {children}
    </li>
  );
}

interface StepperTriggerProps extends React.ComponentProps<typeof Button> {
  value: string;
  asChild?: boolean;
}

function StepperTrigger(props: StepperTriggerProps) {
  const {
    value: stepValue,
    variant = "ghost",
    size = "sm",
    className,
    children,
    asChild = false,
    ref,
    ...triggerProps
  } = props;
  const { onValueChange, disabled, clickable } =
    useStepperContext("StepperTrigger");
  const isDisabled = disabled || triggerProps.disabled;

  const handleClick = () => {
    if (!isDisabled && clickable) {
      onValueChange?.(stepValue);
    }
  };

  const Comp = asChild ? Slot : Button;

  return (
    <Comp
      ref={ref}
      variant={variant}
      size={size}
      className={cn("p-0", className)}
      disabled={isDisabled}
      onClick={handleClick}
      {...triggerProps}
    >
      {children}
    </Comp>
  );
}

const stepperIndicatorVariants = cva(
  "flex items-center justify-center rounded-full border-2 font-medium transition-colors",
  {
    variants: {
      state: {
        inactive: "border-muted bg-background text-muted-foreground",
        active: "border-primary bg-primary text-primary-foreground",
        completed: "border-primary bg-primary text-primary-foreground",
      },
      size: {
        sm: "h-6 w-6 text-xs",
        default: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
      },
    },
    defaultVariants: {
      state: "inactive",
      size: "default",
    },
  },
);

interface StepperIndicatorProps extends React.ComponentProps<"div"> {
  value: string;
  "data-completed"?: boolean;
  asChild?: boolean;
}

function StepperIndicator(props: StepperIndicatorProps) {
  const {
    value: stepValue,
    className,
    children,
    ref,
    ...indicatorProps
  } = props;
  const { value } = useStepperContext("StepperIndicator");

  const isActive = stepValue === value;
  const isCompleted = indicatorProps["data-completed"] === true;
  const state = isCompleted ? "completed" : isActive ? "active" : "inactive";

  return (
    <div
      ref={ref}
      className={cn(stepperIndicatorVariants({ state }), className)}
      data-state={state}
      {...indicatorProps}
    >
      {isCompleted ? <Check className="h-4 w-4" /> : children}
    </div>
  );
}

const stepperSeparatorVariants = cva("bg-border transition-colors", {
  variants: {
    orientation: {
      horizontal: "mx-2 h-px flex-1",
      vertical: "mr-1 ml-3 h-8 w-px",
    },
    state: {
      inactive: "bg-border",
      active: "bg-primary",
      completed: "bg-primary",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    state: "inactive",
  },
});

interface StepperSeparatorProps extends React.ComponentProps<"div"> {
  "data-completed"?: boolean;
  asChild?: boolean;
}

function StepperSeparator(props: StepperSeparatorProps) {
  const { className, ref, ...separatorProps } = props;
  const { orientation } = useStepperContext("StepperSeparator");

  const isCompleted = separatorProps["data-completed"] === true;
  const state = isCompleted ? "completed" : "inactive";

  return (
    <div
      ref={ref}
      className={cn(
        stepperSeparatorVariants({ orientation, state }),
        className,
      )}
      {...separatorProps}
    />
  );
}

interface StepperTitleProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperTitle(props: StepperTitleProps) {
  const { className, ref, ...titleProps } = props;

  return (
    <span
      ref={ref}
      className={cn("font-medium text-sm", className)}
      {...titleProps}
    />
  );
}

interface StepperDescriptionProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperDescription(props: StepperDescriptionProps) {
  const { className, ref, ...descriptionProps } = props;

  return (
    <span
      ref={ref}
      className={cn("text-muted-foreground text-xs", className)}
      {...descriptionProps}
    />
  );
}

interface StepperContentProps extends React.ComponentProps<"div"> {
  value: string;
  asChild?: boolean;
}

function StepperContent(props: StepperContentProps) {
  const { value: stepValue, className, children, ref, ...contentProps } = props;
  const { value } = useStepperContext("StepperContent");

  if (stepValue !== value) {
    return null;
  }

  return (
    <div ref={ref} className={cn("mt-4", className)} {...contentProps}>
      {children}
    </div>
  );
}

export {
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperContent,
};
