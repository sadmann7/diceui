"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const colorSwatchVariants = cva(
  "box-border rounded-sm border shadow-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      size: {
        default: "size-8",
        sm: "size-6",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface ColorSwatchProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof colorSwatchVariants> {
  value?: string;
  asChild?: boolean;
  disabled?: boolean;
  withoutTransparency?: boolean;
}

function ColorSwatch(props: ColorSwatchProps) {
  const {
    value,
    size = "default",
    asChild = false,
    disabled = false,
    withoutTransparency = false,
    className,
    style,
    ...colorSwatchProps
  } = props;

  const backgroundStyle = React.useMemo(() => {
    if (!value) {
      return {
        background:
          "linear-gradient(to bottom right, transparent calc(50% - 1px), hsl(var(--destructive)) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)) no-repeat",
      };
    }

    const hasTransparency =
      value.includes("rgba") ||
      value.includes("hsla") ||
      (value.includes("rgb") && value.split(",").length === 4) ||
      (value.includes("hsl") && value.split(",").length === 4);

    if (hasTransparency && !withoutTransparency) {
      return {
        background: `linear-gradient(${value}, ${value}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0% 50% / 8px 8px`,
      };
    }

    return {
      backgroundColor: value,
    };
  }, [value, withoutTransparency]);

  const ariaLabel = !value ? "No color selected" : `Color swatch: ${value}`;

  const ColorSwatchPrimitive = asChild ? Slot : "div";

  return (
    <ColorSwatchPrimitive
      role="img"
      aria-label={ariaLabel}
      data-slot="color-swatch"
      data-disabled={disabled ? "" : undefined}
      {...colorSwatchProps}
      className={cn(colorSwatchVariants({ size }), className)}
      style={{
        ...backgroundStyle,
        forcedColorAdjust: "none",
        ...style,
      }}
    />
  );
}

export { ColorSwatch };
