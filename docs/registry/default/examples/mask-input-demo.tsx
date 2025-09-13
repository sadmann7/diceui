"use client";

import * as React from "react";
import {
  MaskInput,
  MaskInputDescription,
  MaskInputError,
  MaskInputField,
  MaskInputLabel,
} from "@/registry/default/ui/mask-input";

export default function MaskInputDemo() {
  const [phoneValue, setPhoneValue] = React.useState("");
  const [dateValue, setDateValue] = React.useState("");
  const [isValid, setIsValid] = React.useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <MaskInput>
        <MaskInputLabel>Phone Number</MaskInputLabel>
        <MaskInputField
          mask="phone"
          value={phoneValue}
          onChange={(maskedValue) => {
            setPhoneValue(maskedValue);
          }}
          placeholder="Enter your phone number"
        />
        <MaskInputDescription>
          Enter your phone number with area code
        </MaskInputDescription>
      </MaskInput>
      <MaskInput invalid={!isValid}>
        <MaskInputLabel>Birth Date</MaskInputLabel>
        <MaskInputField
          mask="date"
          value={dateValue}
          onChange={(maskedValue) => {
            setDateValue(maskedValue);
          }}
          onValidation={(valid) => {
            setIsValid(valid);
          }}
          placeholder="mm/dd/yyyy"
        />
        <MaskInputDescription>Enter your birth date</MaskInputDescription>
        <MaskInputError>Please enter a valid date</MaskInputError>
      </MaskInput>
    </div>
  );
}
