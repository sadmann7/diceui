import type { Button } from "@/registry/bases/radix/ui/button";
import type { CompositionProps, EmptyProps } from "@/types";

export interface BannersProps {
  /** The children content within the banners provider. */
  children?: React.ReactNode;

  /**
   * Maximum number of banners visible at once.
   * Additional banners are queued and shown when visible ones are dismissed.
   * @default 1
   */
  maxVisible?: number;

  /**
   * The side of the viewport where banners appear.
   * @default "top"
   */
  side?: "top" | "bottom";

  /**
   * The container element to portal banners into.
   * @default document.body
   */
  container?: Element | DocumentFragment | null;
}

export interface BannerProps
  extends EmptyProps<"div">,
    CompositionProps,
    BannerVariantProps {
  /**
   * Whether the banner is open (controlled).
   *
   * ```tsx
   * <Banner open={isOpen} onOpenChange={setIsOpen}>
   *   ...
   * </Banner>
   * ```
   */
  open?: boolean;

  /**
   * Default open state (uncontrolled).
   * @default true
   */
  defaultOpen?: boolean;

  /**
   * Callback when the banner's open state changes.
   *
   * ```ts
   * onOpenChange={(open) => {
   *   console.log("Banner open:", open)
   * }}
   * ```
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Priority level for queue ordering.
   * Higher priority banners are shown first.
   * @default 0
   */
  priority?: number;

  /**
   * Whether the banner can be dismissed by the user.
   * When false, the close button is disabled.
   * @default true
   */
  dismissible?: boolean;

  /**
   * Auto-dismiss duration in milliseconds.
   * When set, the banner automatically dismisses after the specified time.
   */
  duration?: number;

  /**
   * Callback when the banner is dismissed.
   */
  onDismiss?: () => void;
}

export interface BannerIconProps extends EmptyProps<"div">, CompositionProps {}

export interface BannerContentProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface BannerTitleProps extends EmptyProps<"div"> {}

export interface BannerDescriptionProps extends EmptyProps<"div"> {}

export interface BannerActionsProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface BannerCloseProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    keyof React.ComponentProps<"button">
  > {}

export interface BannerVariantProps {
  /**
   * The visual style variant of the banner.
   * @default "default"
   */
  variant?: "default" | "info" | "success" | "warning" | "destructive";
}

export interface BannerRenderProps {
  /**
   * Unique identifier of the banner.
   */
  id: string;

  /**
   * The visual variant of the banner.
   */
  variant?: "default" | "info" | "success" | "warning" | "destructive";

  /**
   * Whether the banner can be dismissed.
   */
  dismissible: boolean;

  /**
   * Callback to animate the banner out and then remove it.
   */
  onClose: () => void;

  /**
   * Callback to immediately remove the banner without animation.
   */
  onRemove: () => void;
}

export interface UseBannerReturn {
  /**
   * Unique identifier of the banner.
   */
  id?: string;

  /**
   * The visual variant of the banner.
   */
  variant?: "default" | "info" | "success" | "warning" | "destructive" | null;

  /**
   * Whether the banner can be dismissed.
   */
  dismissible?: boolean;

  /**
   * Callback to close/dismiss the banner.
   */
  onClose?: () => void;

  /**
   * Callback to immediately remove the banner from the queue.
   */
  onRemove?: () => void;
}

export interface UseBannersReturn {
  /**
   * Adds a new banner to the queue.
   * Returns the banner's unique ID.
   *
   * ```ts
   * const id = onBannerAdd({
   *   variant: "info",
   *   content: <BannerContent>...</BannerContent>,
   * })
   * ```
   */
  onBannerAdd: (banner: BannerAddOptions) => string;

  /**
   * Removes a banner from the queue by ID.
   */
  onBannerRemove: (id: string) => void;

  /**
   * Clears all banners from the queue.
   */
  onBannersClear: () => void;

  /**
   * Current list of banners in the queue.
   */
  banners: QueuedBannerItem[];
}

export interface BannerAddOptions {
  /**
   * The content to render inside the banner.
   * Can be a React node or a render function that receives banner props.
   *
   * ```tsx
   * content: ({ onClose, onRemove }) => (
   *   <>
   *     <BannerContent>...</BannerContent>
   *     <Button onClick={onClose}>Dismiss</Button>
   *   </>
   * )
   * ```
   */
  content: React.ReactNode | ((props: BannerRenderProps) => React.ReactNode);

  /**
   * The visual style variant.
   * @default "default"
   */
  variant?: "default" | "info" | "success" | "warning" | "destructive";

  /**
   * Priority for queue ordering. Higher values show first.
   * @default 0
   */
  priority?: number;

  /**
   * Whether the banner can be dismissed by the user.
   * @default true
   */
  dismissible?: boolean;

  /**
   * Auto-dismiss duration in milliseconds.
   */
  duration?: number;

  /**
   * Callback when the banner is dismissed.
   */
  onDismiss?: () => void;
}

export interface QueuedBannerItem extends BannerAddOptions {
  /**
   * Unique identifier for the banner.
   */
  id: string;
}
