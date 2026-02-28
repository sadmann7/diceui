import type {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/registry/bases/base/ui/dialog";
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

  /**
   * Whether the dialog should be modal.
   * On desktop (Dialog), this controls focus trapping and backdrop dismissal.
   * On mobile (Drawer), this is ignored.
   */
  modal?: boolean;

  /**
   * The content of the dialog/drawer.
   */
  children?: React.ReactNode;
}

export interface ResponsiveDialogTriggerProps extends EmptyProps<"button"> {
  /**
   * Render prop for custom trigger rendering.
   * Supports Base UI render pattern (desktop) and converts to asChild for Drawer (mobile).
   */
  render?: React.ComponentProps<typeof DialogTrigger>["render"];
}

export interface ResponsiveDialogCloseProps extends EmptyProps<"button"> {
  /**
   * Render prop for custom close button rendering.
   * Supports Base UI render pattern (desktop) and converts to asChild for Drawer (mobile).
   */
  render?: React.ComponentProps<typeof DialogClose>["render"];
}

export interface ResponsiveDialogPortalProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogPortal>, "div"> {
  /**
   * The container element to portal into.
   * @default document.body
   */
  container?: HTMLElement | null;
}

export interface ResponsiveDialogOverlayProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogOverlay>, "div"> {
  /**
   * Render prop for custom overlay rendering.
   * Only used on desktop (Dialog). Ignored on mobile (Drawer).
   */
  render?: React.ComponentProps<typeof DialogOverlay>["render"];
}

export interface ResponsiveDialogContentProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogContent>, "div"> {
  /**
   * Whether to show the close button in the top-right corner.
   * Only applies on desktop (Dialog). Ignored on mobile (Drawer).
   * @default true
   */
  showCloseButton?: boolean;
}

export interface ResponsiveDialogHeaderProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogFooterProps extends EmptyProps<"div"> {
  /**
   * Whether to show a close button in the footer.
   * Only applies on desktop (Dialog). Ignored on mobile (Drawer).
   * @default false
   */
  showCloseButton?: boolean;
}

export interface ResponsiveDialogTitleProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogTitle>, "h2"> {}

export interface ResponsiveDialogDescriptionProps
  extends EmptyCompProps<React.ComponentProps<typeof DialogDescription>, "p"> {}
