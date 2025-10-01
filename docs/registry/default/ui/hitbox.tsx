import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const hitboxVariants = cva(
  [
    "relative after:absolute after:content-['']",
    "[--size-default:0.5rem] [--size-lg:0.75rem] [--size-sm:0.25rem]",
  ],
  {
    variants: {
      size: {
        default: "[--size:var(--size-default)]",
        sm: "[--size:var(--size-sm)]",
        lg: "[--size:var(--size-lg)]",
      },
      position: {
        default: "after:[inset:calc(-1*var(--size))]",
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
    defaultVariants: {
      size: "default",
      position: "default",
      shape: "default",
      debug: false,
    },
  },
);

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
      "--inset": inset,
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
        inset && "after:[inset:var(--inset)]",
        className,
      )}
    />
  );
}

export { Hitbox };
