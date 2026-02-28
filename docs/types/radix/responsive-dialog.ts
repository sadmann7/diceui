import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type { EmptyCompProps, EmptyProps } from "@/types";

export interface ResponsiveDialogProps extends EmptyProps<
  typeof DialogPrimitive.Root
> {
  /**
   * The breakpoint (in pixels) at which to switch between dialog and drawer.
   * Below this width, the drawer will be shown. Above it, the dialog will be shown.
   * @default 768
   */
  breakpoint?: number;

  /**
   * Whether the dialog/drawer is open (controlled).
   */
  open?: boolean;

  /**
   * Whether the dialog/drawer is open by default.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
}

export interface ResponsiveDialogTriggerProps
  extends EmptyCompProps<
    React.ComponentProps<typeof DialogPrimitive.Trigger>,
    "button"
  > {}

export interface ResponsiveDialogCloseProps
  extends EmptyCompProps<
    React.ComponentProps<typeof DialogPrimitive.Close>,
    "button"
  > {}

export interface ResponsiveDialogPortalProps
  extends EmptyCompProps<
    React.ComponentProps<typeof DialogPrimitive.Portal>,
    "div"
  > {}

export interface ResponsiveDialogOverlayProps
  extends EmptyCompProps<
    React.ComponentProps<typeof DialogPrimitive.Overlay>,
    "div"
  > {}

export interface ResponsiveDialogContentProps
  extends EmptyCompProps<
    React.ComponentProps<typeof DialogPrimitive.Content>,
    "div"
  > {}

export interface ResponsiveDialogHeaderProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogFooterProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogTitleProps
  extends EmptyCompProps<
    React.ComponentProps<typeof DialogPrimitive.Title>,
    "h2"
  > {}

export interface ResponsiveDialogDescriptionProps
  extends EmptyCompProps<
    React.ComponentProps<typeof DialogPrimitive.Description>,
    "p"
  > {}
