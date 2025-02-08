import type { EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"kbd"> {
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

  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface KeyProps extends EmptyProps<"span"> {
  /**
   * Description for the key. If not provided, will try to use the predefined description from KEY_DESCRIPTIONS.
   * @example
   * <KbdKey description="Command">⌘</KbdKey>
   * <KbdKey>⌘</KbdKey> // Uses built-in description
   */
  description?: string;

  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}

export interface SeparatorProps extends EmptyProps<"span"> {
  /**
   * Whether to merge props with child component.
   * @default false
   */
  asChild?: boolean;
}
