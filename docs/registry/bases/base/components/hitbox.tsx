import type * as React from "react";

import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

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
        top: "after:[top:calc(-1*var(--size))] after:[right:0] after:[left:0] after:[height:var(--size)]",
        bottom:
          "after:[right:0] after:[bottom:calc(-1*var(--size))] after:[left:0] after:[height:var(--size)]",
        left: "after:[top:0] after:[bottom:0] after:[left:calc(-1*var(--size))] after:[width:var(--size)]",
        right:
          "after:[top:0] after:[right:calc(-1*var(--size))] after:[bottom:0] after:[width:var(--size)]",
        vertical:
          "after:[top:calc(-1*var(--size))] after:[right:0] after:[bottom:calc(-1*var(--size))] after:[left:0]",
        horizontal:
          "after:[top:0] after:[right:calc(-1*var(--size))] after:[bottom:0] after:[left:calc(-1*var(--size))]",
      },
      radius: {
        none: "",
        sm: "after:rounded-sm",
        md: "after:rounded-md",
        lg: "after:rounded-lg",
        full: "after:rounded-full",
      },
      debug: {
        true: "after:border after:border-dashed after:border-red-500 after:bg-red-500/20",
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
  extends
    useRender.ComponentProps<"div">,
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
    render,
    ...hitboxProps
  } = props;

  const isDynamicSize = size && !sizes.includes(size);

  return useRender({
    props: {
      ...hitboxProps,
      className: cn(
        hitboxVariants({
          size: isDynamicSize ? "dynamic" : (size as Size),
          position,
          radius,
          debug,
        }),
        className,
      ),
      style: {
        ...(isDynamicSize && { "--size": size }),
        ...style,
      } as React.CSSProperties,
    },
    render,
    state: {
      slot: "hitbox",
    },
  });
}

export { Hitbox };
