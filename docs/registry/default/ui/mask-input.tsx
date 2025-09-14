"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

interface MaskPattern {
  pattern: string;
  placeholder?: string;
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
  | "ipv4"
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

      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 120;
      const maxYear = currentYear + 10;
      if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        year < minYear ||
        year > maxYear
      )
        return false;

      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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
      const cleaned = value.replace(/[^\d.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        return `${parts[0]}.${parts.slice(1).join("")}`;
      }
      if (parts[1] && parts[1].length > 2) {
        return `${parts[0]}.${parts[1].substring(0, 2)}`;
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
        return `${parts[0]}.${parts.slice(1).join("")}`;
      }
      if (parts[1] && parts[1].length > 2) {
        return `${parts[0]}.${parts[1].substring(0, 2)}`;
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
        return `${parts[0]}.${parts.slice(1).join("")}`;
      }
      if (parts[1] && parts[1].length > 2) {
        return `${parts[0]}.${parts[1].substring(0, 2)}`;
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
  ipv4: {
    pattern: "###.###.###.###",
    placeholder: "192.168.1.1",
    transform: (value) => value.replace(/\D/g, ""),
    validate: (value) => {
      if (!/^\d+$/.test(value) || value.length > 12) return false;

      const chunks = [];
      for (let i = 0; i < value.length; i += 3) {
        chunks.push(value.slice(i, i + 3));
      }

      return chunks.every((chunk) => {
        if (!chunk) return true;
        const num = parseInt(chunk, 10);
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

  if (pattern.includes("$") || pattern.includes("€")) {
    return applyCurrencyMask(cleanValue, pattern);
  }

  if (pattern.includes("%")) {
    return applyPercentageMask(cleanValue);
  }

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
  let integerPart = parts[0] ?? "";
  const decimalPart = parts[1] ?? "";

  if (integerPart && integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let result = `${currencySymbol}${integerPart ?? "0"}`;

  if (value.includes(".")) {
    result += `.${(decimalPart ?? "").substring(0, 2)}`;
  }

  return result;
}

function applyPercentageMask(value: string): string {
  if (!value) return "";

  const parts = value.split(".");
  let result = parts[0] ?? "0";

  if (value.includes(".")) {
    result += `.${(parts[1] ?? "").substring(0, 2)}`;
  }

  return `${result}%`;
}

function getUnmaskedValue(
  value: string,
  transform?: (value: string) => string,
): string {
  return transform ? transform(value) : value.replace(/\D/g, "");
}

function toUnmaskedIndex(
  masked: string,
  pattern: string,
  caret: number,
): number {
  let idx = 0;
  for (let i = 0; i < caret && i < masked.length && i < pattern.length; i++) {
    if (pattern[i] === "#") {
      idx++;
    }
  }
  return idx;
}

function fromUnmaskedIndex(
  masked: string,
  pattern: string,
  uIdx: number,
): number {
  let seen = 0;
  for (let i = 0; i < masked.length && i < pattern.length; i++) {
    if (pattern[i] === "#") {
      seen++;
      if (seen === uIdx) {
        return i + 1;
      }
    }
  }
  return masked.length;
}

type InputElement = React.ComponentRef<typeof MaskInput>;

type ValidationMode = "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";

interface MaskInputProps extends React.ComponentProps<"input"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (
    maskedValue: string,
    unmaskedValue: string,
    event: React.ChangeEvent<InputElement>,
  ) => void;
  onValidate?: (isValid: boolean, unmaskedValue: string) => void;
  validationMode?: ValidationMode;
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
    onCompositionStart: onCompositionStartProp,
    onCompositionEnd: onCompositionEndProp,
    validationMode = "onChange",
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

  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const [focused, setFocused] = React.useState(false);
  const [composing, setComposing] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
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
    if (withoutMask) return placeholderProp;

    if (placeholderProp) {
      return focused
        ? (maskPattern?.placeholder ?? placeholderProp)
        : placeholderProp;
    }

    return focused ? maskPattern?.placeholder : undefined;
  }, [placeholderProp, withoutMask, maskPattern, focused]);

  const displayValue = React.useMemo(() => {
    if (withoutMask || !maskPattern || !value) return value ?? "";
    return applyMask(value, maskPattern.pattern, maskPattern.transform);
  }, [value, maskPattern, withoutMask]);

  const tokenCount = React.useMemo(() => {
    if (!maskPattern || /[€$%]/.test(maskPattern.pattern)) return undefined;
    return maskPattern.pattern.match(/#/g)?.length ?? 0;
  }, [maskPattern]);

  const calculatedMaxLength = tokenCount
    ? maskPattern?.pattern.length
    : inputProps.maxLength;

  const calculatedInputMode = React.useMemo(() => {
    if (inputProps.inputMode) return inputProps.inputMode;
    if (!maskPattern) return undefined;

    const numericPatterns =
      /^(phone|zipCode|zipCodeExtended|ssn|ein|time|date|creditCard)$/;
    if (typeof mask === "string" && numericPatterns.test(mask)) {
      return "numeric";
    }
    return undefined;
  }, [maskPattern, mask, inputProps.inputMode]);

  const shouldValidate = React.useCallback(
    (trigger: "change" | "blur") => {
      if (!onValidate || !maskPattern?.validate) return false;

      switch (validationMode) {
        case "onChange":
          return trigger === "change";
        case "onBlur":
          return trigger === "blur";
        case "onSubmit":
          return false;
        case "onTouched":
          return touched ? trigger === "change" : trigger === "blur";
        case "all":
          return true;
        default:
          return trigger === "change";
      }
    },
    [onValidate, maskPattern, validationMode, touched],
  );

  const onInputValidate = React.useCallback(
    (unmaskedValue: string) => {
      if (onValidate && maskPattern?.validate) {
        const isValid = maskPattern.validate(unmaskedValue);
        onValidate(isValid, unmaskedValue);
      }
    },
    [onValidate, maskPattern],
  );

  const onValueChange = React.useCallback(
    (event: React.ChangeEvent<InputElement>) => {
      const inputValue = event.target.value;
      let newValue = inputValue;
      let unmaskedValue = inputValue;

      if (composing) {
        if (!isControlled) {
          setInternalValue(inputValue);
        }
        return;
      }

      if (withoutMask || !maskPattern) {
        if (!isControlled) {
          setInternalValue(inputValue);
        }
        if (shouldValidate("change")) {
          onValidate?.(true, inputValue);
        }
        onValueChangeProp?.(inputValue, inputValue, event);
        return;
      }

      if (maskPattern) {
        unmaskedValue = getUnmaskedValue(inputValue, maskPattern.transform);
        newValue = applyMask(
          unmaskedValue,
          maskPattern.pattern,
          maskPattern.transform,
        );

        if (inputRef.current && newValue !== inputValue) {
          inputRef.current.value = newValue;

          const currentUnmasked = getUnmaskedValue(
            newValue,
            maskPattern.transform,
          );

          let newCursorPosition: number;
          if (
            maskPattern.pattern.includes("$") ||
            maskPattern.pattern.includes("€") ||
            maskPattern.pattern.includes("%")
          ) {
            newCursorPosition = newValue.length;
          } else {
            let position = 0;
            let unmaskedCount = 0;

            for (
              let i = 0;
              i < maskPattern.pattern.length && i < newValue.length;
              i++
            ) {
              if (maskPattern.pattern[i] === "#") {
                unmaskedCount++;
                if (unmaskedCount <= currentUnmasked.length) {
                  position = i + 1;
                }
              }
            }
            newCursorPosition = position;
          }

          if (
            maskPattern.pattern.includes("$") ||
            maskPattern.pattern.includes("€")
          ) {
            newCursorPosition = Math.max(1, newCursorPosition);
          } else if (maskPattern.pattern.includes("%")) {
            newCursorPosition = Math.min(
              newValue.length - 1,
              newCursorPosition,
            );
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

      if (shouldValidate("change")) {
        onInputValidate(unmaskedValue);
      }

      onValueChangeProp?.(newValue, unmaskedValue, event);
    },
    [
      maskPattern,
      isControlled,
      onValueChangeProp,
      onValidate,
      onInputValidate,
      composing,
      shouldValidate,
      withoutMask,
    ],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<InputElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      setFocused(true);
    },
    [onFocusProp],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<InputElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;

      setFocused(false);

      if (!touched) {
        setTouched(true);
      }

      if (shouldValidate("blur")) {
        const currentValue = event.target.value;
        const unmaskedValue = maskPattern
          ? getUnmaskedValue(currentValue, maskPattern.transform)
          : currentValue;
        onInputValidate(unmaskedValue);
      }
    },
    [onBlurProp, touched, shouldValidate, onInputValidate, maskPattern],
  );

  const onCompositionStart = React.useCallback(
    (event: React.CompositionEvent<InputElement>) => {
      onCompositionStartProp?.(event);
      if (event.defaultPrevented) return;

      setComposing(true);
    },
    [onCompositionStartProp],
  );

  const onCompositionEnd = React.useCallback(
    (event: React.CompositionEvent<InputElement>) => {
      onCompositionEndProp?.(event);
      if (event.defaultPrevented) return;

      setComposing(false);
      onValueChange(event as unknown as React.ChangeEvent<InputElement>);
    },
    [onCompositionEndProp, onValueChange],
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<InputElement>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;

      if (!maskPattern) return;

      event.preventDefault();
      const pastedText = event.clipboardData.getData("text");
      const target = event.target as InputElement;
      const cursorPosition = target.selectionStart ?? 0;
      const currentValue = target.value;

      const unmaskedPasted = getUnmaskedValue(
        pastedText,
        maskPattern.transform,
      );

      const currentUnmasked = getUnmaskedValue(
        currentValue,
        maskPattern.transform,
      );

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
          if (
            currentChar &&
            currentChar !== (maskPattern.placeholder?.[i] ?? "_")
          ) {
            insertPosition++;
          }
          patternIndex++;
        } else if (currentChar === patternChar) {
          patternIndex++;
        } else {
          break;
        }
      }

      const maxLength = maskPattern.pattern.split("#").length - 1;
      const availableLength = maxLength - currentUnmasked.length;
      const limitedPasted = unmaskedPasted.slice(
        0,
        Math.max(0, availableLength),
      );

      if (limitedPasted.length === 0) {
        return;
      }

      const newUnmaskedValue =
        currentUnmasked.slice(0, insertPosition) +
        limitedPasted +
        currentUnmasked.slice(insertPosition);

      const newMaskedValue = applyMask(
        newUnmaskedValue,
        maskPattern.pattern,
        maskPattern.transform,
      );

      target.value = newMaskedValue;

      let newCursorPosition = 0;
      let unmaskedIndex = 0;
      const targetUnmaskedLength = insertPosition + limitedPasted.length;

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

      if (!isControlled) {
        setInternalValue(newMaskedValue);
      }

      if (shouldValidate("change")) {
        onInputValidate(newUnmaskedValue);
      }

      onValueChangeProp?.(
        newMaskedValue,
        newUnmaskedValue,
        event as unknown as React.ChangeEvent<InputElement>,
      );
    },
    [
      maskPattern,
      onPasteProp,
      isControlled,
      onValueChangeProp,
      shouldValidate,
      onInputValidate,
    ],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<InputElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Backspace" && maskPattern) {
        const target = event.target as InputElement;
        const cursorPosition = target.selectionStart ?? 0;
        const selectionEnd = target.selectionEnd ?? 0;
        const currentValue = target.value;

        if (
          maskPattern.pattern.includes("$") ||
          maskPattern.pattern.includes("€") ||
          maskPattern.pattern.includes("%")
        ) {
          return;
        }

        if (cursorPosition !== selectionEnd) {
          return;
        }

        if (cursorPosition > 0) {
          const charBeforeCursor = currentValue[cursorPosition - 1];

          const isLiteral = maskPattern.pattern[cursorPosition - 1] !== "#";

          if (charBeforeCursor && isLiteral) {
            event.preventDefault();

            const uIdx = toUnmaskedIndex(
              currentValue,
              maskPattern.pattern,
              cursorPosition,
            );
            if (uIdx > 0) {
              const currentUnmasked = getUnmaskedValue(
                currentValue,
                maskPattern.transform,
              );
              const nextUnmasked =
                currentUnmasked.slice(0, uIdx - 1) +
                currentUnmasked.slice(uIdx);
              const nextMasked = applyMask(
                nextUnmasked,
                maskPattern.pattern,
                maskPattern.transform,
              );

              target.value = nextMasked;
              const nextCaret = fromUnmaskedIndex(
                nextMasked,
                maskPattern.pattern,
                uIdx - 1,
              );
              target.setSelectionRange(nextCaret, nextCaret);

              const syntheticEvent = {
                ...event,
                target: { ...target, value: nextMasked },
              } as React.ChangeEvent<InputElement>;

              onValueChange(syntheticEvent);
            }
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
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      placeholder={placeholder}
      ref={composedRef}
      value={displayValue}
      disabled={disabled}
      maxLength={calculatedMaxLength}
      readOnly={readOnly}
      required={required}
      inputMode={calculatedInputMode}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onChange={onValueChange}
      onPaste={onPaste}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
    />
  );
}

export {
  MaskInput,
  //
  MASK_PATTERNS,
  //
  applyMask,
  applyCurrencyMask,
  applyPercentageMask,
  getUnmaskedValue,
  toUnmaskedIndex,
  fromUnmaskedIndex,
  //
  type MaskPattern,
  type MaskPatternKey,
  type ValidationMode,
};
