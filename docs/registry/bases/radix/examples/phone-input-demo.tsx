import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
} from "@/registry/bases/radix/ui/phone-input";

export default function PhoneInputDemo() {
  return (
    <PhoneInput>
      <PhoneInputCountrySelect />
      <PhoneInputField placeholder="12345667777" />
    </PhoneInput>
  );
}
