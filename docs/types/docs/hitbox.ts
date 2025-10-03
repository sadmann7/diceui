import type { Slot } from "@radix-ui/react-slot";
import type * as React from "react";
import type { CompositionProps } from "@/types";

export interface HitboxProps
  extends Omit<
      React.ComponentProps<typeof Slot>,
      keyof React.ComponentProps<"div">
    >,
    CompositionProps {
  /**
   * The size of the hitbox area.
   *
   * Can be one of the predefined sizes or a custom CSS value.
   *
   * ```ts
   * // Predefined sizes
   * size="default"
   * size="sm"
   * size="lg"
   *
   * // Custom CSS value
   * size="5px"
   * ```
   *
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | (string & {});

  /**
   * The position of the hitbox relative to the child element.
   *
   * - `all`: Extends in all directions
   * - `top`: Extends only above the element
   * - `bottom`: Extends only below the element
   * - `left`: Extends only to the left of the element
   * - `right`: Extends only to the right of the element
   * - `vertical`: Extends above and below the element
   * - `horizontal`: Extends left and right of the element
   *
   * @default "all"
   */
  position?:
    | "all"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "vertical"
    | "horizontal";

  /**
   * The border radius of the hitbox area.
   *
   * - `none`: No border radius
   * - `sm`: Small border radius
   * - `md`: Medium border radius
   * - `lg`: Large border radius
   * - `full`: Fully rounded (circular)
   *
   * @default "none"
   */
  radius?: "none" | "sm" | "md" | "lg" | "full";

  /**
   * When `true`, shows a visual debug outline of the hitbox area.
   *
   * @default false
   */
  debug?: boolean;
}
