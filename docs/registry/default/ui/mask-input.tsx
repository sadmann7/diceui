"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const PAST_YEARS_LIMIT = 120;
const FUTURE_YEARS_LIMIT = 10;
const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";

const NUMERIC_MASK_PATTERNS =
  /^(phone|zipCode|zipCodeExtended|ssn|ein|time|date|creditCard|creditCardExpiry)$/;
const CURRENCY_PERCENTAGE_SYMBOLS = /[€$%]/;

interface CurrencySymbols {
  currency: string;
  decimal: string;
  group: string;
}

const formattersCache = new Map<string, Intl.NumberFormat>();
const currencyAtEndCache = new Map<string, boolean>();
const currencySymbolsCache = new Map<string, CurrencySymbols>();
const daysInMonthCache = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const;

const REGEX_CACHE = {
  digitsOnly: /^\d+$/,
  nonDigits: /\D/g,
  nonAlphaNumeric: /[^A-Z0-9]/gi,
  nonNumericDot: /[^0-9.]/g,
  nonCurrencyChars: /[^\d.,]/g,
  hashPattern: /#/g,
  currencyAtEnd: /\d\s*[^\d\s]+$/,
  percentageChars: /[^\d.]/g,
  phone: /^\d{10}$/,
  ssn: /^\d{9}$/,
  zipCode: /^\d{5}$/,
  zipCodeExtended: /^\d{9}$/,
  isbn: /^\d{13}$/,
  ein: /^\d{9}$/,
  time: /^\d{4}$/,
  creditCard: /^\d{13,19}$/,
  creditCardExpiry: /^\d{4}$/,
  licensePlate: /^[A-Z0-9]{6}$/,
  macAddress: /^[A-F0-9]{12}$/,
  currencyValidation: /^\d+(\.\d{1,2})?$/,
  ipv4Segment: /^\d{1,3}$/,
} as const;

function getCachedFormatter(
  locale: string | undefined,
  opts: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const {
    currency,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = opts;

  const key = `${locale}|${currency}|${minimumFractionDigits}|${maximumFractionDigits}`;

  if (!formattersCache.has(key)) {
    try {
      formattersCache.set(
        key,
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          ...opts,
        }),
      );
    } catch {
      formattersCache.set(
        key,
        new Intl.NumberFormat(DEFAULT_LOCALE, {
          style: "currency",
          currency: DEFAULT_CURRENCY,
          ...opts,
        }),
      );
    }
  }

  const formatter = formattersCache.get(key);
  if (!formatter) {
    throw new Error(`Failed to create formatter for ${key}`);
  }
  return formatter;
}

