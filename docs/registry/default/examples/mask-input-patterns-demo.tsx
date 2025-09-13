"use client";

import * as React from "react";
import {
  MaskInput,
  MaskInputField,
  MaskInputLabel,
} from "@/registry/default/ui/mask-input";

export default function MaskInputPatternsDemo() {
  const [values, setValues] = React.useState({
    phone: "",
    ssn: "",
    date: "",
    time: "",
    creditCard: "",
    zipCode: "",
  });

  const handleValueChange =
    (field: keyof typeof values) => (maskedValue: string) => {
      setValues((prev) => ({
        ...prev,
        [field]: maskedValue,
      }));
    };

  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
      <MaskInput>
        <MaskInputLabel>Phone Number</MaskInputLabel>
        <MaskInputField
          mask="phone"
          value={values.phone}
          onChange={handleValueChange("phone")}
          placeholder="(555) 123-4567"
        />
      </MaskInput>

      <MaskInput>
        <MaskInputLabel>Social Security Number</MaskInputLabel>
        <MaskInputField
          mask="ssn"
          value={values.ssn}
          onChange={handleValueChange("ssn")}
          placeholder="123-45-6789"
        />
      </MaskInput>

      <MaskInput>
        <MaskInputLabel>Date</MaskInputLabel>
        <MaskInputField
          mask="date"
          value={values.date}
          onChange={handleValueChange("date")}
          placeholder="mm/dd/yyyy"
        />
      </MaskInput>

      <MaskInput>
        <MaskInputLabel>Time</MaskInputLabel>
        <MaskInputField
          mask="time"
          value={values.time}
          onChange={handleValueChange("time")}
          placeholder="hh:mm"
        />
      </MaskInput>

      <MaskInput>
        <MaskInputLabel>Credit Card</MaskInputLabel>
        <MaskInputField
          mask="creditCard"
          value={values.creditCard}
          onChange={handleValueChange("creditCard")}
          placeholder="1234 5678 9012 3456"
        />
      </MaskInput>

      <MaskInput>
        <MaskInputLabel>ZIP Code</MaskInputLabel>
        <MaskInputField
          mask="zipCode"
          value={values.zipCode}
          onChange={handleValueChange("zipCode")}
          placeholder="12345"
        />
      </MaskInput>
    </div>
  );
}
