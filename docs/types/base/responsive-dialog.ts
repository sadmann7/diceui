import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { EmptyCompProps, EmptyProps } from "@/types";

export interface ResponsiveDialogProps {
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

export interface ResponsiveDialogTriggerProps extends EmptyCompProps<
  DialogPrimitive.Trigger.Props,
  "button"
> {
  /**
   * The content of the trigger.
   */
  children?: React.ReactNode;

  /**
   * Render prop for custom trigger rendering.
   * Supports Base UI render pattern (desktop) and converts to asChild for Drawer (mobile).
   */
  render?: DialogPrimitive.Trigger.Props["render"];
}

export interface ResponsiveDialogCloseProps extends EmptyCompProps<
  DialogPrimitive.Close.Props,
  "button"
> {
  /**
   * The content of the close button.
   */
  children?: React.ReactNode;

  /**
   * Render prop for custom close button rendering.
   * Supports Base UI render pattern (desktop) and converts to asChild for Drawer (mobile).
   */
  render?: DialogPrimitive.Close.Props["render"];
}

export interface ResponsiveDialogPortalProps {
  /**
   * The content to render inside the portal.
   */
  children?: React.ReactNode;

  /**
   * The container element to portal into.
   */
  container?: HTMLElement | null;
}

export interface ResponsiveDialogOverlayProps extends React.ComponentProps<"div"> {
  /**
   * Render prop for custom overlay rendering.
   * Only used on desktop (Dialog). Ignored on mobile (Drawer).
   */
  render?: DialogPrimitive.Backdrop.Props["render"];

  /**
   * Whether to force render the overlay even when closed.
   * Only used on desktop (Dialog). Ignored on mobile (Drawer).
   */
  forceRender?: boolean;
}

export interface ResponsiveDialogContentProps extends React.ComponentProps<"div"> {
  /**
   * Whether to show the close button in the top-right corner.
   * Only applies on desktop (Dialog). Ignored on mobile (Drawer).
   * @default true for Dialog
   */
  showCloseButton?: boolean;
}

export interface ResponsiveDialogHeaderProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogFooterProps extends EmptyProps<"div"> {
  /**
   * Whether to show a close button in the footer.
   * Applies to both Dialog and Drawer.
   * @default false
   */
  showCloseButton?: boolean;
}

export interface ResponsiveDialogTitleProps extends React.ComponentProps<"h2"> {}

export interface ResponsiveDialogDescriptionProps extends React.ComponentProps<"p"> {}
