"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/bases/radix/ui/mask-input";

interface Input {
  phone: string;
  date: string;
  dollar: string;
  euro: string;
  creditCard: string;
  percentage: string;
}

export default function MaskInputDemo() {
  const id = React.useId();
  const [input, setInput] = React.useState<Input>({
    phone: "",
    date: "",
    dollar: "",
    euro: "",
    creditCard: "",
    percentage: "",
  });

  const onValueChange = React.useCallback(
    (field: keyof Input) => (maskedValue: string) => {
      setInput((prev) => ({
        ...prev,
        [field]: maskedValue,
      }));
    },
    [],
  );

  return (
    <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-phone`}>Phone number</Label>
        <MaskInput
          id={`${id}-phone`}
          mask="phone"
          placeholder="Enter your phone number"
          value={input.phone}
          onValueChange={onValueChange("phone")}
        />
        <p className="text-muted-foreground text-sm">
          Enter your phone number with area code
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-date`}>Birth date</Label>
        <MaskInput
          id={`${id}-date`}
          mask="date"
          placeholder="Enter your birth date"
          value={input.date}
          onValueChange={onValueChange("date")}
        />
        <p className="text-muted-foreground text-sm">Enter your birth date</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-dollar`}>Currency</Label>
        <MaskInput
          id={`${id}-dollar`}
          mask="currency"
          placeholder="$0.00"
          value={input.dollar}
          onValueChange={onValueChange("dollar")}
        />
        <p className="text-muted-foreground text-sm">Enter your currency</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-euro`}>Currency (German)</Label>
        <MaskInput
          id={`${id}-euro`}
          mask="currency"
          currency="EUR"
          locale="de-DE"
          placeholder="0,00 €"
          value={input.euro}
          onValueChange={onValueChange("euro")}
        />
        <p className="text-muted-foreground text-sm">Enter your currency</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-creditCard`}>Credit card</Label>
        <MaskInput
          id={`${id}-creditCard`}
          mask="creditCard"
          placeholder="Enter your credit card number"
          value={input.creditCard}
          onValueChange={onValueChange("creditCard")}
        />
        <p className="text-muted-foreground text-sm">
          Enter your credit card number
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-percentage`}>Percentage</Label>
        <MaskInput
          id={`${id}-percentage`}
          mask="percentage"
          placeholder="0.00%"
          min={0}
          max={100}
          value={input.percentage}
          onValueChange={onValueChange("percentage")}
        />
        <p className="text-muted-foreground text-sm">Enter a percentage</p>
      </div>
    </div>
  );
}
