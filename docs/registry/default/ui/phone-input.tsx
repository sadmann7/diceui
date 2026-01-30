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

/**
 * @see https://github.com/mukeshsoni/country-telephone-data/blob/master/country_telephone_data.js
 * @format [iso2, dialCode]
 */
const COUNTRY_DATA: [string, string][] = [
  ["af", "93"],
  ["ax", "358"],
  ["al", "355"],
  ["dz", "213"],
  ["as", "1684"],
  ["ad", "376"],
  ["ao", "244"],
  ["ai", "1264"],
  ["ag", "1268"],
  ["ar", "54"],
  ["am", "374"],
  ["aw", "297"],
  ["au", "61"],
  ["at", "43"],
  ["az", "994"],
  ["bs", "1242"],
  ["bh", "973"],
  ["bd", "880"],
  ["bb", "1246"],
  ["by", "375"],
  ["be", "32"],
  ["bz", "501"],
  ["bj", "229"],
  ["bm", "1441"],
  ["bt", "975"],
  ["bo", "591"],
  ["ba", "387"],
  ["bw", "267"],
  ["br", "55"],
  ["io", "246"],
  ["vg", "1284"],
  ["bn", "673"],
  ["bg", "359"],
  ["bf", "226"],
  ["bi", "257"],
  ["kh", "855"],
  ["cm", "237"],
  ["ca", "1"],
  ["cv", "238"],
  ["bq", "599"],
  ["ky", "1345"],
  ["cf", "236"],
  ["td", "235"],
  ["cl", "56"],
  ["cn", "86"],
  ["co", "57"],
  ["km", "269"],
  ["cd", "243"],
  ["cg", "242"],
  ["ck", "682"],
  ["cr", "506"],
  ["ci", "225"],
  ["hr", "385"],
  ["cu", "53"],
  ["cw", "599"],
  ["cy", "357"],
  ["cz", "420"],
  ["dk", "45"],
  ["dj", "253"],
  ["dm", "1767"],
  ["do", "1"],
  ["ec", "593"],
  ["eg", "20"],
  ["sv", "503"],
  ["gq", "240"],
  ["er", "291"],
  ["ee", "372"],
  ["et", "251"],
  ["fk", "500"],
  ["fo", "298"],
  ["fj", "679"],
  ["fi", "358"],
  ["fr", "33"],
  ["gf", "594"],
  ["pf", "689"],
  ["ga", "241"],
  ["gm", "220"],
  ["ge", "995"],
  ["de", "49"],
  ["gh", "233"],
  ["gi", "350"],
  ["gr", "30"],
  ["gl", "299"],
  ["gd", "1473"],
  ["gp", "590"],
  ["gu", "1671"],
  ["gt", "502"],
  ["gg", "44"],
  ["gn", "224"],
  ["gw", "245"],
  ["gy", "592"],
  ["ht", "509"],
  ["hn", "504"],
  ["hk", "852"],
  ["hu", "36"],
  ["is", "354"],
  ["in", "91"],
  ["id", "62"],
  ["ir", "98"],
  ["iq", "964"],
  ["ie", "353"],
  ["im", "44"],
  ["il", "972"],
  ["it", "39"],
  ["jm", "1876"],
  ["jp", "81"],
  ["je", "44"],
  ["jo", "962"],
  ["kz", "7"],
  ["ke", "254"],
  ["ki", "686"],
  ["xk", "383"],
  ["kw", "965"],
  ["kg", "996"],
  ["la", "856"],
  ["lv", "371"],
  ["lb", "961"],
  ["ls", "266"],
  ["lr", "231"],
  ["ly", "218"],
  ["li", "423"],
  ["lt", "370"],
  ["lu", "352"],
  ["mo", "853"],
  ["mk", "389"],
  ["mg", "261"],
  ["mw", "265"],
  ["my", "60"],
  ["mv", "960"],
  ["ml", "223"],
  ["mt", "356"],
  ["mh", "692"],
  ["mq", "596"],
  ["mr", "222"],
  ["mu", "230"],
  ["mx", "52"],
  ["fm", "691"],
  ["md", "373"],
  ["mc", "377"],
  ["mn", "976"],
  ["me", "382"],
  ["ms", "1664"],
  ["ma", "212"],
  ["mz", "258"],
  ["mm", "95"],
  ["na", "264"],
  ["nr", "674"],
  ["np", "977"],
  ["nl", "31"],
  ["nc", "687"],
  ["nz", "64"],
  ["ni", "505"],
  ["ne", "227"],
  ["ng", "234"],
  ["nu", "683"],
  ["nf", "672"],
  ["kp", "850"],
  ["mp", "1670"],
  ["no", "47"],
  ["om", "968"],
  ["pk", "92"],
  ["pw", "680"],
  ["ps", "970"],
  ["pa", "507"],
  ["pg", "675"],
  ["py", "595"],
  ["pe", "51"],
  ["ph", "63"],
  ["pl", "48"],
  ["pt", "351"],
  ["pr", "1"],
  ["qa", "974"],
  ["re", "262"],
  ["ro", "40"],
  ["ru", "7"],
  ["rw", "250"],
  ["bl", "590"],
  ["sh", "290"],
  ["kn", "1869"],
  ["lc", "1758"],
  ["mf", "590"],
  ["pm", "508"],
  ["vc", "1784"],
  ["ws", "685"],
  ["sm", "378"],
  ["st", "239"],
  ["sa", "966"],
  ["sn", "221"],
  ["rs", "381"],
  ["sc", "248"],
  ["sl", "232"],
  ["sg", "65"],
  ["sx", "1721"],
  ["sk", "421"],
  ["si", "386"],
  ["sb", "677"],
  ["so", "252"],
  ["za", "27"],
  ["kr", "82"],
  ["ss", "211"],
  ["es", "34"],
  ["lk", "94"],
  ["sd", "249"],
  ["sr", "597"],
  ["sz", "268"],
  ["se", "46"],
  ["ch", "41"],
  ["sy", "963"],
  ["tw", "886"],
  ["tj", "992"],
  ["tz", "255"],
  ["th", "66"],
  ["tl", "670"],
  ["tg", "228"],
  ["tk", "690"],
  ["to", "676"],
  ["tt", "1868"],
  ["tn", "216"],
  ["tr", "90"],
  ["tm", "993"],
  ["tc", "1649"],
  ["tv", "688"],
  ["vi", "1340"],
  ["ug", "256"],
  ["ua", "380"],
  ["ae", "971"],
  ["gb", "44"],
  ["us", "1"],
  ["uy", "598"],
  ["uz", "998"],
  ["vu", "678"],
  ["va", "39"],
  ["ve", "58"],
  ["vn", "84"],
  ["wf", "681"],
  ["eh", "212"],
  ["ye", "967"],
  ["zm", "260"],
  ["zw", "263"],
];

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag?: string;
}

