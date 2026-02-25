import type { PhoneInputProps } from "@/registry/bases/base/ui/phone-input";
import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
} from "@/registry/bases/base/ui/phone-input";

const NORTH_AMERICAN_COUNTRIES: PhoneInputProps["countries"] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
];

export default function PhoneInputCustomCountriesDemo() {
  return (
    <PhoneInput
      defaultValue="+14085551234"
      defaultCountry="US"
      countries={NORTH_AMERICAN_COUNTRIES}
    >
      <PhoneInputCountrySelect />
      <PhoneInputField placeholder="Type phone number" />
    </PhoneInput>
  );
}
