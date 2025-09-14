"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/default/ui/mask-input";

export default function MaskInputDemo() {
  const id = React.useId();
  const [phoneValue, setPhoneValue] = React.useState("");
  const [dateValue, setDateValue] = React.useState("");
  const [isValid, setIsValid] = React.useState(true);
  const [currencyValue, setCurrencyValue] = React.useState("");
  const [percentageValue, setPercentageValue] = React.useState("");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-phone`}>Phone Number</Label>
        <MaskInput
          id={`${id}-phone`}
          mask="phone"
          value={phoneValue}
          onValueChange={setPhoneValue}
          placeholder="Enter your phone number"
        />
        <p className="text-muted-foreground text-sm">
          Enter your phone number with area code
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-date`}>Birth Date</Label>
        <MaskInput
          id={`${id}-date`}
          mask="date"
          value={dateValue}
          onValueChange={setDateValue}
          onValidate={setIsValid}
          placeholder="mm/dd/yyyy"
        />
        <p className="text-muted-foreground text-sm">Enter your birth date</p>
        {!isValid && (
          <p className="font-medium text-destructive text-sm">
            Please enter a valid date
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-currency`}>Currency</Label>
        <MaskInput
          id={`${id}-currency`}
          mask="currency"
          value={currencyValue}
          onValueChange={setCurrencyValue}
          placeholder="$0.00"
        />
        <p className="text-muted-foreground text-sm">Enter your currency</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-percentage`}>Percentage</Label>
        <MaskInput
          id={`${id}-percentage`}
          mask="percentage"
          value={percentageValue}
          onValueChange={setPercentageValue}
          placeholder="0.00%"
        />
      </div>
    </div>
  );
}
