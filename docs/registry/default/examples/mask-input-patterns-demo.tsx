"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/default/ui/mask-input";

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
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <MaskInput
          id="phone"
          mask="phone"
          value={values.phone}
          onValueChange={handleValueChange("phone")}
          placeholder="Enter phone number"
          maskPlaceholder="(___) ___-____"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ssn">Social Security Number</Label>
        <MaskInput
          id="ssn"
          mask="ssn"
          value={values.ssn}
          onValueChange={handleValueChange("ssn")}
          placeholder="Enter SSN"
          maskPlaceholder="___-__-____"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <MaskInput
          id="date"
          mask="date"
          value={values.date}
          onValueChange={handleValueChange("date")}
          placeholder="Enter date"
          maskPlaceholder="mm/dd/yyyy"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time</Label>
        <MaskInput
          id="time"
          mask="time"
          value={values.time}
          onValueChange={handleValueChange("time")}
          placeholder="Enter time"
          maskPlaceholder="hh:mm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="creditCard">Credit Card</Label>
        <MaskInput
          id="creditCard"
          mask="creditCard"
          value={values.creditCard}
          onValueChange={handleValueChange("creditCard")}
          placeholder="Enter credit card"
          maskPlaceholder="____ ____ ____ ____"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">ZIP Code</Label>
        <MaskInput
          id="zipCode"
          mask="zipCode"
          value={values.zipCode}
          onValueChange={handleValueChange("zipCode")}
          placeholder="Enter ZIP code"
          maskPlaceholder="_____"
        />
      </div>
    </div>
  );
}
