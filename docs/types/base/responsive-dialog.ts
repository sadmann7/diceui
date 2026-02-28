import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { EmptyProps } from "@/types";

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
   * The content of the dialog/drawer.
   */
  children?: React.ReactNode;
}

export interface ResponsiveDialogTriggerProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  children?: React.ReactNode;
  render?: DialogPrimitive.Trigger.Props["render"];
}

export interface ResponsiveDialogCloseProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  children?: React.ReactNode;
  render?: DialogPrimitive.Close.Props["render"];
}

export interface ResponsiveDialogPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement | null;
}

export interface ResponsiveDialogOverlayProps
  extends React.ComponentProps<"div"> {}

export interface ResponsiveDialogContentProps extends React.ComponentProps<"div"> {
  showCloseButton?: boolean;
}

export interface ResponsiveDialogHeaderProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogFooterProps extends EmptyProps<"div"> {
  showCloseButton?: boolean;
}

export interface ResponsiveDialogTitleProps extends React.ComponentProps<"h2"> {}

export interface ResponsiveDialogDescriptionProps
  extends React.ComponentProps<"p"> {}
