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

export type CozyProps<T extends React.ElementType> = EmptyProps<T> &
  ControlledProps<T>;

export type Direction = "ltr" | "rtl";

export type Orientation = "horizontal" | "vertical";

import type { ClientUploadedFileData } from "uploadthing/types";

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}
