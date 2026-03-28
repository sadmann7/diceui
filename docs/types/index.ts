import type { ClientUploadedFileData } from "uploadthing/types";
import type { Button } from "@/registry/bases/radix/ui/button";

export type ControlledProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  "defaultValue" | "value" | "onValueChange"
>;

export type EmptyProps<
  T extends React.ElementType,
  K extends PropertyKey = keyof React.ComponentProps<T>,
> = Omit<React.ComponentProps<T>, K>;

export type EmptyCompProps<TComponent, TBase extends React.ElementType> = Omit<
  TComponent,
  keyof React.ComponentProps<TBase>
>;

export interface CompositionProps {
  /**
   * Whether to merge props with the immediate child.
   * @default false
   */
  asChild?: boolean;
}

export interface RenderProps {
  /**
   * Allows you to replace the component's HTML element
   * with a different tag, or compose it with another component.
   *
   * Accepts a `ReactElement` or a function that returns the element to render.
   *
   * ```ts
   * render={(renderProps) => <div {...renderProps} />}
   * ```
   */
  render?:
    | React.ReactElement
    | ((
        props: Record<string, unknown>,
        state: Record<string, unknown>,
      ) => React.ReactElement);
}

export type Direction = "ltr" | "rtl";
export type Orientation = "horizontal" | "vertical";
export type Align = "start" | "center" | "end";
export type Side = "top" | "right" | "bottom" | "left";

export type PointerDownOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent;
}>;

export type ButtonProps = React.ComponentProps<typeof Button>;

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}
