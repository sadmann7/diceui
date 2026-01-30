"use client";

import { Slot } from "@radix-ui/react-slot";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";
import { useAsRef } from "@/registry/default/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/default/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/default/hooks/use-lazy-ref";

const ROOT_NAME = "PhoneInput";
const COUNTRY_SELECT_NAME = "PhoneInputCountrySelect";
const FIELD_NAME = "PhoneInputField";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag?: string;
}

const DEFAULT_COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "BG", name: "Bulgaria", dialCode: "+359", flag: "🇧🇬" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "HR", name: "Croatia", dialCode: "+385", flag: "🇭🇷" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷" },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴" },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
];

function getCountryFromLocale(
  countries: Country[],
  locale?: string,
): string | undefined {
  // Skip locale detection during SSR to avoid hydration mismatch
  if (typeof window === "undefined" && !locale) {
    return undefined;
  }

  const userLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "");

  if (!userLocale) return undefined;

  const regionCode = userLocale.split("-")[1]?.toUpperCase();

  if (regionCode && countries.some((c) => c.code === regionCode)) {
    return regionCode;
  }

  return undefined;
}

type RootElement = React.ComponentRef<typeof PhoneInput>;

interface StoreState {
  value: string;
  country: string;
  isLoading: boolean;
  open: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(
  selector: (state: StoreState) => T,
  ogStore?: Store | null,
): T {
  const contextStore = React.useContext(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface PhoneInputContextValue {
  rootId: string;
  countries: Country[];
  placeholder: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  showFlag: boolean;
  showDialCode: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const PhoneInputContext = React.createContext<PhoneInputContextValue | null>(
  null,
);

function usePhoneInputContext(consumerName: string) {
  const context = React.useContext(PhoneInputContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface PhoneInputProps extends React.ComponentProps<"div"> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultCountry?: string;
  country?: string;
  onCountryChange?: (country: string) => void;
  countries?: Country[];
  locale?: string;
  autoDetect?: boolean;
  name?: string;
  placeholder?: string;
  asChild?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  showFlag?: boolean;
  showDialCode?: boolean;
}

function PhoneInput(props: PhoneInputProps) {
  const {
    value: valueProp,
    defaultValue = "",
    defaultCountry,
    country: countryProp,
    onValueChange,
    onCountryChange,
    countries = DEFAULT_COUNTRIES,
    locale,
    autoDetect = true,
    name,
    placeholder = "Enter phone number",
    asChild,
    disabled,
    required,
    readOnly,
    invalid,
    showFlag = true,
    showDialCode = true,
    className,
    children,
    id,
    ref,
    ...rootProps
  } = props;

  const instanceId = React.useId();
  const rootId = id ?? instanceId;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const [formTrigger, setFormTrigger] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => {
    // For SSR compatibility, always start with the same initial state
    // Locale detection will happen in useEffect after hydration
    const initialCountry = countryProp || defaultCountry;

    return {
      value: valueProp ?? defaultValue,
      country: initialCountry ?? "",
      isLoading: autoDetect && !countryProp && !defaultCountry,
      open: false,
    };
  });

  const propsRef = useAsRef({
    onValueChange,
    onCountryChange,
  });

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "value" && typeof value === "string") {
          stateRef.current.value = value;
          propsRef.current.onValueChange?.(value);
        } else if (key === "country" && typeof value === "string") {
          stateRef.current.country = value;
          propsRef.current.onCountryChange?.(value);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  const value = useStore((state) => state.value, store);
  const country = useStore((state) => state.country, store);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount to detect locale after hydration, not when dependencies change
  React.useEffect(() => {
    if (autoDetect && !countryProp && !defaultCountry && !country) {
      const detectedCountry =
        getCountryFromLocale(countries, locale) || countries[0]?.code;
      if (detectedCountry) {
        store.setState("country", detectedCountry);
      }
      store.setState("isLoading", false);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp]);

  useIsomorphicLayoutEffect(() => {
    if (countryProp !== undefined) {
      store.setState("country", countryProp);
    }
  }, [countryProp]);

  const contextValue = React.useMemo<PhoneInputContextValue>(
    () => ({
      rootId,
      countries,
      placeholder,
      disabled,
      readOnly,
      required,
      invalid,
      showFlag,
      showDialCode,
      inputRef,
    }),
    [
      rootId,
      countries,
      placeholder,
      disabled,
      required,
      readOnly,
      invalid,
      showFlag,
      showDialCode,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  const currentCountry = countries.find((c) => c.code === country);
  const fullValue = currentCountry
    ? `${currentCountry.dialCode}${value}`
    : value;

  return (
    <StoreContext.Provider value={store}>
      <PhoneInputContext.Provider value={contextValue}>
        <RootPrimitive
          role="group"
          data-slot="phone-input"
          data-disabled={disabled ? "" : undefined}
          data-invalid={invalid ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          {...rootProps}
          id={id}
          ref={composedRef}
          className={cn(
            "relative flex h-10 w-full items-center rounded-md border border-input bg-background data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:bg-input/30",
            className,
          )}
        >
          {children}
        </RootPrimitive>
        {isFormControl && (
          <VisuallyHiddenInput
            type="hidden"
            control={formTrigger}
            name={name}
            value={fullValue}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </PhoneInputContext.Provider>
    </StoreContext.Provider>
  );
}

interface PhoneInputCountrySelectProps
  extends React.ComponentProps<typeof Popover>,
    Pick<
      React.ComponentProps<typeof PopoverTrigger>,
      "disabled" | "className"
    > {}

function PhoneInputCountrySelect(props: PhoneInputCountrySelectProps) {
  const { disabled, className, children, ...popoverProps } = props;

  const context = usePhoneInputContext(COUNTRY_SELECT_NAME);
  const store = useStoreContext(COUNTRY_SELECT_NAME);
  const selectedCountry = useStore((state) => state.country);
  const isLoading = useStore((state) => state.isLoading);
  const open = useStore((state) => state.open);

  const isDisabled = disabled || context.disabled;

  const country = context.countries.find((c) => c.code === selectedCountry);

  const onOpenChange = React.useCallback(
    (newOpen: boolean) => {
      store.setState("open", newOpen);
    },
    [store],
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange} {...popoverProps}>
      <PopoverTrigger
        data-slot="phone-input-country-select"
        disabled={isDisabled}
        className={cn(
          "flex h-full shrink-0 items-center gap-2 rounded-l-md border-input border-r bg-transparent px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className,
        )}
      >
        {isLoading ? (
          <div className="h-4 w-10 animate-pulse rounded bg-muted" />
        ) : (
          <>
            {context.showFlag && country?.flag && (
              <span className="text-lg leading-none">{country.flag}</span>
            )}
            {context.showDialCode && country?.dialCode && (
              <span className="font-medium">{country.dialCode}</span>
            )}
          </>
        )}
        <ChevronDown className="size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {context.countries.map((countryItem) => (
                <CommandItem
                  key={countryItem.code}
                  value={`${countryItem.name} ${countryItem.dialCode} ${countryItem.code}`}
                  onSelect={() => {
                    store.setState("country", countryItem.code);
                    store.setState("open", false);
                    requestAnimationFrame(() => {
                      context.inputRef.current?.focus();
                    });
                  }}
                >
                  {context.showFlag && countryItem.flag && (
                    <span className="text-lg">{countryItem.flag}</span>
                  )}
                  <span className="flex-1">{countryItem.name}</span>
                  <span className="text-muted-foreground">
                    {countryItem.dialCode}
                  </span>
                  <Check
                    className={cn(
                      "size-4",
                      selectedCountry === countryItem.code
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PhoneInputField(props: React.ComponentProps<"input">) {
  const {
    onChange: onChangeProp,
    className,
    disabled,
    readOnly,
    required,
    ref,
    ...inputProps
  } = props;

  const context = usePhoneInputContext(FIELD_NAME);
  const store = useStoreContext(FIELD_NAME);
  const value = useStore((state) => state.value);

  const composedRef = useComposedRefs(ref, context.inputRef);

  const onChangeRef = useAsRef(onChangeProp);

  const isDisabled = disabled || context.disabled;
  const isReadOnly = readOnly || context.readOnly;
  const isRequired = required || context.required;

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled || isReadOnly) return;

      onChangeRef.current?.(event);
      if (event.defaultPrevented) return;

      const sanitized = event.target.value.replace(/[^\d\s()-]/g, "");
      store.setState("value", sanitized);
    },
    [store, onChangeRef, isDisabled, isReadOnly],
  );

  return (
    <Input
      type="tel"
      inputMode="tel"
      aria-required={isRequired}
      aria-invalid={context.invalid}
      data-slot="phone-input-field"
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      {...inputProps}
      ref={composedRef}
      placeholder={context.placeholder}
      value={value}
      onChange={onChange}
      className={cn(
        "h-full flex-1 rounded-r-md rounded-l-none border-0 bg-transparent shadow-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-transparent aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:bg-transparent dark:aria-invalid:ring-destructive/40 dark:disabled:bg-transparent",
        className,
      )}
    />
  );
}

export {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
  DEFAULT_COUNTRIES,
  //
  useStore as usePhoneInput,
  //
  type PhoneInputProps,
};
