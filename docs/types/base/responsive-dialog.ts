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

export interface ResponsiveDialogProps extends EmptyCompProps<
  React.ComponentProps<typeof Dialog>,
  "div"
> {
  /**
   * The breakpoint in pixels below which the drawer is shown instead of the dialog.
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
   * Whether the dialog traps focus and dismisses on backdrop click.
   * Ignored on mobile (Drawer).
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
   */
  render?: React.ComponentProps<typeof DialogTrigger>["render"];
}

export interface ResponsiveDialogCloseProps extends EmptyProps<"button"> {
  /**
   * Render prop for custom close button rendering.
   */
  render?: React.ComponentProps<typeof DialogClose>["render"];
}

export interface ResponsiveDialogPortalProps extends EmptyCompProps<
  React.ComponentProps<typeof DialogPortal>,
  "div"
> {
  /**
   * The container element to portal into.
   * @default document.body
   */
  container?: HTMLElement | null;
}

export interface ResponsiveDialogOverlayProps extends EmptyCompProps<
  React.ComponentProps<typeof DialogOverlay>,
  "div"
> {
  /**
   * Render prop for custom overlay rendering.
   * Only applies on desktop (Dialog).
   */
  render?: React.ComponentProps<typeof DialogOverlay>["render"];
}

export interface ResponsiveDialogContentProps extends EmptyCompProps<
  React.ComponentProps<typeof DialogContent>,
  "div"
> {
  /**
   * Whether to show the close button in the top-right corner.
   * Only applies on desktop (Dialog).
   * @default true
   */
  showCloseButton?: boolean;
}

export interface ResponsiveDialogHeaderProps extends EmptyProps<"div"> {}

export interface ResponsiveDialogFooterProps extends EmptyProps<"div"> {
  /**
   * Whether to show a close button in the footer.
   * Only applies on desktop (Dialog).
   * @default false
   */
  showCloseButton?: boolean;
}

export interface ResponsiveDialogTitleProps extends EmptyCompProps<
  React.ComponentProps<typeof DialogTitle>,
  "h2"
> {}

export interface ResponsiveDialogDescriptionProps extends EmptyCompProps<
  React.ComponentProps<typeof DialogDescription>,
  "p"
> {}
