"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const PAST_YEARS_LIMIT = 120;
const FUTURE_YEARS_LIMIT = 10;

interface TransformOptions {
  currency?: string;
  locale?: string;
}

interface ValidateOptions {
  min?: number;
  max?: number;
}

interface MaskPattern {
  pattern: string;
  placeholder?: string;
  transform?: (value: string, opts?: TransformOptions) => string;
  validate?: (value: string, opts?: ValidateOptions) => boolean;
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
      const minYear = currentYear - PAST_YEARS_LIMIT;
      const maxYear = currentYear + FUTURE_YEARS_LIMIT;
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
    validate: (value) => {
      const cleaned = value.replace(/\D/g, "");
      return (
        cleaned.length >= 15 && cleaned.length <= 19 && /^\d+$/.test(cleaned)
      );
    },
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
    transform: (value, { currency = "USD", locale = "en-US" } = {}) => {
      let localeDecimalSeparator = ".";

      try {
        const formatter = new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        const parts = formatter.formatToParts(1234.5);
        const decimalPart = parts.find((part) => part.type === "decimal");

        if (decimalPart) localeDecimalSeparator = decimalPart.value;
      } catch {
        // Keep defaults
      }

      const cleaned = value.replace(/[^\d.,]/g, "");

      const dotIndex = cleaned.indexOf(".");
      const commaIndex = cleaned.indexOf(",");

      let hasDecimalSeparator = false;
      let decimalIndex = -1;

      if (localeDecimalSeparator === ",") {
        const lastCommaIndex = cleaned.lastIndexOf(",");
        if (lastCommaIndex !== -1) {
          const afterComma = cleaned.substring(lastCommaIndex + 1);
          if (afterComma.length <= 2 && /^\d*$/.test(afterComma)) {
            hasDecimalSeparator = true;
            decimalIndex = lastCommaIndex;
          }
        }

        if (!hasDecimalSeparator && dotIndex !== -1) {
          const afterDot = cleaned.substring(dotIndex + 1);
          if (afterDot.length <= 2 && /^\d*$/.test(afterDot)) {
            hasDecimalSeparator = true;
            decimalIndex = dotIndex;
          }
        }

        if (!hasDecimalSeparator && cleaned.length >= 4) {
          const match = cleaned.match(/^(\d+)\.(\d{3})(\d{1,2})$/);
          if (match) {
            const [, beforeDot, thousandsPart, decimalPart] = match;
            const integerPart = (beforeDot || "") + (thousandsPart || "");
            const result = `${integerPart}.${decimalPart}`;
            return result;
          }
        }
      } else {
        const lastDotIndex = cleaned.lastIndexOf(".");
        if (lastDotIndex !== -1) {
          const afterDot = cleaned.substring(lastDotIndex + 1);
          if (afterDot.length <= 2 && /^\d*$/.test(afterDot)) {
            hasDecimalSeparator = true;
            decimalIndex = lastDotIndex;
          }
        }

        if (!hasDecimalSeparator && commaIndex !== -1) {
          const afterComma = cleaned.substring(commaIndex + 1);
          const looksLikeThousands = commaIndex <= 3 && afterComma.length >= 3;
          if (
            !looksLikeThousands &&
            afterComma.length <= 2 &&
            /^\d*$/.test(afterComma)
          ) {
            hasDecimalSeparator = true;
            decimalIndex = commaIndex;
          }
        }
      }

      if (hasDecimalSeparator && decimalIndex !== -1) {
        const beforeDecimal = cleaned
          .substring(0, decimalIndex)
          .replace(/[.,]/g, "");
        const afterDecimal = cleaned
          .substring(decimalIndex + 1)
          .replace(/[.,]/g, "");

        if (afterDecimal === "") {
          const result = `${beforeDecimal}.`;
          return result;
        }

        const result = `${beforeDecimal}.${afterDecimal.substring(0, 2)}`;
        return result;
      }

      const digitsOnly = cleaned.replace(/[.,]/g, "");
      return digitsOnly;
    },
    validate: (value) => {
      if (!/^\d+(\.\d{1,2})?$/.test(value)) return false;
      const num = parseFloat(value);
      return !Number.isNaN(num) && num >= 0;
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
    validate: (value, opts = {}) => {
      const num = parseFloat(value);
      const min = opts.min ?? 0;
      const max = opts.max ?? 100;
      return !Number.isNaN(num) && num >= min && num <= max;
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
    transform: (value) => value.replace(/[^0-9.]/g, ""),
    validate: (value) => {
      if (value.includes(".")) {
        const segments = value.split(".");
        if (segments.length > 4) return false;

        return segments.every((segment) => {
          if (segment === "") return true;
          if (!/^\d{1,3}$/.test(segment)) return false;
          const num = parseInt(segment, 10);
          return num >= 0 && num <= 255;
        });
      } else {
        if (!/^\d+$/.test(value)) return false;
        if (value.length > 12) return false;

        const chunks = [];
        for (let i = 0; i < value.length; i += 3) {
          chunks.push(value.substring(i, i + 3));
        }

        if (chunks.length > 4) return false;

        return chunks.every((chunk) => {
          const num = parseInt(chunk, 10);
          return num >= 0 && num <= 255;
        });
      }
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

function applyMask(opts: {
  value: string;
  pattern: string;
  currency?: string;
  locale?: string;
  mask?: MaskPatternKey | MaskPattern;
}): string {
  const { value, pattern, currency, locale, mask } = opts;

  const cleanValue = value;

  if (pattern.includes("$") || pattern.includes("€") || mask === "currency") {
    return applyCurrencyMask({ value: cleanValue, currency, locale });
  }

  if (pattern.includes("%")) {
    return applyPercentageMask(cleanValue);
  }

  if (mask === "ipv4") {
    return cleanValue;
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

function applyCurrencyMask(opts: {
  value: string;
  currency?: string;
  locale?: string;
}): string {
  const { value, currency = "USD", locale = "en-US" } = opts;

  if (!value) return "";

  let currencySymbol = "$";
  let decimalSeparator = ".";
  let groupSeparator = ",";

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const parts = formatter.formatToParts(1234.5);
    const currencyPart = parts.find((part) => part.type === "currency");
    const decimalPart = parts.find((part) => part.type === "decimal");
    const groupPart = parts.find((part) => part.type === "group");

    if (currencyPart) currencySymbol = currencyPart.value;
    if (decimalPart) decimalSeparator = decimalPart.value;
    if (groupPart) groupSeparator = groupPart.value;
  } catch {
    currencySymbol = "$";
    decimalSeparator = ".";
    groupSeparator = ",";
  }

  const normalizedValue = value
    .replace(
      new RegExp(
        `\\${groupSeparator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "g",
      ),
      "",
    )
    .replace(decimalSeparator, ".");

  const parts = normalizedValue.split(".");
  const integerPart = parts[0] ?? "";
  const fractionalPart = parts[1] ?? "";

  if (!integerPart && !fractionalPart) return "";

  const intValue = integerPart || "0";
  const fracValue = fractionalPart.slice(0, 2);

  const num = Number(`${intValue}.${fracValue || ""}`);

  if (Number.isNaN(num)) {
    const cleanedDigits = value.replace(/[^\d]/g, "");
    if (!cleanedDigits) return "";
    return `${currencySymbol}${cleanedDigits}`;
  }

  const hasExplicitDecimal =
    value.includes(".") || value.includes(decimalSeparator);

  try {
    const result = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: fracValue ? fracValue.length : 0,
      maximumFractionDigits: 2,
    }).format(num);

    if (hasExplicitDecimal && !fracValue) {
      if (result.match(/^[^\d\s]+/)) {
        const finalResult = result.replace(/(\d)$/, `$1${decimalSeparator}`);
        return finalResult;
      } else {
        const finalResult = result.replace(
          /(\d)(\s*)([^\d\s]+)$/,
          `$1${decimalSeparator}$2$3`,
        );
        return finalResult;
      }
    }

    return result;
  } catch {
    const formattedInt = intValue.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      groupSeparator,
    );
    let result = `${currencySymbol}${formattedInt}`;
    if (hasExplicitDecimal) {
      result += `${decimalSeparator}${fracValue}`;
    }

    return result;
  }
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

function getUnmaskedValue(opts: {
  value: string;
  transform?: (value: string, opts?: TransformOptions) => string;
  currency?: string;
  locale?: string;
}): string {
  const { value, transform, currency, locale } = opts;

  return transform
    ? transform(value, { currency, locale })
    : value.replace(/\D/g, "");
}

function toUnmaskedIndex(opts: {
  masked: string;
  pattern: string;
  caret: number;
}): number {
  const { masked, pattern, caret } = opts;

  let idx = 0;
  for (let i = 0; i < caret && i < masked.length && i < pattern.length; i++) {
    if (pattern[i] === "#") {
      idx++;
    }
  }
  return idx;
}

function fromUnmaskedIndex(opts: {
  masked: string;
  pattern: string;
  unmaskedIndex: number;
}): number {
  const { masked, pattern, unmaskedIndex } = opts;

  let seen = 0;
  for (let i = 0; i < masked.length && i < pattern.length; i++) {
    if (pattern[i] === "#") {
      seen++;
      if (seen === unmaskedIndex) {
        return i + 1;
      }
    }
  }
  return masked.length;
}

type InputElement = React.ComponentRef<"input">;

type ValidationMode = "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";

interface MaskInputProps extends React.ComponentProps<"input"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (
    maskedValue: string,
    unmaskedValue: string,
    event?: React.ChangeEvent<InputElement>,
  ) => void;
  onValidate?: (isValid: boolean, unmaskedValue: string) => void;
  validationMode?: ValidationMode;
  mask?: MaskPatternKey | MaskPattern;
  asChild?: boolean;
  invalid?: boolean;
  withoutMask?: boolean;
  currency?: string;
  locale?: string;
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
    min,
    max,
    asChild = false,
    disabled = false,
    invalid = false,
    readOnly = false,
    required = false,
    withoutMask = false,
    currency = "USD",
    locale = "en-US",
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
      if (focused && maskPattern) {
        if (
          mask === "currency" ||
          maskPattern.pattern.includes("$") ||
          maskPattern.pattern.includes("€")
        ) {
          let currencySymbol = "$";
          try {
            const formatter = new Intl.NumberFormat(locale, {
              style: "currency",
              currency: currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
            const parts = formatter.formatToParts(0);
            const currencyPart = parts.find((part) => part.type === "currency");
            if (currencyPart) {
              currencySymbol = currencyPart.value;
            }
          } catch {
            currencySymbol = "$";
          }
          try {
            const formatter = new Intl.NumberFormat(locale, {
              style: "currency",
              currency: currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            return formatter.format(0);
          } catch {
            return `${currencySymbol}0.00`;
          }
        }
        if (mask === "percentage" || maskPattern.pattern.includes("%")) {
          return "0.00%";
        }
        return maskPattern?.placeholder ?? placeholderProp;
      }
      return placeholderProp;
    }

    if (focused && maskPattern) {
      if (
        mask === "currency" ||
        maskPattern.pattern.includes("$") ||
        maskPattern.pattern.includes("€")
      ) {
        try {
          const formatter = new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          return formatter.format(0);
        } catch {
          return "$0.00";
        }
      }
      if (mask === "percentage" || maskPattern.pattern.includes("%")) {
        return "0.00%";
      }
      return maskPattern?.placeholder;
    }

    return undefined;
  }, [
    placeholderProp,
    withoutMask,
    maskPattern,
    focused,
    mask,
    currency,
    locale,
  ]);

  const displayValue = React.useMemo(() => {
    if (withoutMask || !maskPattern || !value) return value ?? "";
    const unmasked = getUnmaskedValue({
      value,
      transform: maskPattern.transform,
      currency,
      locale,
    });
    return applyMask({
      value: unmasked,
      pattern: maskPattern.pattern,
      currency,
      locale,
      mask,
    });
  }, [value, maskPattern, withoutMask, currency, locale, mask]);

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

    if (mask === "currency" || mask === "percentage" || mask === "ipv4") {
      return "decimal";
    }

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
        const minValue = typeof min === "string" ? parseFloat(min) : min;
        const maxValue = typeof max === "string" ? parseFloat(max) : max;
        const isValid = maskPattern.validate(unmaskedValue, {
          min: minValue,
          max: maxValue,
        });
        onValidate(isValid, unmaskedValue);
      }
    },
    [onValidate, maskPattern, min, max],
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
        unmaskedValue = getUnmaskedValue({
          value: inputValue,
          transform: maskPattern.transform,
          currency,
          locale,
        });
        newValue = applyMask({
          value: unmaskedValue,
          pattern: maskPattern.pattern,
          currency,
          locale,
          mask,
        });

        if (inputRef.current && newValue !== inputValue) {
          const inputElement = inputRef.current;
          if (!(inputElement instanceof HTMLInputElement)) return;
          inputElement.value = newValue;

          const currentUnmasked = getUnmaskedValue({
            value: newValue,
            transform: maskPattern.transform,
            currency,
            locale,
          });

          let newCursorPosition: number;
          if (
            maskPattern.pattern.includes("$") ||
            maskPattern.pattern.includes("€") ||
            maskPattern.pattern.includes("%")
          ) {
            if (mask === "currency") {
              try {
                const formatter = new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                });
                const sampleFormat = formatter.format(123);
                const currencyAtEnd = /\d\s*[^\d\s]+$/.test(sampleFormat);

                if (currencyAtEnd) {
                  const match = newValue.match(/(\d)\s*([^\d\s]+)$/);
                  if (match?.[1]) {
                    newCursorPosition = newValue.lastIndexOf(match[1]) + 1;
                  } else {
                    newCursorPosition = newValue.length;
                  }
                } else {
                  newCursorPosition = newValue.length;
                }
              } catch {
                newCursorPosition = newValue.length;
              }
            } else {
              newCursorPosition = newValue.length;
            }
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
            if (mask === "currency") {
              try {
                const formatter = new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                });
                const sampleFormat = formatter.format(123);
                const currencyAtEnd = /\d\s*[^\d\s]+$/.test(sampleFormat);

                if (!currencyAtEnd) {
                  newCursorPosition = Math.max(1, newCursorPosition);
                }
              } catch {
                newCursorPosition = Math.max(1, newCursorPosition);
              }
            } else {
              newCursorPosition = Math.max(1, newCursorPosition);
            }
          } else if (maskPattern.pattern.includes("%")) {
            newCursorPosition = Math.min(
              newValue.length - 1,
              newCursorPosition,
            );
          }

          newCursorPosition = Math.min(newCursorPosition, newValue.length);

          inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
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
      currency,
      locale,
      mask,
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
          ? getUnmaskedValue({
              value: currentValue,
              transform: maskPattern.transform,
              currency,
              locale,
            })
          : currentValue;
        onInputValidate(unmaskedValue);
      }
    },
    [
      onBlurProp,
      touched,
      shouldValidate,
      onInputValidate,
      maskPattern,
      currency,
      locale,
    ],
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
    (e: React.CompositionEvent<InputElement>) => {
      onCompositionEndProp?.(e);
      if (e.defaultPrevented) return;

      setComposing(false);

      const inputElement = inputRef.current;
      if (!inputElement) return;
      if (!(inputElement instanceof HTMLInputElement)) return;
      const inputValue = inputElement.value;

      if (!maskPattern || withoutMask) {
        if (!isControlled) setInternalValue(inputValue);
        if (shouldValidate("change")) onValidate?.(true, inputValue);
        onValueChangeProp?.(inputValue, inputValue);
        return;
      }

      const unmasked = getUnmaskedValue({
        value: inputValue,
        transform: maskPattern.transform,
        currency,
        locale,
      });
      const masked = applyMask({
        value: unmasked,
        pattern: maskPattern.pattern,
        currency,
        locale,
        mask,
      });

      if (!isControlled) setInternalValue(masked);
      if (shouldValidate("change")) onInputValidate(unmasked);
      onValueChangeProp?.(masked, unmasked);
    },
    [
      onCompositionEndProp,
      maskPattern,
      withoutMask,
      isControlled,
      shouldValidate,
      onValidate,
      onValueChangeProp,
      currency,
      locale,
      mask,
      onInputValidate,
    ],
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<InputElement>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;

      if (withoutMask || !maskPattern) return;

      if (mask === "ipv4") return;

      const target = event.target as InputElement;
      if (!(target instanceof HTMLInputElement)) return;

      const pastedData = event.clipboardData.getData("text");
      if (!pastedData) return;

      event.preventDefault();

      const currentValue = target.value;
      const selectionStart = target.selectionStart ?? 0;
      const selectionEnd = target.selectionEnd ?? 0;

      const beforeSelection = currentValue.slice(0, selectionStart);
      const afterSelection = currentValue.slice(selectionEnd);
      const newInputValue = beforeSelection + pastedData + afterSelection;

      const unmasked = getUnmaskedValue({
        value: newInputValue,
        transform: maskPattern.transform,
        currency,
        locale,
      });
      const newMaskedValue = applyMask({
        value: unmasked,
        pattern: maskPattern.pattern,
        currency,
        locale,
        mask,
      });

      target.value = newMaskedValue;

      if (
        mask === "currency" ||
        maskPattern.pattern.includes("$") ||
        maskPattern.pattern.includes("€")
      ) {
        try {
          const sample = new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
          }).format(1);
          const currencyAtEnd = /\d\s*[^\d\s]+$/.test(sample);
          const caret = currencyAtEnd
            ? newMaskedValue.search(/\s*[^\d\s]+$/)
            : newMaskedValue.length;
          target.setSelectionRange(caret, caret);
        } catch {
          target.setSelectionRange(
            newMaskedValue.length,
            newMaskedValue.length,
          );
        }
        return;
      }

      if (maskPattern.pattern.includes("%")) {
        target.setSelectionRange(
          newMaskedValue.length - 1,
          newMaskedValue.length - 1,
        );
        return;
      }

      let newCursorPosition = newMaskedValue.length;
      try {
        const unmaskedCount = unmasked.length;
        let position = 0;
        let count = 0;

        for (
          let i = 0;
          i < maskPattern.pattern.length && i < newMaskedValue.length;
          i++
        ) {
          if (maskPattern.pattern[i] === "#") {
            count++;
            if (count <= unmaskedCount) {
              position = i + 1;
            }
          }
        }
        newCursorPosition = position;
      } catch {
        // fallback to end
      }

      target.setSelectionRange(newCursorPosition, newCursorPosition);

      if (!isControlled) setInternalValue(newMaskedValue);
      if (shouldValidate("change")) onInputValidate(unmasked);
      onValueChangeProp?.(newMaskedValue, unmasked);
    },
    [
      onPasteProp,
      withoutMask,
      maskPattern,
      mask,
      currency,
      locale,
      isControlled,
      shouldValidate,
      onInputValidate,
      onValueChangeProp,
    ],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<InputElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      if (withoutMask || !maskPattern) return;

      if (mask === "ipv4") return;

      if (event.key === "Backspace") {
        const target = event.target as InputElement;
        if (!(target instanceof HTMLInputElement)) return;
        const cursorPosition = target.selectionStart ?? 0;
        const selectionEnd = target.selectionEnd ?? 0;
        const currentValue = target.value;

        if (
          mask === "currency" ||
          mask === "percentage" ||
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

            const unmaskedIndex = toUnmaskedIndex({
              masked: currentValue,
              pattern: maskPattern.pattern,
              caret: cursorPosition,
            });
            if (unmaskedIndex > 0) {
              const currentUnmasked = getUnmaskedValue({
                value: currentValue,
                transform: maskPattern.transform,
                currency,
                locale,
              });
              const nextUnmasked =
                currentUnmasked.slice(0, unmaskedIndex - 1) +
                currentUnmasked.slice(unmaskedIndex);
              const nextMasked = applyMask({
                value: nextUnmasked,
                pattern: maskPattern.pattern,
                currency,
                locale,
                mask,
              });

              target.value = nextMasked;
              const nextCaret = fromUnmaskedIndex({
                masked: nextMasked,
                pattern: maskPattern.pattern,
                unmaskedIndex: unmaskedIndex - 1,
              });
              target.setSelectionRange(nextCaret, nextCaret);

              onValueChangeProp?.(nextMasked, nextUnmasked, undefined);
            }
            return;
          }
        }
      }

      if (event.key === "Delete") {
        const target = event.target as InputElement;
        if (!(target instanceof HTMLInputElement)) return;
        const cursorPosition = target.selectionStart ?? 0;
        const selectionEnd = target.selectionEnd ?? 0;
        const currentValue = target.value;

        if (
          mask === "currency" ||
          mask === "percentage" ||
          maskPattern.pattern.includes("$") ||
          maskPattern.pattern.includes("€") ||
          maskPattern.pattern.includes("%")
        ) {
          return;
        }

        if (cursorPosition !== selectionEnd) {
          return;
        }

        if (cursorPosition < currentValue.length) {
          const charAtCursor = currentValue[cursorPosition];

          const isLiteral = maskPattern.pattern[cursorPosition] !== "#";

          if (charAtCursor && isLiteral) {
            event.preventDefault();

            const unmaskedIndex = toUnmaskedIndex({
              masked: currentValue,
              pattern: maskPattern.pattern,
              caret: cursorPosition,
            });
            const currentUnmasked = getUnmaskedValue({
              value: currentValue,
              transform: maskPattern.transform,
              currency,
              locale,
            });

            if (unmaskedIndex < currentUnmasked.length) {
              const nextUnmasked =
                currentUnmasked.slice(0, unmaskedIndex) +
                currentUnmasked.slice(unmaskedIndex + 1);
              const nextMasked = applyMask({
                value: nextUnmasked,
                pattern: maskPattern.pattern,
                currency,
                locale,
                mask,
              });

              target.value = nextMasked;
              const nextCaret = fromUnmaskedIndex({
                masked: nextMasked,
                pattern: maskPattern.pattern,
                unmaskedIndex: unmaskedIndex,
              });
              target.setSelectionRange(nextCaret, nextCaret);

              onValueChangeProp?.(nextMasked, nextUnmasked, undefined);
            }
            return;
          }
        }
      }
    },
    [
      maskPattern,
      onKeyDownProp,
      onValueChangeProp,
      currency,
      locale,
      mask,
      withoutMask,
    ],
  );

  const InputPrimitive = asChild ? Slot : "input";

  return (
    <InputPrimitive
      aria-invalid={invalid}
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-required={required ? "" : undefined}
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
      min={min}
      max={max}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onChange={onValueChange}
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
