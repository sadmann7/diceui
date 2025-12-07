import type { ClientUploadedFileData } from "uploadthing/types";
import type { Button } from "@/components/ui/button";

export type ControlledProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  "defaultValue" | "value" | "onValueChange"
>;

export type EmptyProps<
  T extends React.ElementType,
  K extends PropertyKey = keyof React.ComponentProps<T>,
> = Omit<React.ComponentProps<T>, K>;

export interface CompositionProps {
  /**
   * Whether to merge props with the immediate child.
   * @default false
   */
  asChild?: boolean;
}

export type Direction = "ltr" | "rtl";
export type Orientation = "horizontal" | "vertical";
export type Align = "start" | "center" | "end";
export type Side = "top" | "right" | "bottom" | "left";

export type ButtonProps = React.ComponentProps<typeof Button>;

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}
