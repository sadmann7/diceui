export type ControlledProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  "defaultValue" | "value" | "onValueChange"
>;

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  keyof React.ComponentProps<T>
>;

export interface CompositionProps {
  /**
   * Whether to merge props with the immediate child.
   * @default false
   */
  asChild?: boolean;
}

import type { ClientUploadedFileData } from "uploadthing/types";

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}
