import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

const groupedInputVariants = cva("", {
  variants: {
    position: {
      first: "rounded-e-none",
      middle: "-ms-px rounded-none border-l-0",
      last: "-ms-px rounded-s-none border-l-0",
      isolated: "",
    },
  },
  defaultVariants: {
    position: "isolated",
  },
});

interface GroupedInputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof groupedInputVariants> {}

function GroupedInput({ className, position, ...props }: GroupedInputProps) {
  return (
    <Input
      data-slot="grouped-input"
      className={cn(groupedInputVariants({ position }), className)}
      {...props}
    />
  );
}

export { GroupedInput };
