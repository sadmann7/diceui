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
   * Description for the key. If not provided, will try to use the predefined description from KEY_DESCRIPTIONS.
   * @example
   * <KbdKey description="Command">⌘</KbdKey>
   * <KbdKey>⌘</KbdKey> // Uses built-in description
   */
  description?: string;
}

export interface SeparatorProps extends EmptyProps<"span">, CompositionProps {}
