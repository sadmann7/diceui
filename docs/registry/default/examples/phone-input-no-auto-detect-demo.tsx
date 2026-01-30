import * as React from "react";
import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
} from "@/registry/default/ui/phone-input";

export default function PhoneInputNoAutoDetectDemo() {
  return (
    <PhoneInput autoDetect={false}>
      <PhoneInputCountrySelect />
      <PhoneInputField placeholder="Select country first" />
    </PhoneInput>
  );
}
