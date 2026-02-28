import type {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/registry/bases/radix/ui/dialog";
import type { EmptyCompProps, EmptyProps } from "@/types";

export interface ResponsiveDialogProps
  extends EmptyCompProps<React.ComponentProps<typeof Dialog>, "div"> {
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
    React.ComponentProps<typeof DialogTrigger>,
    "button"
  > {}

export interface ResponsiveDialogCloseProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogClose>, "button"> {}

export interface ResponsiveDialogPortalProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogPortal>, "div"> {}

export interface ResponsiveDialogOverlayProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogOverlay>, "div"> {}

export interface ResponsiveDialogContentProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogContent>, "div"> {}

export interface ResponsiveDialogHeaderProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogFooterProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogTitleProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogTitle>, "h2"> {}

export interface ResponsiveDialogDescriptionProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogDescription>, "p"> {}
