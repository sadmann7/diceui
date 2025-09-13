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
  | "zipCodeExtended";

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
      return month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900;
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
};

function applyMask(
  value: string,
  pattern: string,
  transform?: (value: string) => string,
): string {
  const cleanValue = transform ? transform(value) : value;
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

function getUnmaskedValue(
  value: string,
  transform?: (value: string) => string,
): string {
  return transform ? transform(value) : value.replace(/\D/g, "");
}

type InputElement = React.ComponentRef<typeof MaskInput>;

interface MaskInputProps extends React.ComponentProps<"input"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (
    value: string,
    unmaskedValue: string,
    event: React.ChangeEvent<InputElement>,
  ) => void;
  onValidate?: (isValid: boolean, value: string) => void;
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

          // Calculate new cursor position based on unmasked characters entered
          const previousUnmasked = getUnmaskedValue(
            previousValue,
            maskPattern.transform,
          );
          const currentUnmasked = getUnmaskedValue(
            newValue,
            maskPattern.transform,
          );

          let newCursorPosition = 0;
          let unmaskedIndex = 0;

          // Find the cursor position by counting unmasked characters
          for (
            let i = 0;
            i < newValue.length && unmaskedIndex < currentUnmasked.length;
            i++
          ) {
            const patternChar = maskPattern.pattern[i];
            if (patternChar === "#") {
              unmaskedIndex++;
              if (unmaskedIndex <= currentUnmasked.length) {
                newCursorPosition = i + 1;
              }
            }
          }

          // If we're at the end of input, position cursor after last character
          if (currentUnmasked.length > previousUnmasked.length) {
            // Find the position after the last entered character
            let charCount = 0;
            for (let i = 0; i < newValue.length; i++) {
              if (maskPattern.pattern[i] === "#") {
                charCount++;
                if (charCount === currentUnmasked.length) {
                  newCursorPosition = i + 1;
                  break;
                }
              }
            }
          }

          newCursorPosition = Math.min(newCursorPosition, newValue.length);

          // Set cursor position immediately for better responsiveness
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
      let charCount = 0;
      for (let i = 0; i < cursorPosition && i < currentValue.length; i++) {
        if (
          maskPattern.pattern[charCount] === "#" &&
          currentValue[i] !== maskPattern.placeholder?.[i]
        ) {
          insertPosition++;
        }
        if (
          maskPattern.pattern[charCount] === "#" ||
          currentValue[i] === maskPattern.pattern[charCount]
        ) {
          charCount++;
        }
      }

      // Create new unmasked value with pasted content
      const newUnmaskedValue =
        currentUnmasked.slice(0, insertPosition) +
        unmaskedPasted +
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
        const currentValue = target.value;

        if (cursorPosition > 0) {
          const charBeforeCursor = currentValue[cursorPosition - 1];
          // If the character before cursor is a mask character, move cursor back further
          if (charBeforeCursor && !/\d/.test(charBeforeCursor)) {
            event.preventDefault();
            const newCursorPosition = Math.max(0, cursorPosition - 2);
            target.setSelectionRange(newCursorPosition, newCursorPosition);

            const newValue =
              currentValue.slice(0, newCursorPosition) +
              currentValue.slice(cursorPosition);
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
  getUnmaskedValue,
  type MaskPattern,
};
