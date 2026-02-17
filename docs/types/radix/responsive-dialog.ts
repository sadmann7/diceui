import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type { EmptyProps } from "@/types";

export interface ResponsiveDialogProps
  extends EmptyProps<typeof DialogPrimitive.Root> {
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
  extends EmptyProps<typeof DialogPrimitive.Trigger> {}

export interface ResponsiveDialogCloseProps
  extends EmptyProps<typeof DialogPrimitive.Close> {}

export interface ResponsiveDialogPortalProps
  extends EmptyProps<typeof DialogPrimitive.Portal> {}

export interface ResponsiveDialogOverlayProps
  extends EmptyProps<typeof DialogPrimitive.Overlay> {}

export interface ResponsiveDialogContentProps
  extends EmptyProps<typeof DialogPrimitive.Content> {}

export interface ResponsiveDialogHeaderProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogFooterProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogTitleProps
  extends EmptyProps<typeof DialogPrimitive.Title> {}

export interface ResponsiveDialogDescriptionProps
  extends EmptyProps<typeof DialogPrimitive.Description> {}
