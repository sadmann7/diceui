import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const hitboxVariants = cva("relative after:absolute after:content-['']", {
  variants: {
    size: {
      default: "",
      sm: "",
      lg: "",
    },
    position: {
      default: "",
      top: "",
      bottom: "",
      left: "",
      right: "",
      vertical: "",
      horizontal: "",
    },
    shape: {
      default: "",
      circular: "after:rounded-full",
      rounded: "after:rounded-md",
    },
    debug: {
      true: "after:border after:border-red-500 after:border-dashed after:bg-red-500/20",
      false: "",
    },
  },
  compoundVariants: [
    { size: "default", position: "default", className: "after:-inset-2" },
    {
      size: "default",
      position: "top",
      className: "after:-top-2 after:right-0 after:left-0 after:h-2",
    },
    {
      size: "default",
      position: "bottom",
      className: "after:-bottom-2 after:right-0 after:left-0 after:h-2",
    },
    {
      size: "default",
      position: "left",
      className: "after:-left-2 after:top-0 after:bottom-0 after:w-2",
    },
    {
      size: "default",
      position: "right",
      className: "after:-right-2 after:top-0 after:bottom-0 after:w-2",
    },
    {
      size: "default",
      position: "vertical",
      className: "after:-top-2 after:-bottom-2 after:right-0 after:left-0",
    },
    {
      size: "default",
      position: "horizontal",
      className: "after:-left-2 after:-right-2 after:top-0 after:bottom-0",
    },
    { size: "sm", position: "default", className: "after:-inset-1" },
    {
      size: "sm",
      position: "top",
      className: "after:-top-1 after:right-0 after:left-0 after:h-1",
    },
    {
      size: "sm",
      position: "bottom",
      className: "after:-bottom-1 after:right-0 after:left-0 after:h-1",
    },
    {
      size: "sm",
      position: "left",
      className: "after:-left-1 after:top-0 after:bottom-0 after:w-1",
    },
    {
      size: "sm",
      position: "right",
      className: "after:-right-1 after:top-0 after:bottom-0 after:w-1",
    },
    {
      size: "sm",
      position: "vertical",
      className: "after:-top-1 after:-bottom-1 after:right-0 after:left-0",
    },
    {
      size: "sm",
      position: "horizontal",
      className: "after:-left-1 after:-right-1 after:top-0 after:bottom-0",
    },
    { size: "lg", position: "default", className: "after:-inset-3" },
    {
      size: "lg",
      position: "top",
      className: "after:-top-3 after:right-0 after:left-0 after:h-3",
    },
    {
      size: "lg",
      position: "bottom",
      className: "after:-bottom-3 after:right-0 after:left-0 after:h-3",
    },
    {
      size: "lg",
      position: "left",
      className: "after:-left-3 after:top-0 after:bottom-0 after:w-3",
    },
    {
      size: "lg",
      position: "right",
      className: "after:-right-3 after:top-0 after:bottom-0 after:w-3",
    },
    {
      size: "lg",
      position: "vertical",
      className: "after:-top-3 after:-bottom-3 after:right-0 after:left-0",
    },
    {
      size: "lg",
      position: "horizontal",
      className: "after:-left-3 after:-right-3 after:top-0 after:bottom-0",
    },
  ],
  defaultVariants: {
    size: "default",
    position: "default",
    shape: "default",
    debug: false,
  },
});

interface HitboxProps
  extends React.ComponentProps<typeof Slot>,
    VariantProps<typeof hitboxVariants> {
  inset?: string;
}

function Hitbox(props: HitboxProps) {
  const {
    className,
    size,
    position,
    shape,
    debug = false,
    inset,
    style: styleProp,
    ...hitboxProps
  } = props;

  const style = React.useMemo(() => {
    if (!inset) return styleProp;

    return {
      ...styleProp,
      "--hitbox-inset": inset,
    } as React.CSSProperties;
  }, [inset, styleProp]);

  return (
    <Slot
      data-slot="hitbox"
      style={style}
      {...hitboxProps}
      className={cn(
        hitboxVariants({
          size: inset ? undefined : size,
          position,
          shape,
          debug,
        }),
        inset && "after:[inset:var(--hitbox-inset)]",
        className,
      )}
    />
  );
}

export { Hitbox };
