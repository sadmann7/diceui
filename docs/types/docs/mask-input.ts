import type * as React from "react";

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

export interface RootProps extends React.ComponentProps<"div"> {
  /** Predefined mask type or custom mask pattern */
  mask?: string | MaskPattern;
  /** Custom pattern object for advanced masking */
  customPattern?: MaskPattern;
  /** Text direction */
  dir?: "ltr" | "rtl";
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input has validation errors */
  invalid?: boolean;
  /** Render as child component */
  asChild?: boolean;
}

export interface FieldProps
  extends Omit<
    React.ComponentProps<"input">,
    "onChange" | "value" | "defaultValue"
  > {
  /** Controlled value */
  value?: string;
  /** Default uncontrolled value */
  defaultValue?: string;
  /** Change handler with masked and unmasked values */
  onChange?: (
    maskedValue: string,
    unmaskedValue: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /** Validation callback */
  onValidation?: (isValid: boolean, unmaskedValue: string) => void;
  /** Whether to show mask placeholder when focused */
  showMask?: boolean;
  /** Render as child component */
  asChild?: boolean;
}

export interface LabelProps extends React.ComponentProps<"label"> {
  /** Render as child component */
  asChild?: boolean;
}

export interface DescriptionProps extends React.ComponentProps<"div"> {
  /** Render as child component */
  asChild?: boolean;
}

export interface ErrorProps extends React.ComponentProps<"div"> {
  /** Render as child component */
  asChild?: boolean;
}
