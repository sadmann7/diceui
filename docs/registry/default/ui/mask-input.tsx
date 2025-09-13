"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "MaskInput";

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface MaskPattern {
  pattern: string;
  placeholder: string;
  transform?: (value: string) => string;
  validate?: (value: string) => boolean;
}

const MASK_PATTERNS: Record<string, MaskPattern> = {
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

interface MaskInputContextValue {
  mask?: string | MaskPattern;
  customPattern?: MaskPattern;
  dir: Direction;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
}

const MaskInputContext = React.createContext<MaskInputContextValue | null>(
  null,
);

function useMaskInputContext(consumerName: string) {
  const context = React.useContext(MaskInputContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface MaskInputRootProps extends React.ComponentProps<"div"> {
  mask?: string | MaskPattern;
  customPattern?: MaskPattern;
  dir?: Direction;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  asChild?: boolean;
}

function MaskInputRoot(props: MaskInputRootProps) {
  const {
    mask,
    customPattern,
    dir: dirProp,
    disabled = false,
    readOnly = false,
    required = false,
    invalid = false,
    asChild,
    className,
    ...rootProps
  } = props;

  const dir = useDirection(dirProp);

  const contextValue = React.useMemo<MaskInputContextValue>(
    () => ({
      mask,
      customPattern,
      dir,
      disabled,
      readOnly,
      required,
      invalid,
    }),
    [mask, customPattern, dir, disabled, readOnly, required, invalid],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <MaskInputContext.Provider value={contextValue}>
      <RootPrimitive
        data-slot="mask-input"
        data-disabled={disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        data-required={required ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        dir={dir}
        {...rootProps}
        className={cn("relative", className)}
      />
    </MaskInputContext.Provider>
  );
}

interface MaskInputFieldProps
  extends Omit<
    React.ComponentProps<"input">,
    "onChange" | "value" | "defaultValue"
  > {
  value?: string;
  defaultValue?: string;
  onChange?: (
    value: string,
    unmaskedValue: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onValidation?: (isValid: boolean, value: string) => void;
  showMask?: boolean;
  mask?: string | MaskPattern;
  customPattern?: MaskPattern;
  asChild?: boolean;
}

function MaskInputField(props: MaskInputFieldProps) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    onValidation,
    showMask = true,
    mask: maskProp,
    customPattern: customPatternProp,
    asChild,
    className,
    placeholder: placeholderProp,
    onFocus,
    onBlur,
    onKeyDown,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    required: requiredProp,
    ...inputProps
  } = props;

  const context = useMaskInputContext("MaskInputField");
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(
    props.ref as React.Ref<HTMLInputElement>,
    inputRef,
  );

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const maskPattern = React.useMemo(() => {
    // Prioritize prop values over context values
    const mask = maskProp ?? context.mask;
    const customPattern = customPatternProp ?? context.customPattern;

    if (customPattern) return customPattern;
    if (typeof mask === "string") {
      return MASK_PATTERNS[mask];
    }
    return mask;
  }, [maskProp, customPatternProp, context.mask, context.customPattern]);

  const disabled = disabledProp ?? context.disabled;
  const readOnly = readOnlyProp ?? context.readOnly;
  const required = requiredProp ?? context.required;

  const placeholder = React.useMemo(() => {
    if (placeholderProp) return placeholderProp;
    if (showMask && maskPattern && isFocused) {
      return maskPattern.placeholder;
    }
    return maskPattern?.placeholder || placeholderProp;
  }, [placeholderProp, showMask, maskPattern, isFocused]);

  const displayValue = React.useMemo(() => {
    if (!maskPattern || !value) return value;
    return applyMask(value, maskPattern.pattern, maskPattern.transform);
  }, [value, maskPattern]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      let newValue = inputValue;
      let unmaskedValue = inputValue;

      if (maskPattern) {
        unmaskedValue = getUnmaskedValue(inputValue, maskPattern.transform);
        newValue = applyMask(
          unmaskedValue,
          maskPattern.pattern,
          maskPattern.transform,
        );

        // Update the input value to show the masked format
        if (inputRef.current && newValue !== inputValue) {
          const cursorPosition = event.target.selectionStart || 0;
          inputRef.current.value = newValue;

          // Adjust cursor position
          let newCursorPosition = cursorPosition;
          if (newValue.length > inputValue.length) {
            newCursorPosition = Math.min(cursorPosition + 1, newValue.length);
          }

          requestAnimationFrame(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(
                newCursorPosition,
                newCursorPosition,
              );
            }
          });
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Validate if validation function is provided
      if (onValidation && maskPattern?.validate) {
        const isValid = maskPattern.validate(unmaskedValue);
        onValidation(isValid, unmaskedValue);
      }

      onChange?.(newValue, unmaskedValue, event);
    },
    [maskPattern, isControlled, onChange, onValidation],
  );

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace to remove mask characters properly
      if (event.key === "Backspace" && maskPattern) {
        const target = event.target as HTMLInputElement;
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
            } as React.ChangeEvent<HTMLInputElement>;

            handleChange(syntheticEvent);
            return;
          }
        }
      }

      onKeyDown?.(event);
    },
    [maskPattern, onKeyDown, handleChange],
  );

  const InputPrimitive = asChild ? Slot : "input";

  return (
    <InputPrimitive
      {...inputProps}
      ref={composedRef}
      value={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      aria-invalid={context.invalid}
      data-slot="mask-input-field"
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-required={required ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

interface MaskInputLabelProps extends React.ComponentProps<"label"> {
  asChild?: boolean;
}

function MaskInputLabel(props: MaskInputLabelProps) {
  const { asChild, className, ...labelProps } = props;
  const context = useMaskInputContext("MaskInputLabel");

  const LabelPrimitive = asChild ? Slot : "label";

  return (
    <LabelPrimitive
      data-slot="mask-input-label"
      data-disabled={context.disabled ? "" : undefined}
      data-required={context.required ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      {...labelProps}
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        context.invalid && "text-destructive",
        className,
      )}
    />
  );
}

interface MaskInputDescriptionProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MaskInputDescription(props: MaskInputDescriptionProps) {
  const { asChild, className, ...descriptionProps } = props;
  const context = useMaskInputContext("MaskInputDescription");

  const DescriptionPrimitive = asChild ? Slot : "div";

  return (
    <DescriptionPrimitive
      data-slot="mask-input-description"
      data-disabled={context.disabled ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      {...descriptionProps}
      className={cn(
        "text-muted-foreground text-sm",
        context.invalid && "text-destructive",
        className,
      )}
    />
  );
}

interface MaskInputErrorProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MaskInputError(props: MaskInputErrorProps) {
  const { asChild, className, ...errorProps } = props;
  const context = useMaskInputContext("MaskInputError");

  if (!context.invalid) return null;

  const ErrorPrimitive = asChild ? Slot : "div";

  return (
    <ErrorPrimitive
      data-slot="mask-input-error"
      data-invalid={context.invalid ? "" : undefined}
      {...errorProps}
      className={cn("font-medium text-destructive text-sm", className)}
    />
  );
}

export {
  MaskInputRoot as Root,
  MaskInputField as Field,
  MaskInputLabel as Label,
  MaskInputDescription as Description,
  MaskInputError as Error,
  //
  MaskInputRoot as MaskInput,
  MaskInputField,
  MaskInputLabel,
  MaskInputDescription,
  MaskInputError,
  //
  MASK_PATTERNS,
  applyMask,
  getUnmaskedValue,
  type MaskPattern,
};
