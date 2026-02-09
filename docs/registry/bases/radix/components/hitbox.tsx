import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

type Size = "default" | "sm" | "lg";
type DynamicSize = Size | (string & {});

const sizes: DynamicSize[] = ["default", "sm", "lg"];

const hitboxVariants = cva(
  "relative [--size-default:12px] [--size-lg:16px] [--size-sm:8px] after:absolute after:content-['']",
  {
    variants: {
      size: {
        default: "[--size:var(--size-default)]",
        sm: "[--size:var(--size-sm)]",
        lg: "[--size:var(--size-lg)]",
        dynamic: "[--size:var(--size)]",
      },
      position: {
        all: "after:[inset:calc(-1*var(--size))]",
        top: "after:[height:var(--size)] after:[left:0] after:[right:0] after:[top:calc(-1*var(--size))]",
        bottom:
          "after:[bottom:calc(-1*var(--size))] after:[height:var(--size)] after:[left:0] after:[right:0]",
        left: "after:[bottom:0] after:[left:calc(-1*var(--size))] after:[top:0] after:[width:var(--size)]",
        right:
          "after:[bottom:0] after:[right:calc(-1*var(--size))] after:[top:0] after:[width:var(--size)]",
        vertical:
          "after:[bottom:calc(-1*var(--size))] after:[left:0] after:[right:0] after:[top:calc(-1*var(--size))]",
        horizontal:
          "after:[bottom:0] after:[left:calc(-1*var(--size))] after:[right:calc(-1*var(--size))] after:[top:0]",
      },
      radius: {
        none: "",
        sm: "after:rounded-sm",
        md: "after:rounded-md",
        lg: "after:rounded-lg",
        full: "after:rounded-full",
      },
      debug: {
        true: "after:border after:border-red-500 after:border-dashed after:bg-red-500/20",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      position: "all",
      radius: "none",
      debug: false,
    },
  },
);

interface HitboxProps
  extends React.ComponentProps<typeof SlotPrimitive.Slot>,
    Omit<VariantProps<typeof hitboxVariants>, "size"> {
  size?: DynamicSize;
}

function Hitbox(props: HitboxProps) {
  const {
    className,
    style,
    size,
    position,
    radius,
    debug = false,
    ...hitboxProps
  } = props;

  const isDynamicSize = size && !sizes.includes(size);

  return (
    <SlotPrimitive.Slot
      {...hitboxProps}
      className={cn(
        hitboxVariants({
          size: isDynamicSize ? "dynamic" : (size as Size),
          position,
          radius,
          debug,
        }),
        className,
      )}
      style={{
        ...(isDynamicSize && { "--size": size }),
        ...style,
      }}
    />
  );
}

export { Hitbox };
