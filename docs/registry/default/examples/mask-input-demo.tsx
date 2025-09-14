"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/default/ui/mask-input";

export default function MaskInputDemo() {
  const id = React.useId();
  const [phoneValue, setPhoneValue] = React.useState("");
  const [dateValue, setDateValue] = React.useState("");
  const [currencyValue, setCurrencyValue] = React.useState("");
  const [percentageValue, setPercentageValue] = React.useState("");
  const [ipValue, setIpValue] = React.useState("");
  const [isDateValid, setIsDateValid] = React.useState(true);
  const [isIpValid, setIsIpValid] = React.useState(true);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-phone`}>Phone Number</Label>
        <MaskInput
          id={`${id}-phone`}
          mask="phone"
          placeholder="Enter your phone number"
          value={phoneValue}
          onValueChange={setPhoneValue}
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
          placeholder="mm/dd/yyyy"
          value={dateValue}
          onValueChange={setDateValue}
          onValidate={setIsDateValid}
          invalid={!isDateValid}
        />
        <p className="text-muted-foreground text-sm">Enter your birth date</p>
        {!isDateValid && (
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
          placeholder="$0.00"
          value={currencyValue}
          onValueChange={setCurrencyValue}
        />
        <p className="text-muted-foreground text-sm">Enter your currency</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-percentage`}>Percentage</Label>
        <MaskInput
          id={`${id}-percentage`}
          mask="percentage"
          placeholder="0.00%"
          value={percentageValue}
          onValueChange={setPercentageValue}
        />
        <p className="text-muted-foreground text-sm">Enter your percentage</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-ip`}>IP Address</Label>
        <MaskInput
          id={`${id}-ip`}
          mask="ipv4"
          placeholder="192.168.1.1"
          value={ipValue}
          onValueChange={setIpValue}
          onValidate={setIsIpValid}
          invalid={!isIpValid}
        />
        <p className="text-muted-foreground text-sm">Enter your IP address</p>
        {!isIpValid && (
          <p className="font-medium text-destructive text-sm">
            Please enter a valid IP address
          </p>
        )}
      </div>
    </div>
  );
}
