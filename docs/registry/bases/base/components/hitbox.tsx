import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

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
      // Inset utilities (not arbitrary properties) so tailwind-merge can
      // override the slotted child's own after:inset-* classes, e.g. the
      // checkbox touch target.
      position: {
        all: "after:inset-[calc(-1*var(--size))]",
        top: "after:inset-[calc(-1*var(--size))_0_100%]",
        bottom: "after:inset-[100%_0_calc(-1*var(--size))]",
        left: "after:inset-[0_100%_0_calc(-1*var(--size))]",
        right: "after:inset-[0_calc(-1*var(--size))_0_100%]",
        vertical: "after:inset-[calc(-1*var(--size))_0]",
        horizontal: "after:inset-[0_calc(-1*var(--size))]",
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
  extends useRender.ComponentProps<"div">,
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
    children,
    ...hitboxProps
  } = props;

  const isDynamicSize = size && !sizes.includes(size);

  // Merge onto a single element child (like Radix Slot) so the ::after
  // hit area belongs to the interactive element instead of a wrapper div
  // that would intercept its clicks.
  const childAsRender =
    !render && React.isValidElement(children) ? children : undefined;

  return useRender({
    props: {
      ...hitboxProps,
      ...(childAsRender ? {} : { children }),
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
    render: render ?? childAsRender,
    state: {
      slot: "hitbox",
    },
  });
}

export { Hitbox };