function getCountryName(countryCode: string, locale = "en"): string {
  try {
    const regionNames = new Intl.DisplayNames([locale], { type: "region" });
    return regionNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getCountries(): Country[] {
  return COUNTRY_DATA.map(([iso2, dialCode]): Country => {
    const code = iso2.toUpperCase();
    return {
      code,
      name: getCountryName(code),
      dialCode: `+${dialCode}`,
      flag: getFlagEmoji(code),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function getCountryFromLocale(
  countries: Country[],
  locale?: string,
): string | undefined {
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
    defaultValue,
    defaultCountry,
    country: countryProp,
    onValueChange,
    onCountryChange,
    countries = getCountries(),
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
    showDialCode = false,
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
    const initialCountry = countryProp ?? defaultCountry;
    const shouldAutoDetect = autoDetect && !initialCountry;

    return {
      value: valueProp ?? defaultValue ?? "",
      country: initialCountry ?? "",
      isLoading: shouldAutoDetect,
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
  const isLoading = useStore((state) => state.isLoading, store);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount to detect locale, not on every state change
  React.useEffect(() => {
    if (!isLoading) return;

    const detectedCountry =
      getCountryFromLocale(countries, locale) || countries[0]?.code;

    if (detectedCountry) {
      store.setState("country", detectedCountry);
    }
    store.setState("isLoading", false);
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
            "relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background transition-colors has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:ring-[3px] has-[[data-slot][aria-invalid=true]]:ring-destructive/20 data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:bg-input/30 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
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
  const {
    disabled: disabledProp,
    className,
    children,
    onOpenChange: onOpenChangeProp,
    ...popoverProps
  } = props;

  const { countries, inputRef, disabled, showDialCode, showFlag } =
    usePhoneInputContext(COUNTRY_SELECT_NAME);
  const store = useStoreContext(COUNTRY_SELECT_NAME);
  const country = useStore((state) => state.country);
  const isLoading = useStore((state) => state.isLoading);
  const open = useStore((state) => state.open);

  const isDisabled = disabledProp || disabled;

  const countryContext = countries.find((c) => c.code === country);

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      store.setState("open", open);
      onOpenChangeProp?.(open);
    },
    [store, onOpenChangeProp],
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
        {isLoading || !countryContext ? (
          <div
            className={cn(
              "h-4 rounded",
              isLoading ? "animate-pulse bg-muted" : "bg-muted/50",
              showFlag && showDialCode
                ? "w-17"
                : showDialCode
                  ? "w-10"
                  : showFlag
                    ? "w-4.5"
                    : "w-8",
            )}
          />
        ) : (
          <>
            {showFlag && countryContext.flag && (
              <span className="text-lg leading-none">
                {countryContext.flag}
              </span>
            )}
            {showDialCode && countryContext.dialCode && (
              <span className="font-medium">{countryContext.dialCode}</span>
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
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.dialCode} ${c.code}`}
                  onSelect={() => {
                    store.setState("country", c.code);
                    store.setState("open", false);
                    requestAnimationFrame(() => {
                      inputRef.current?.focus();
                    });
                  }}
                >
                  {showFlag && c.flag && (
                    <span className="text-lg">{c.flag}</span>
                  )}
                  <span className="flex-1">{c.name}</span>
                  <span className="text-muted-foreground">{c.dialCode}</span>
                  <Check
                    className={cn(
                      "size-4",
                      country === c.code ? "opacity-100" : "opacity-0",
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
    disabled: disabledProp,
    readOnly: readOnlyProp,
    required: requiredProp,
    ref,
    ...inputProps
  } = props;

  const { inputRef, disabled, invalid, readOnly, required, placeholder } =
    usePhoneInputContext(FIELD_NAME);
  const store = useStoreContext(FIELD_NAME);
  const value = useStore((state) => state.value);

  const composedRef = useComposedRefs(ref, inputRef);

  const onChangeRef = useAsRef(onChangeProp);

  const isDisabled = disabledProp || disabled;
  const isReadOnly = readOnlyProp || readOnly;
  const isRequired = requiredProp || required;

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
      aria-invalid={invalid}
      data-slot="phone-input-field"
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      {...inputProps}
      ref={composedRef}
      className={cn(
        "h-full flex-1 rounded-r-md rounded-l-none border-0 bg-transparent shadow-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-transparent aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:bg-transparent dark:aria-invalid:ring-destructive/40 dark:disabled:bg-transparent",
        className,
      )}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
  //
  useStore as usePhoneInput,
  //
  type PhoneInputProps,
};
