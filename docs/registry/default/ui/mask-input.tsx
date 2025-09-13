"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

interface MaskPattern {
  pattern: string;
  placeholder: string;
  transform?: (value: string) => string;
  validate?: (value: string) => boolean;
}

type MaskPatternKey =
  | "phone"
  | "ssn"
  | "date"
  | "time"
  | "creditCard"
  | "zipCode"
  | "zipCodeExtended"
  | "currency"
  | "currencyEur"
  | "percentage"
  | "licensePlate"
  | "ipAddress"
  | "macAddress"
  | "isbn"
  | "ein";

const MASK_PATTERNS: Record<MaskPatternKey, MaskPattern> = {
  phone: {
    pattern: "(###) ###-####",
    placeholder: "(___) ___-____",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => /^\d{10}$/.test(value.replace(/\D/g, "")),
  },
  ssn: {
    pattern: "###-##-####",
    placeholder: "___-__-____",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => /^\d{9}$/.test(value.replace(/\D/g, "")),
  },
  date: {
    pattern: "##/##/####",
    placeholder: "mm/dd/yyyy",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length !== 8) return false;
      const month = parseInt(cleaned.substring(0, 2), 10);
      const day = parseInt(cleaned.substring(2, 4), 10);
      const year = parseInt(cleaned.substring(4, 8), 10);

      // Basic range checks
      if (month < 1 || month > 12 || day < 1 || year < 1900) return false;

      // Days per month validation
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      // Check for leap year
      const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      if (isLeapYear && month === 2) {
        daysInMonth[1] = 29;
      }

      return day <= (daysInMonth[month - 1] ?? 31);
    },
  },
  time: {
    pattern: "##:##",
    placeholder: "hh:mm",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length !== 4) return false;
      const hours = parseInt(cleaned.substring(0, 2), 10);
      const minutes = parseInt(cleaned.substring(2, 4), 10);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    },
  },
  creditCard: {
    pattern: "#### #### #### ####",
    placeholder: "____ ____ ____ ____",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => /^\d{16}$/.test(value.replace(/\D/g, "")),
  },
  zipCode: {
    pattern: "#####",
    placeholder: "_____",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => /^\d{5}$/.test(value.replace(/\D/g, "")),
  },
  zipCodeExtended: {
    pattern: "#####-####",
    placeholder: "_____-____",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => /^\d{9}$/.test(value.replace(/\D/g, "")),
  },
  currency: {
    pattern: "$###,###.##",
    placeholder: "$0.00",
    transform: (value) => {
      // Remove everything except digits and decimal point
      const cleaned = value.replace(/[^\d.]/g, "");
      // Ensure only one decimal point
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        return parts[0] + "." + parts.slice(1).join("");
      }
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) {
        return parts[0] + "." + parts[1].substring(0, 2);
      }
      return cleaned;
    },
    validate: (value) => {
      if (!/^\d+(\.\d{1,2})?$/.test(value)) return false;
      const num = parseFloat(value);
      return !Number.isNaN(num) && num >= 0 && num <= 999999999.99;
    },
  },
  currencyEur: {
    pattern: "€###,###.##",
    placeholder: "€0.00",
    transform: (value) => {
      const cleaned = value.replace(/[^\d.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        return parts[0] + "." + parts.slice(1).join("");
      }
      if (parts[1] && parts[1].length > 2) {
        return parts[0] + "." + parts[1].substring(0, 2);
      }
      return cleaned;
    },
    validate: (value) => {
      if (!/^\d+(\.\d{1,2})?$/.test(value)) return false;
      const num = parseFloat(value);
      return !Number.isNaN(num) && num >= 0 && num <= 999999999.99;
    },
  },
  percentage: {
    pattern: "##.##%",
    placeholder: "0.00%",
    transform: (value) => {
      const cleaned = value.replace(/[^\d.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        return parts[0] + "." + parts.slice(1).join("");
      }
      if (parts[1] && parts[1].length > 2) {
        return parts[0] + "." + parts[1].substring(0, 2);
      }
      return cleaned;
    },
    validate: (value) => {
      const num = parseFloat(value);
      return !Number.isNaN(num) && num >= 0 && num <= 100;
    },
  },
  licensePlate: {
    pattern: "###-###",
    placeholder: "ABC-123",
    transform: (value) => value.replace(/[^A-Z0-9]/gi, "").toUpperCase(),
    validate: (value) => /^[A-Z0-9]{6}$/.test(value),
  },
  ipAddress: {
    pattern: "###.###.###.###",
    placeholder: "192.168.1.1",
    transform: (value) => value.replace(/[^\d.]/g, ""),
    validate: (value) => {
      const parts = value.split(".");
      if (parts.length !== 4) return false;
      return parts.every((part) => {
        // Check for empty parts or leading zeros (except "0" itself)
        if (!part || (part.length > 1 && part.startsWith("0"))) return false;
        const num = parseInt(part, 10);
        return !Number.isNaN(num) && num >= 0 && num <= 255;
      });
    },
  },
  macAddress: {
    pattern: "##:##:##:##:##:##",
    placeholder: "00:1B:44:11:3A:B7",
    transform: (value) => value.replace(/[^A-F0-9]/gi, "").toUpperCase(),
    validate: (value) => /^[A-F0-9]{12}$/.test(value),
  },
  isbn: {
    pattern: "###-#-###-#####-#",
    placeholder: "978-0-123-45678-9",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => /^\d{13}$/.test(value.replace(/\D/g, "")),
  },
  ein: {
    pattern: "##-#######",
    placeholder: "12-3456789",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => /^\d{9}$/.test(value.replace(/\D/g, "")),
  },
};

function applyMask(
  value: string,
  pattern: string,
  transform?: (value: string) => string,
): string {
  const cleanValue = transform ? transform(value) : value;

  // Special handling for currency patterns
  if (pattern.includes("$") || pattern.includes("€")) {
    return applyCurrencyMask(cleanValue, pattern);
  }

  // Special handling for percentage
  if (pattern.includes("%")) {
    return applyPercentageMask(cleanValue);
  }

  // Default mask application for other patterns
  let masked = "";
  let valueIndex = 0;

  for (let i = 0; i < pattern.length && valueIndex < cleanValue.length; i++) {
    const patternChar = pattern[i];
    const valueChar = cleanValue[valueIndex];

    if (patternChar === "#") {
      masked += valueChar;
      valueIndex++;
    } else {
      masked += patternChar;
    }
  }

  return masked;
}

function applyCurrencyMask(value: string, pattern: string): string {
  if (!value) return "";

  const currencySymbol = pattern.includes("$") ? "$" : "€";
  const parts = value.split(".");
  let integerPart = parts[0] || "";
  const decimalPart = parts[1] || "";

  // Add commas to integer part (only if there are digits)
  if (integerPart && integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let result = currencySymbol + (integerPart || "0");

  // Only add decimal part if user has typed a decimal point or decimal digits
  if (value.includes(".")) {
    result += "." + (decimalPart || "").substring(0, 2);
  }

  return result;
}

function applyPercentageMask(value: string): string {
  if (!value) return "";

  const parts = value.split(".");
  let result = parts[0] || "0";

  // Only add decimal part if user has typed a decimal point
  if (value.includes(".")) {
    result += "." + (parts[1] || "").substring(0, 2);
  }

  return result + "%";
}

function getUnmaskedValue(
  value: string,
  transform?: (value: string) => string,
): string {
  return transform ? transform(value) : value.replace(/\D/g, "");
}

function calculateCursorPosition(
  maskedValue: string,
  pattern: string,
  currentUnmaskedLength: number,
  _previousUnmaskedLength: number,
): number {
  // For dynamic patterns (currency, percentage), position at end
  if (pattern.includes("$") || pattern.includes("€") || pattern.includes("%")) {
    return maskedValue.length;
  }

  // For fixed patterns, find position after the last user character
  let position = 0;
  let unmaskedCount = 0;

  for (let i = 0; i < pattern.length && i < maskedValue.length; i++) {
    if (pattern[i] === "#") {
      unmaskedCount++;
      if (unmaskedCount <= currentUnmaskedLength) {
        position = i + 1;
      }
    }
  }

  return position;
}

type InputElement = HTMLInputElement;

interface MaskInputProps extends React.ComponentProps<"input"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (
    maskedValue: string,
    unmaskedValue: string,
    event: React.ChangeEvent<InputElement>,
  ) => void;
  onValidate?: (isValid: boolean, unmaskedValue: string) => void;
  mask?: MaskPatternKey | MaskPattern;
  asChild?: boolean;
  invalid?: boolean;
  withoutMask?: boolean;
}

function MaskInput(props: MaskInputProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange: onValueChangeProp,
    onValidate,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onPaste: onPasteProp,
    mask,
    placeholder: placeholderProp,
    asChild = false,
    disabled = false,
    invalid = false,
    readOnly = false,
    required = false,
    withoutMask = false,
    className,
    ref,
    ...inputProps
  } = props;

  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const maskPattern = React.useMemo(() => {
    if (typeof mask === "string") {
      return MASK_PATTERNS[mask];
    }
    return mask;
  }, [mask]);

  const placeholder = React.useMemo(() => {
    if (placeholderProp) return placeholderProp;
    if (!withoutMask && maskPattern && isFocused) {
      return maskPattern.placeholder;
    }
    return maskPattern?.placeholder || placeholderProp;
  }, [placeholderProp, withoutMask, maskPattern, isFocused]);

  const displayValue = React.useMemo(() => {
    if (!maskPattern || !value) return value;
    return applyMask(value, maskPattern.pattern, maskPattern.transform);
  }, [value, maskPattern]);

  const onValueChange = React.useCallback(
    (event: React.ChangeEvent<InputElement>) => {
      const inputValue = event.target.value;
      let newValue = inputValue;
      let unmaskedValue = inputValue;

      if (maskPattern) {
        const previousValue = inputRef.current?.value || "";

        unmaskedValue = getUnmaskedValue(inputValue, maskPattern.transform);
        newValue = applyMask(
          unmaskedValue,
          maskPattern.pattern,
          maskPattern.transform,
        );

        // Calculate the correct cursor position based on the change
        if (inputRef.current && newValue !== inputValue) {
          inputRef.current.value = newValue;

          const previousUnmasked = getUnmaskedValue(
            previousValue,
            maskPattern.transform,
          );
          const currentUnmasked = getUnmaskedValue(
            newValue,
            maskPattern.transform,
          );

          let newCursorPosition = calculateCursorPosition(
            newValue,
            maskPattern.pattern,
            currentUnmasked.length,
            previousUnmasked.length,
          );

          // Apply pattern-specific cursor constraints
          if (
            maskPattern.pattern.includes("$") ||
            maskPattern.pattern.includes("€")
          ) {
            newCursorPosition = Math.max(1, newCursorPosition); // After currency symbol
          } else if (maskPattern.pattern.includes("%")) {
            newCursorPosition = Math.min(
              newValue.length - 1,
              newCursorPosition,
            ); // Before % symbol
          }

          newCursorPosition = Math.min(newCursorPosition, newValue.length);

          inputRef.current.setSelectionRange(
            newCursorPosition,
            newCursorPosition,
          );
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Validate if validation function is provided
      if (onValidate && maskPattern?.validate) {
        const isValid = maskPattern.validate(unmaskedValue);
        onValidate(isValid, unmaskedValue);
      }

      onValueChangeProp?.(newValue, unmaskedValue, event);
    },
    [maskPattern, isControlled, onValueChangeProp, onValidate],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<InputElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      setIsFocused(true);
    },
    [onFocusProp],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<InputElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;

      setIsFocused(false);
    },
    [onBlurProp],
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<InputElement>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;

      if (!maskPattern) return;

      event.preventDefault();
      const pastedText = event.clipboardData.getData("text");
      const target = event.target as InputElement;
      const cursorPosition = target.selectionStart || 0;
      const currentValue = target.value;

      // Get the unmasked pasted text
      const unmaskedPasted = getUnmaskedValue(
        pastedText,
        maskPattern.transform,
      );

      // Get current unmasked value
      const currentUnmasked = getUnmaskedValue(
        currentValue,
        maskPattern.transform,
      );

      // Calculate where to insert in the unmasked value
      let insertPosition = 0;
      let patternIndex = 0;

      for (
        let i = 0;
        i < cursorPosition &&
        i < currentValue.length &&
        patternIndex < maskPattern.pattern.length;
        i++
      ) {
        const currentChar = currentValue[i];
        const patternChar = maskPattern.pattern[patternIndex];

        if (patternChar === "#") {
          // This is a user-inputtable position
          if (
            currentChar &&
            currentChar !== (maskPattern.placeholder?.[i] || "_")
          ) {
            insertPosition++;
          }
          patternIndex++;
        } else if (currentChar === patternChar) {
          // This is a literal character that matches the pattern
          patternIndex++;
        } else {
          // Mismatch - try to sync up
          break;
        }
      }

      // Limit pasted content to remaining pattern capacity
      const maxLength = maskPattern.pattern.split("#").length - 1; // Count of # characters
      const availableLength = maxLength - currentUnmasked.length;
      const limitedPasted = unmaskedPasted.slice(
        0,
        Math.max(0, availableLength),
      );

      if (limitedPasted.length === 0) {
        // Nothing to paste
        return;
      }

      // Create new unmasked value with pasted content
      const newUnmaskedValue =
        currentUnmasked.slice(0, insertPosition) +
        limitedPasted +
        currentUnmasked.slice(insertPosition);

      // Apply mask to the new value
      const newMaskedValue = applyMask(
        newUnmaskedValue,
        maskPattern.pattern,
        maskPattern.transform,
      );

      // Update the input
      target.value = newMaskedValue;

      // Position cursor after pasted content
      let newCursorPosition = 0;
      let unmaskedIndex = 0;
      const targetUnmaskedLength = insertPosition + unmaskedPasted.length;

      for (
        let i = 0;
        i < newMaskedValue.length && unmaskedIndex < targetUnmaskedLength;
        i++
      ) {
        if (maskPattern.pattern[i] === "#") {
          unmaskedIndex++;
          if (unmaskedIndex <= targetUnmaskedLength) {
            newCursorPosition = i + 1;
          }
        }
      }

      target.setSelectionRange(newCursorPosition, newCursorPosition);

      // Trigger change event
      const syntheticEvent = {
        ...event,
        target: {
          ...target,
          value: newMaskedValue,
          selectionStart: newCursorPosition,
        },
      } as unknown as React.ChangeEvent<InputElement>;

      onValueChange(syntheticEvent);
    },
    [maskPattern, onValueChange, onPasteProp],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<InputElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      // Handle backspace to remove mask characters properly
      if (event.key === "Backspace" && maskPattern) {
        const target = event.target as InputElement;
        const cursorPosition = target.selectionStart || 0;
        const selectionEnd = target.selectionEnd || 0;
        const currentValue = target.value;

        // Special handling for currency and percentage patterns
        if (
          maskPattern.pattern.includes("$") ||
          maskPattern.pattern.includes("€") ||
          maskPattern.pattern.includes("%")
        ) {
          // For currency/percentage, let the normal backspace work
          // The transform function will handle the cleanup
          return;
        }

        // Handle text selection deletion
        if (cursorPosition !== selectionEnd) {
          return; // Let default behavior handle selection deletion
        }

        if (cursorPosition > 0) {
          const charBeforeCursor = currentValue[cursorPosition - 1];

          // Check if character is a mask literal (not a user-inputtable character)
          const isLiteral = maskPattern.pattern[cursorPosition - 1] !== "#";

          if (charBeforeCursor && isLiteral) {
            event.preventDefault();

            // Find the previous user-inputtable position
            let newCursorPosition = cursorPosition - 1;
            while (
              newCursorPosition > 0 &&
              maskPattern.pattern[newCursorPosition - 1] !== "#"
            ) {
              newCursorPosition--;
            }

            // Move cursor to before the last user character
            if (newCursorPosition > 0) {
              newCursorPosition--;
            }

            target.setSelectionRange(newCursorPosition, newCursorPosition);

            // Remove the user character and reformat
            const unmaskedValue = getUnmaskedValue(
              currentValue,
              maskPattern.transform,
            );
            const newUnmaskedValue = unmaskedValue.slice(0, -1);
            const newValue = applyMask(
              newUnmaskedValue,
              maskPattern.pattern,
              maskPattern.transform,
            );

            const syntheticEvent = {
              ...event,
              target: { ...target, value: newValue },
            } as React.ChangeEvent<InputElement>;

            onValueChange(syntheticEvent);
            return;
          }
        }
      }
    },
    [maskPattern, onKeyDownProp, onValueChange],
  );

  const InputPrimitive = asChild ? Slot : "input";

  return (
    <InputPrimitive
      aria-invalid={invalid}
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-required={required ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-slot="mask-input"
      {...inputProps}
      ref={composedRef}
      value={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      onChange={onValueChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    />
  );
}

export {
  MaskInput,
  MASK_PATTERNS,
  applyMask,
  applyCurrencyMask,
  applyPercentageMask,
  getUnmaskedValue,
  calculateCursorPosition,
  type MaskPattern,
  type MaskPatternKey,
};
