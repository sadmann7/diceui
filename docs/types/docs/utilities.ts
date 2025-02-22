import type { CompositionProps } from "@/types";

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

export interface PortalProps extends CompositionProps {
  /**
   * The container to mount the portal into.
   * @default document.body
   */
  container?: Element | DocumentFragment | null;
}

export interface VisuallyHiddenProps extends CompositionProps {}

export interface ComposeEventHandlersProps<E> {
  /** The original event handler that will be called first. */
  originalEventHandler?: (event: E) => void;

  /** The event handler to run after the original event handler if not prevented. */
  ourEventHandler?: (event: E) => void;

  /**
   * Whether to check if the original event handler called `event.preventDefault()`.
   *
   *  If `true`, will check if `event.preventDefault()` was called by the original handler.
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
   * The refs to compose together (can be callback refs or RefObjects).
   *
   * ```ts
   * const composedRef = composeRefs(ref1, ref2);
   * ```
   */
  refs: React.Ref<T>[];
}

export interface UseComposedRefsProps<T> {
  /**
   * The refs to compose together (can be callback refs or RefObjects).
   *
   * ```ts
   * const composedRef = useComposedRefs(ref1, ref2);
   * ```
   */
  refs: React.Ref<T>[];
}
