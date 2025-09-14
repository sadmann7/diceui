"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/default/ui/mask-input";

export default function MaskInputDemo() {
  const id = React.useId();
  const [phoneValue, setPhoneValue] = React.useState("");
  const [dateValue, setDateValue] = React.useState("");
  const [dollarValue, setDollarValue] = React.useState("");
  const [euroValue, setEuroValue] = React.useState("");
  const [creditCardValue, setCreditCardValue] = React.useState("");
  const [percentageValue, setPercentageValue] = React.useState("");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-phone`}>Phone Number</Label>
        <MaskInput
          id={`${id}-phone`}
          mask="phone"
          placeholder="Enter your phone number"
          value={phoneValue}
          onValueChange={(maskedValue, unmaskedValue) => {
            console.log({ maskedValue, unmaskedValue });
            setPhoneValue(unmaskedValue);
          }}
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
        />
        <p className="text-muted-foreground text-sm">Enter your birth date</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-dollar`}>Dollar</Label>
        <MaskInput
          id={`${id}-dollar`}
          mask="currency"
          placeholder="$0.00"
          value={dollarValue}
          onValueChange={setDollarValue}
        />
        <p className="text-muted-foreground text-sm">Enter your currency</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-euro`}>Euro (German)</Label>
        <MaskInput
          id={`${id}-euro`}
          mask="currency"
          currency="EUR"
          locale="de-DE"
          placeholder="0,00 €"
          value={euroValue}
          onValueChange={setEuroValue}
        />
        <p className="text-muted-foreground text-sm">Enter your currency</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-creditCard`}>Credit Card</Label>
        <MaskInput
          id={`${id}-creditCard`}
          mask="creditCard"
          placeholder="4242 4242 4242 4242"
          value={creditCardValue}
          onValueChange={setCreditCardValue}
        />
        <p className="text-muted-foreground text-sm">Enter your IPv4 address</p>
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
    </div>
  );
}
