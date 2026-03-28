import type * as React from "react";
import type { Direction, Orientation, RenderProps } from "@/types";

export interface AvatarGroupProps extends RenderProps {
  /**
   * The orientation of the avatar group.
   *
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * The reading direction of the avatar group.
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The size of each avatar item in pixels.
   *
   * @default 40
   */
  size?: number;

  /**
   * Maximum number of items to display. When exceeded, shows overflow indicator.
   *
   * ```ts
   * max={4}
   * ```
   */
  max?: number;

  /**
   * Reverse the stacking order.
   *
   * @default false
   */
  reverse?: boolean;

  /**
   * Render function for the overflow indicator.
   *
   * ```ts
   * renderOverflow={(count) => <div>+{count}</div>}
   * ```
   */
  renderOverflow?: (count: number) => React.ReactNode;
}
