"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const hitboxVariants = cva("relative inline-flex items-center justify-center", {
  variants: {
    variant: {
      padding: "p-[var(--hitbox-area,0.5rem)]",
      overlay:
        "before:-inset-[var(--hitbox-area,0.5rem)] before:absolute before:inset-0 before:z-10 before:cursor-pointer before:content-['']",
      expand: "-m-[var(--hitbox-area,0.5rem)]",
    },
    size: {
      sm: "[--hitbox-area:0.25rem]",
      default: "[--hitbox-area:0.5rem]",
      lg: "[--hitbox-area:0.75rem]",
      xl: "[--hitbox-area:1rem]",
    },
    debug: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "padding",
      debug: true,
      className: "border border-red-500 border-dashed bg-red-500/20",
    },
    {
      variant: "overlay",
      debug: true,
      className:
        "before:border before:border-red-500 before:border-dashed before:bg-red-500/20",
    },
    {
      variant: "expand",
      debug: true,
      className: "border border-red-500 border-dashed bg-red-500/20",
    },
  ],
  defaultVariants: {
    variant: "padding",
    size: "default",
    debug: false,
  },
});

interface HitboxProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof hitboxVariants> {
  asChild?: boolean;
  area?: string;
}

function Hitbox(props: HitboxProps) {
  const {
    className,
    variant = "padding",
    size,
    debug = false,
    asChild = false,
    area,
    style,
    onClick: onClickProp,
    ...hitboxProps
  } = props;
  const Comp = asChild ? Slot : "div";
  const ref = React.useRef<HTMLDivElement>(null);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (asChild) {
        onClickProp?.(event);
        return;
      }

      if (ref.current && !event.defaultPrevented) {
        const interactiveChild = ref.current.querySelector(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"]), [role="button"], [role="checkbox"], [role="radio"]',
        ) as HTMLElement;

        if (interactiveChild && interactiveChild !== event.target) {
          event.preventDefault();
          event.stopPropagation();

          interactiveChild.click();
        }
      }

      onClickProp?.(event);
    },
    [asChild, onClickProp],
  );

  return (
    <Comp
      data-slot="hitbox"
      {...hitboxProps}
      ref={ref}
      className={cn(
        hitboxVariants({
          variant,
          size,
          debug,
        }),
        className,
      )}
      style={{
        ...style,
        ...(area ? { "--hitbox-area": area } : {}),
      }}
      onClick={onClick}
    />
  );
}

export { Hitbox, hitboxVariants, type HitboxProps };