function getCachedCurrencySymbols(opts: TransformOptions): CurrencySymbols {
  const { locale, currency } = opts;

  const key = `${locale}|${currency}`;
  const cached = currencySymbolsCache.get(key);
  if (cached) {
    return cached;
  }

  let currencySymbol = "$";
  let decimalSeparator = ".";
  let groupSeparator = ",";

  try {
    const formatter = getCachedFormatter(locale, {
      currency,
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
    // Keep defaults
  }

  const symbols: CurrencySymbols = {
    currency: currencySymbol,
    decimal: decimalSeparator,
    group: groupSeparator,
  };
  currencySymbolsCache.set(key, symbols);
  return symbols;
}

function isCurrencyAtEnd(opts: TransformOptions): boolean {
  const { locale, currency } = opts;

  const key = `${locale}|${currency}`;
  const cached = currencyAtEndCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const formatter = getCachedFormatter(locale, {
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const sample = formatter.format(123);
    const result = REGEX_CACHE.currencyAtEnd.test(sample);
    currencyAtEndCache.set(key, result);
    return result;
  } catch {
    currencyAtEndCache.set(key, false);
    return false;
  }
}

function isCurrencyMask(opts: {
  mask: MaskPatternKey | MaskPattern | undefined;
  pattern?: string;
}): boolean {
  const { mask, pattern } = opts;

  return (
    mask === "currency" ||
    Boolean(pattern && (pattern.includes("$") || pattern.includes("€")))
  );
}

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
  transform?: (value: string, opts?: TransformOptions) => string;
  validate?: (value: string, opts?: ValidateOptions) => boolean;
}

type MaskPatternKey =
  | "phone"
  | "ssn"
  | "date"
  | "time"
  | "creditCard"
  | "creditCardExpiry"
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
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) =>
      REGEX_CACHE.phone.test(value.replace(REGEX_CACHE.nonDigits, "")),
  },
  ssn: {
    pattern: "###-##-####",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) =>
      REGEX_CACHE.ssn.test(value.replace(REGEX_CACHE.nonDigits, "")),
  },
  date: {
    pattern: "##/##/####",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) => {
      const cleaned = value.replace(REGEX_CACHE.nonDigits, "");
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

      const maxDays =
        month === 2 &&
        ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)
          ? 29
          : (daysInMonthCache[month - 1] ?? 31);

      return day <= maxDays;
    },
  },
  time: {
    pattern: "##:##",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) => {
      const cleaned = value.replace(REGEX_CACHE.nonDigits, "");
      if (!REGEX_CACHE.time.test(cleaned)) return false;
      const hours = parseInt(cleaned.substring(0, 2), 10);
      const minutes = parseInt(cleaned.substring(2, 4), 10);
      return hours <= 23 && minutes <= 59;
    },
  },
  creditCard: {
    pattern: "#### #### #### ####",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) => {
      const cleaned = value.replace(REGEX_CACHE.nonDigits, "");
      if (!REGEX_CACHE.creditCard.test(cleaned)) return false;

      let sum = 0;
      let isEven = false;
      for (let i = cleaned.length - 1; i >= 0; i--) {
        const digitChar = cleaned[i];
        if (!digitChar) continue;
        let digit = parseInt(digitChar, 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        sum += digit;
        isEven = !isEven;
      }
      return sum % 10 === 0;
    },
  },
  creditCardExpiry: {
    pattern: "##/##",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) => {
      const cleaned = value.replace(REGEX_CACHE.nonDigits, "");
      if (!REGEX_CACHE.creditCardExpiry.test(cleaned)) return false;

      const month = parseInt(cleaned.substring(0, 2), 10);
      const year = parseInt(cleaned.substring(2, 4), 10);

      if (month < 1 || month > 12) return false;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const fullYear = year <= 75 ? 2000 + year : 1900 + year;

      if (
        fullYear < currentYear ||
        (fullYear === currentYear && month < currentMonth)
      ) {
        return false;
      }

      const maxYear = currentYear + 50;
      if (fullYear > maxYear) {
        return false;
      }

      return true;
    },
  },
  zipCode: {
    pattern: "#####",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) =>
      REGEX_CACHE.zipCode.test(value.replace(REGEX_CACHE.nonDigits, "")),
  },
  zipCodeExtended: {
    pattern: "#####-####",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) =>
      REGEX_CACHE.zipCodeExtended.test(
        value.replace(REGEX_CACHE.nonDigits, ""),
      ),
  },
  currency: {
    pattern: "$###,###.##",
    transform: (
      value,
      { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = {},
    ) => {
      let localeDecimalSeparator = ".";

      try {
        const formatter = getCachedFormatter(locale, {
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        const parts = formatter.formatToParts(1234.5);
        const decimalPart = parts.find((part) => part.type === "decimal");

        if (decimalPart) localeDecimalSeparator = decimalPart.value;
      } catch {
        // Keep defaults
      }

      const cleaned = value.replace(REGEX_CACHE.nonCurrencyChars, "");

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
            const integerPart = (beforeDot ?? "") + (thousandsPart ?? "");
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
      if (!REGEX_CACHE.currencyValidation.test(value)) return false;
      const num = parseFloat(value);
      return !Number.isNaN(num) && num >= 0;
    },
  },
  percentage: {
    pattern: "##.##%",
    transform: (value) => {
      const cleaned = value.replace(REGEX_CACHE.percentageChars, "");
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
    transform: (value) =>
      value.replace(REGEX_CACHE.nonAlphaNumeric, "").toUpperCase(),
    validate: (value) => REGEX_CACHE.licensePlate.test(value),
  },
  ipv4: {
    pattern: "###.###.###.###",
    transform: (value) => value.replace(REGEX_CACHE.nonNumericDot, ""),
    validate: (value) => {
      if (value.includes(".")) {
        const segments = value.split(".");
        if (segments.length > 4) return false;

        return segments.every((segment) => {
          if (segment === "") return true;
          if (!REGEX_CACHE.ipv4Segment.test(segment)) return false;
          const num = parseInt(segment, 10);
          return num <= 255;
        });
      } else {
        if (!REGEX_CACHE.digitsOnly.test(value)) return false;
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
    transform: (value) =>
      value.replace(REGEX_CACHE.nonAlphaNumeric, "").toUpperCase(),
    validate: (value) => REGEX_CACHE.macAddress.test(value),
  },
  isbn: {
    pattern: "###-#-###-#####-#",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) =>
      REGEX_CACHE.isbn.test(value.replace(REGEX_CACHE.nonDigits, "")),
  },
  ein: {
    pattern: "##-#######",
    transform: (value) => value.replace(REGEX_CACHE.nonDigits, ""),
    validate: (value) =>
      REGEX_CACHE.ein.test(value.replace(REGEX_CACHE.nonDigits, "")),
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
    return applyCurrencyMask({
      value: cleanValue,
      currency: currency ?? DEFAULT_CURRENCY,
      locale: locale ?? DEFAULT_LOCALE,
    });
  }

  if (pattern.includes("%")) {
    return applyPercentageMask(cleanValue);
  }

  if (mask === "ipv4") {
    return cleanValue;
  }

  const maskedChars: string[] = [];
  let valueIndex = 0;

  for (let i = 0; i < pattern.length && valueIndex < cleanValue.length; i++) {
    const patternChar = pattern[i];
    const valueChar = cleanValue[valueIndex];

    if (patternChar === "#" && valueChar) {
      maskedChars.push(valueChar);
      valueIndex++;
    } else if (patternChar) {
      maskedChars.push(patternChar);
    }
  }

  return maskedChars.join("");
}

function applyCurrencyMask(opts: {
  value: string;
  currency?: string;
  locale?: string;
}): string {
  const { value, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = opts;

  if (!value) return "";

  const {
    currency: currencySymbol,
    decimal: decimalSeparator,
    group: groupSeparator,
  } = getCachedCurrencySymbols({ locale, currency });

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

  const intValue = integerPart ?? "0";
  const fracValue = fractionalPart.slice(0, 2);

  const num = Number(`${intValue}.${fracValue ?? ""}`);

  if (Number.isNaN(num)) {
    const cleanedDigits = value.replace(/[^\d]/g, "");
    if (!cleanedDigits) return "";
    return `${currencySymbol}${cleanedDigits}`;
  }

  const hasExplicitDecimal =
    value.includes(".") || value.includes(decimalSeparator);

  try {
    const formatter = getCachedFormatter(locale, {
      currency,
      minimumFractionDigits: fracValue ? fracValue.length : 0,
      maximumFractionDigits: 2,
    });
    const result = formatter.format(num);

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
  currency?: string;
  locale?: string;
  transform?: (value: string, opts?: TransformOptions) => string;
}): string {
  const { value, transform, currency, locale } = opts;

  return transform
    ? transform(value, { currency, locale })
    : value.replace(REGEX_CACHE.nonDigits, "");
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

function getCurrencyCaretPosition(opts: {
  newValue: string;
  mask: MaskPatternKey | MaskPattern | undefined;
  transformOpts: TransformOptions;
  oldCursorPosition?: number;
  oldValue?: string;
  previousUnmasked?: string;
}): number {
  const {
    newValue,
    mask,
    transformOpts,
    oldCursorPosition,
    oldValue,
    previousUnmasked,
  } = opts;

  if (
    oldCursorPosition !== undefined &&
    oldValue &&
    previousUnmasked !== undefined
  ) {
    if (oldCursorPosition < oldValue.length) {
      const digitsBeforeCursor = oldValue
        .substring(0, oldCursorPosition)
        .replace(/\D/g, "").length;

      let digitCount = 0;
      for (let i = 0; i < newValue.length; i++) {
        if (/\d/.test(newValue[i] ?? "")) {
          digitCount++;
          if (digitCount === digitsBeforeCursor) {
            return i + 1;
          }
        }
      }
    }
  }

  if (mask === "currency") {
    const currencyAtEnd = isCurrencyAtEnd(transformOpts);
    if (currencyAtEnd) {
      const match = newValue.match(/(\d)\s*([^\d\s]+)$/);
      if (match?.[1]) {
        return newValue.lastIndexOf(match[1]) + 1;
      } else {
        return newValue.length;
      }
    } else {
      return newValue.length;
    }
  } else {
    return newValue.length;
  }
}

function getPatternCaretPosition(opts: {
  newValue: string;
  maskPattern: MaskPattern;
  currentUnmasked: string;
  oldCursorPosition?: number;
  oldValue?: string;
  previousUnmasked?: string;
}): number {
  const {
    newValue,
    maskPattern,
    currentUnmasked,
    oldCursorPosition,
    oldValue,
    previousUnmasked,
  } = opts;
  let position = 0;
  let unmaskedCount = 0;

  if (
    oldCursorPosition !== undefined &&
    oldValue &&
    previousUnmasked !== undefined
  ) {
    const oldUnmaskedIndex = toUnmaskedIndex({
      masked: oldValue,
      pattern: maskPattern.pattern,
      caret: oldCursorPosition,
    });

    if (oldCursorPosition < oldValue.length) {
      const targetUnmaskedIndex = Math.min(
        oldUnmaskedIndex,
        currentUnmasked.length,
      );

      for (
        let i = 0;
        i < maskPattern.pattern.length && i < newValue.length;
        i++
      ) {
        if (maskPattern.pattern[i] === "#") {
          unmaskedCount++;
          if (unmaskedCount <= targetUnmaskedIndex) {
            position = i + 1;
          }
        }
      }

      return position;
    }
  }

  for (let i = 0; i < maskPattern.pattern.length && i < newValue.length; i++) {
    if (maskPattern.pattern[i] === "#") {
      unmaskedCount++;
      if (unmaskedCount <= currentUnmasked.length) {
        position = i + 1;
      }
    }
  }

  return position;
}

type InputElement = React.ComponentRef<"input">;

interface MaskInputProps extends React.ComponentProps<"input"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (maskedValue: string, unmaskedValue: string) => void;
  onValidate?: (isValid: boolean, unmaskedValue: string) => void;
  validationMode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
  mask?: MaskPatternKey | MaskPattern;
  maskPlaceholder?: string;
  currency?: string;
  locale?: string;
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
    maskPlaceholder,
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    placeholder,
    inputMode,
    min,
    max,
    maxLength,
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

  const transformOpts = React.useMemo(
    () => ({
      currency,
      locale,
    }),
    [currency, locale],
  );

  const placeholderValue = React.useMemo(() => {
    if (withoutMask) return placeholder;

    if (placeholder && maskPlaceholder) {
      return focused ? maskPlaceholder : placeholder;
    }

    if (maskPlaceholder) {
      return focused ? maskPlaceholder : undefined;
    }

    return placeholder;
  }, [placeholder, maskPlaceholder, focused, withoutMask]);

  const displayValue = React.useMemo(() => {
    if (withoutMask || !maskPattern || !value) return value ?? "";
    const unmasked = getUnmaskedValue({
      value,
      transform: maskPattern.transform,
      ...transformOpts,
    });
    return applyMask({
      value: unmasked,
      pattern: maskPattern.pattern,
      ...transformOpts,
      mask,
    });
  }, [value, maskPattern, withoutMask, transformOpts, mask]);

  const tokenCount = React.useMemo(() => {
    if (!maskPattern || CURRENCY_PERCENTAGE_SYMBOLS.test(maskPattern.pattern))
      return undefined;
    return maskPattern.pattern.match(REGEX_CACHE.hashPattern)?.length ?? 0;
  }, [maskPattern]);

  const calculatedMaxLength = tokenCount
    ? maskPattern?.pattern.length
    : maxLength;

  const calculatedInputMode = React.useMemo(() => {
    if (inputMode) return inputMode;
    if (!maskPattern) return undefined;

    if (mask === "currency" || mask === "percentage" || mask === "ipv4") {
      return "decimal";
    }

    if (typeof mask === "string" && NUMERIC_MASK_PATTERNS.test(mask)) {
      return "numeric";
    }
    return undefined;
  }, [maskPattern, mask, inputMode]);

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

  const validationOpts = React.useMemo(
    () => ({
      min: typeof min === "string" ? parseFloat(min) : min,
      max: typeof max === "string" ? parseFloat(max) : max,
    }),
    [min, max],
  );

  const onInputValidate = React.useCallback(
    (unmaskedValue: string) => {
      if (onValidate && maskPattern?.validate) {
        const isValid = maskPattern.validate(unmaskedValue, validationOpts);
        onValidate(isValid, unmaskedValue);
      }
    },
    [onValidate, maskPattern?.validate, validationOpts],
  );

  const onValueChange = React.useCallback(
    (event: React.ChangeEvent<InputElement>) => {
      const inputValue = event.target.value;
      let newValue = inputValue;
      let unmaskedValue = inputValue;

      if (composing) {
        if (!isControlled) setInternalValue(inputValue);
        return;
      }

      if (withoutMask || !maskPattern) {
        if (!isControlled) setInternalValue(inputValue);
        if (shouldValidate("change")) onValidate?.(true, inputValue);
        onValueChangeProp?.(inputValue, inputValue);
        return;
      }

      if (maskPattern) {
        unmaskedValue = getUnmaskedValue({
          value: inputValue,
          transform: maskPattern.transform,
          ...transformOpts,
        });
        newValue = applyMask({
          value: unmaskedValue,
          pattern: maskPattern.pattern,
          ...transformOpts,
          mask,
        });

        if (inputRef.current && newValue !== inputValue) {
          const inputElement = inputRef.current;
          if (!(inputElement instanceof HTMLInputElement)) return;

          const oldCursorPosition = inputElement.selectionStart ?? 0;

          inputElement.value = newValue;

          const currentUnmasked = getUnmaskedValue({
            value: newValue,
            transform: maskPattern.transform,
            ...transformOpts,
          });

          let newCursorPosition: number;

          const previousUnmasked = getUnmaskedValue({
            value,
            transform: maskPattern.transform,
            ...transformOpts,
          });

          if (CURRENCY_PERCENTAGE_SYMBOLS.test(maskPattern.pattern)) {
            newCursorPosition = getCurrencyCaretPosition({
              newValue,
              mask,
              transformOpts,
              oldCursorPosition,
              oldValue: inputValue,
              previousUnmasked,
            });
          } else {
            newCursorPosition = getPatternCaretPosition({
              newValue,
              maskPattern,
              currentUnmasked,
              oldCursorPosition,
              oldValue: inputValue,
              previousUnmasked,
            });
          }

          if (isCurrencyMask({ mask, pattern: maskPattern.pattern })) {
            if (mask === "currency") {
              const currencyAtEnd = isCurrencyAtEnd(transformOpts);
              if (!currencyAtEnd) {
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

      onValueChangeProp?.(newValue, unmaskedValue);
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
      transformOpts,
      mask,
      value,
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
              ...transformOpts,
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
      transformOpts,
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
    (event: React.CompositionEvent<InputElement>) => {
      onCompositionEndProp?.(event);
      if (event.defaultPrevented) return;

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
        ...transformOpts,
      });
      const masked = applyMask({
        value: unmasked,
        pattern: maskPattern.pattern,
        ...transformOpts,
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
      transformOpts,
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
        ...transformOpts,
      });
      const newMaskedValue = applyMask({
        value: unmasked,
        pattern: maskPattern.pattern,
        ...transformOpts,
        mask,
      });

      target.value = newMaskedValue;

      if (isCurrencyMask({ mask, pattern: maskPattern.pattern })) {
        const currencyAtEnd = isCurrencyAtEnd(transformOpts);
        const caret = currencyAtEnd
          ? newMaskedValue.search(/\s*[^\d\s]+$/)
          : newMaskedValue.length;
        target.setSelectionRange(caret, caret);
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
      transformOpts,
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

          if (charBeforeCursor) {
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
                ...transformOpts,
              });
              const nextUnmasked =
                currentUnmasked.slice(0, unmaskedIndex - 1) +
                currentUnmasked.slice(unmaskedIndex);
              const nextMasked = applyMask({
                value: nextUnmasked,
                pattern: maskPattern.pattern,
                ...transformOpts,
                mask,
              });

              target.value = nextMasked;
              const nextCaret = fromUnmaskedIndex({
                masked: nextMasked,
                pattern: maskPattern.pattern,
                unmaskedIndex: unmaskedIndex - 1,
              });

              target.setSelectionRange(nextCaret, nextCaret);

              onValueChangeProp?.(nextMasked, nextUnmasked);
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

          if (charAtCursor) {
            event.preventDefault();

            const unmaskedIndex = toUnmaskedIndex({
              masked: currentValue,
              pattern: maskPattern.pattern,
              caret: cursorPosition,
            });

            const currentUnmasked = getUnmaskedValue({
              value: currentValue,
              transform: maskPattern.transform,
              ...transformOpts,
            });

            if (unmaskedIndex < currentUnmasked.length) {
              const nextUnmasked =
                currentUnmasked.slice(0, unmaskedIndex) +
                currentUnmasked.slice(unmaskedIndex + 1);
              const nextMasked = applyMask({
                value: nextUnmasked,
                pattern: maskPattern.pattern,
                ...transformOpts,
                mask,
              });

              target.value = nextMasked;
              const nextCaret = fromUnmaskedIndex({
                masked: nextMasked,
                pattern: maskPattern.pattern,
                unmaskedIndex: unmaskedIndex,
              });

              target.setSelectionRange(nextCaret, nextCaret);

              onValueChangeProp?.(nextMasked, nextUnmasked);
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
      transformOpts,
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
      placeholder={placeholderValue}
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
  type MaskInputProps,
};
