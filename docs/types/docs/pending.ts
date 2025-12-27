import type { EmptyProps } from "@/types";

export interface UsePendingOptions {
  /**
   * Whether the element is in a pending state.
   * This disables press and hover events while retaining focusability,
   * and announces the pending state to screen readers.
   *
   * ```tsx
   * const { pendingProps } = usePending({ isPending: isSubmitting });
   * ```
   *
   * @default false
   */
  isPending?: boolean;

  /**
   * The ID of the element. Used for aria-labelledby when announcing state changes.
   *
   * ```tsx
   * const { pendingProps } = usePending({
   *   isPending: true,
   *   id: "submit-button"
   * });
   * ```
   */
  id?: string;

  /**
   * Whether the element is disabled.
   * When pending, the element will be aria-disabled but remain focusable.
   *
   * ```tsx
   * const { pendingProps } = usePending({
   *   isPending: true,
   *   isDisabled: false
   * });
   * ```
   *
   * @default false
   */
  isDisabled?: boolean;
}

export interface UsePendingReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Props to spread on the interactive element.
   * Includes aria attributes, data attributes, and event handler overrides.
   *
   * ```tsx
   * const { pendingProps } = usePending({ isPending: true });
   * <button {...pendingProps}>Submit</button>
   * ```
   */
  pendingProps: React.HTMLAttributes<T> & {
    "aria-disabled"?: "true";
    "data-pending"?: true;
    "data-disabled"?: true;
  };

  /**
   * Whether the element is currently in a pending state.
   */
  isPending: boolean;
}

export interface PendingProps extends EmptyProps<"div"> {
  /**
   * Whether the element is in a pending state.
   * This disables press and hover events while retaining focusability,
   * and announces the pending state to screen readers.
   *
   * ```tsx
   * <Pending isPending={isSubmitting}>
   *   <Button>Submit</Button>
   * </Pending>
   * ```
   *
   * @default false
   */
  isPending?: boolean;

  /**
   * Whether to render as the child element via Radix Slot.
   * When true, the component merges its props and behavior onto the immediate child element.
   *
   * ```tsx
   * <Pending isPending={true} asChild>
   *   <button>Submit</button>
   * </Pending>
   * ```
   *
   * @default true
   */
  asChild?: boolean;

  /**
   * The ID of the element. Used for aria-labelledby when announcing state changes.
   */
  id?: string;

  /**
   * Whether the element is disabled.
   * When pending, the element will be aria-disabled but remain focusable.
   *
   * @default false
   */
  isDisabled?: boolean;

  /**
   * The children to render.
   */
  children: React.ReactNode;
}
