import type { Input } from "@/components/ui/input";
import type { CompositionProps } from "@/types";
import type * as React from "react";

export interface GroupedInputProps
  extends Omit<
      React.ComponentProps<typeof Input>,
      keyof React.ComponentProps<"input">
    >,
    CompositionProps {
  /**
   * The position of the input within a group of inputs.
   * - `first`: The first input in the group (rounded right side removed)
   * - `middle`: A middle input in the group (no rounded corners, left border removed)
   * - `last`: The last input in the group (rounded left side removed, left border removed)
   * - `isolated`: A standalone input (default styling)
   *
   * @default "isolated"
   */
  position?: "first" | "middle" | "last" | "isolated";
}
