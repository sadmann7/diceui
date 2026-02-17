import type { EmptyProps } from "@/types";

export interface UsePendingOptions {
  /**
   * The ID of the element. If not provided, an ID will be automatically generated.
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
   * Whether the element is in a pending state.
   * This disables press and hover events while retaining focusability,
   * and sets aria-busy and aria-disabled for screen readers.
   *
   * ```tsx
   * const { pendingProps } = usePending({ isPending: isSubmitting });
   * ```
   *
   * @default false
   */
  isPending?: boolean;

  /**
   * Whether the element is disabled.
   * When pending, the element will be aria-disabled but remain focusable.
   *
   * ```tsx
   * const { pendingProps } = usePending({
   *   isPending: true,
   *   disabled: false
   * });
   * ```
   *
   * @default false
   */
  disabled?: boolean;
}

export interface UsePendingReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Props to spread on the interactive element.
   * Includes aria attributes, data attributes, and event handler overrides.
   *
   * **Important**: Spread pendingProps last to ensure event prevention works:
   *
   * ```tsx
   * const { pendingProps } = usePending({ isPending: true });
   * // ❌ Wrong - onClick will override prevention
   * <button {...pendingProps} onClick={onSubmit}>Submit</button>
   *
   * // ✅ Correct - prevention takes precedence
   * <button onClick={onSubmit} {...pendingProps}>Submit</button>
   * ```
   */
  pendingProps: React.HTMLAttributes<T> & {
    "aria-busy"?: "true";
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
   * The ID of the element. If not provided, an ID will be automatically generated.
   */
  id?: string;

  /**
   * Whether the element is in a pending state.
   * This disables press and hover events while retaining focusability,
   * and sets aria-busy and aria-disabled for screen readers.
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
   * Whether the element is disabled.
   * When pending, the element will be aria-disabled but remain focusable.
   *
   * @default false
   */
  disabled?: boolean;
}
