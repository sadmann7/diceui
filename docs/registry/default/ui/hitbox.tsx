import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const hitboxVariants = cva("relative after:absolute after:content-['']", {
  variants: {
    size: {
      sm: "after:-inset-1",
      default: "after:-inset-2",
      lg: "after:-inset-3",
    },
    debug: {
      true: "after:border after:border-red-500 after:border-dashed after:bg-red-500/20",
      false: "",
    },
  },
  defaultVariants: {
    size: "default",
    debug: false,
  },
});

interface HitboxProps
  extends React.ComponentProps<typeof Slot>,
    VariantProps<typeof hitboxVariants> {}

function Hitbox(props: HitboxProps) {
  const { className, size, debug = false, ...hitboxProps } = props;

  return (
    <Slot
      data-slot="hitbox"
      {...hitboxProps}
      className={cn(
        hitboxVariants({
          size,
          debug,
          className,
        }),
      )}
    />
  );
}

export { Hitbox };
