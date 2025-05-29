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

export interface VisuallyHiddenInputProps {
  /**
   * The HTML element that visually represents the input.
   * This is used to match the size of the visual control.
   *
   * ```ts
   * control={buttonRef.current}
   * ```
   */
  control: HTMLElement | null;

  /**
   * The value of the input.
   */
  value?: string[] | string;

  /**
   * Whether the input is checked (for checkbox, radio, or switch inputs).
   */
  checked?: boolean;

  /**
   * Whether the input event should bubble.
   * @default true
   */
  bubbles?: boolean;
}

export interface PresenceProps {
  /** Whether the children should be present/mounted */
  present: boolean;

  /** The children to render. Can be a React element or a render function that receives the present state. */
  children:
    | React.ReactElement<{ ref?: React.Ref<HTMLElement> }>
    | ((props: { present: boolean }) => React.ReactElement<{
        ref?: React.Ref<HTMLElement>;
      }>);

  /**
   * Whether to force mount the children regardless of the present state.
   * Useful for controlling the presence of a component that is animating in or out.
   * @default false
   */
  forceMount?: boolean;

  /** Callback when all exit animations have completed. */
  onExitComplete?: () => void;
}
