export interface ClientOnlyProps {
  /**
   * Component to show before client-side hydration.
   *
   * ```ts
   * fallback={<Skeleton />}
   * ```
   *
   * @default null
   */

  fallback?: React.ReactNode;
}

export interface DirectionProviderProps {
  /**
   * The direction of the text.
   * @default "ltr"
   */
  dir: "ltr" | "rtl";
}

export interface VisuallyHiddenProps {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface ComposeEventHandlersProps<E> {
  /**
   * The original event handler to compose.
   *
   * This will be called first.
   */
  originalEventHandler?: (event: E) => void;

  /**
   * The event handler to compose.
   *
   * This will be called after the original event handler.
   */
  ourEventHandler?: (event: E) => void;

  /**
   * Whether to check if the original event handler called `event.preventDefault()`.
   *
   * If `true`, the original event handler will be called first and if it calls `event.preventDefault()`, the our event handler will not be called.
   *
   * ```ts
   * const onClick = composeEventHandlers(
   *  (event) => {
   *    console.log("Do a kickflip", event)
   *  },
   *  {
   *    checkForDefaultPrevented: false
   *  }
   * )
   * ```
   *
   * @default true
   */
  checkForDefaultPrevented?: boolean;
}

export interface ComposeRefsProps<T> {
  /**
   * Multiple refs to compose together (can be callback refs or RefObjects).
   *
   * ```ts
   * const composedRef = composeRefs(ref1, ref2);
   * ```
   */
  refs: React.Ref<T>[];
}

export interface UseComposedRefsProps<T> {
  /**
   * Multiple refs to compose together (can be callback refs or RefObjects).
   *
   * ```ts
   * const composedRef = useComposedRefs(ref1, ref2);
   * ```
   */
  refs: React.Ref<T>[];
}
