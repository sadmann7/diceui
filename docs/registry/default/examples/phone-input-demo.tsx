import * as React from "react";
import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
  PhoneInputLabel,
} from "@/registry/default/ui/phone-input";

export default function PhoneInputDemo() {
  return (
    <PhoneInput defaultValue="5551234" defaultCountry="US">
      <PhoneInputLabel>Phone Number</PhoneInputLabel>
      <div className="flex">
        <PhoneInputCountrySelect />
        <PhoneInputField />
      </div>
    </PhoneInput>
  );
}
