import * as React from "react";
import type { Country } from "@/registry/default/ui/phone-input";
import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
  PhoneInputLabel,
} from "@/registry/default/ui/phone-input";

const NORTH_AMERICAN_COUNTRIES: Country[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
];

export default function PhoneInputCustomCountriesDemo() {
  return (
    <PhoneInput
      defaultValue="5551234"
      defaultCountry="US"
      countries={NORTH_AMERICAN_COUNTRIES}
    >
      <PhoneInputLabel>Phone Number (North America only)</PhoneInputLabel>
      <div className="flex">
        <PhoneInputCountrySelect />
        <PhoneInputField />
      </div>
    </PhoneInput>
  );
}
