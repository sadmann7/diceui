import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"kbd">, CompositionProps {
  /**
   * The size of the keyboard key.
   * @default "default"
   */
  size?: "default" | "sm" | "lg";

  /**
   * The visual style of the keyboard key.
   * @default "default"
   */
  variant?: "default" | "outline" | "ghost";
}

export interface KeyProps extends EmptyProps<"span">, CompositionProps {
  /**
   * Title for the key. If not provided, will try to use the predefined title.
   * @example
   * <KbdKey title="Command">⌘</KbdKey>
   * <KbdKey>⌘</KbdKey> // Uses built-in title
   */
  title?: string;
}

export interface SeparatorProps extends EmptyProps<"span">, CompositionProps {}
