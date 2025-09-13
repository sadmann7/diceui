import type * as React from "react";
import type { CompositionProps, EmptyProps } from "@/types";

export interface MaskPattern {
  /** The pattern string where # represents input characters and other characters are literals */
  pattern: string;
  /** The placeholder text to show when focused */
  placeholder: string;
  /** Transform function to clean/format input before applying mask */
  transform?: (value: string) => string;
  /** Validation function to check if the unmasked value is valid */
  validate?: (value: string) => boolean;
}

/** Predefined mask pattern keys for common input formats */
export type MaskPatternKey =
  | "phone"
  | "ssn"
  | "date"
  | "time"
  | "creditCard"
  | "zipCode"
  | "zipCodeExtended";

export interface MaskInputProps extends React.ComponentProps<"input"> {
  /**
   * Predefined mask type or custom mask pattern.
   * Can be a predefined mask type or a custom mask pattern.
   *
   * ```ts
   * // Predefined mask type
   * mask="phone"
   *
   * // Custom mask pattern
   * mask={{
   *   pattern: "###-###-####",
   *   placeholder: "123-456-7890",
   *   transform: (value) => value.replace(/[^0-9]/g, ""),
   *   validate: (value) => value.length === 10,
   * }}
   * ```
   */
  mask?: MaskPatternKey | MaskPattern;

  /** Controlled value */
  value?: string;

  /** Default uncontrolled value */
  defaultValue?: string;

  /**
   * Change handler with masked and unmasked values.
   *
   * ```ts
   * onValueChange={(masked, unmasked, event) => {
   *   console.log('Masked:', masked);     // "(555) 123-4567"
   *   console.log('Unmasked:', unmasked); // "5551234567"
   * }}
   * ```
   */
  onValueChange?: (
    maskedValue: string,
    unmaskedValue: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;

  /** Validation callback */
  onValidate?: (isValid: boolean, unmaskedValue: string) => void;

  /** Whether to disable masking */
  withoutMask?: boolean;

  /** Whether the input has validation errors */
  invalid?: boolean;

  /** Render as child component using Slot */
  asChild?: boolean;
}
