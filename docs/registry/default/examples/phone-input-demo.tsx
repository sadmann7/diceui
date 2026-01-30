import * as React from "react";
import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
} from "@/registry/default/ui/phone-input";

export default function PhoneInputDemo() {
  return (
    <PhoneInput defaultValue="5551234" showFlag={true}>
      <PhoneInputCountrySelect />
      <PhoneInputField />
    </PhoneInput>
  );
}
