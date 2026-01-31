import type { Popover, PopoverTrigger } from "@/components/ui/popover";
import type { CompositionProps, EmptyProps } from "@/types";

export interface Country {
  /**
   * ISO 3166-1 alpha-2 country code
   */
  code: string;
  /**
   * Country name
   */
  name: string;
  /**
   * Country calling code (e.g., "+1" for US)
   */
  dialCode: string;
  /**
   * Optional flag emoji
   */
  flag?: string;
}

export interface PhoneInputProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique identifier for the phone input component.
   * @default React.useId()
   */
  id?: string;

  /**
   * The default value for uncontrolled usage.
   * @default ""
   */
  defaultValue?: string;

  /**
   * The controlled value of the phone input.
   */
  value?: string;

  /**
   * Callback fired when the value changes.
   */
  onValueChange?: (value: string) => void;

  /**
   * The default country code for uncontrolled usage.
   * @default "US"
   */
  defaultCountry?: string;

  /**
   * The controlled country code.
   */
  country?: string;

  /**
   * Callback fired when the country changes.
   */
  onCountryChange?: (country: string) => void;

  /**
   * The list of countries to display.
   * @default A predefined list of common countries
   */
  countries?: Country[];

  /**
   * The name of the phone input for form submission.
   */
  name?: string;

  /**
   * Placeholder text shown when value is empty.
   * @default "Enter phone number"
   */
  placeholder?: string;

  /**
   * Whether the phone input is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the phone input is read-only.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether the phone input is required.
   * @default false
   */
  required?: boolean;

  /**
   * Whether the phone input is in an invalid state.
   * @default false
   */
  invalid?: boolean;

  /**
   * Whether to show the country flag.
   * @default true
   */
  showFlag?: boolean;
}

export interface PhoneInputCountrySelectProps
  extends React.ComponentProps<typeof Popover>,
    Pick<React.ComponentProps<typeof PopoverTrigger>, "disabled" | "className">,
    CompositionProps {}

export interface PhoneInputFieldProps extends EmptyProps<"input"> {}
