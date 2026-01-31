"use client";

import * as React from "react";
import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
} from "@/registry/default/ui/phone-input";

export default function PhoneInputDemo() {
  const [value, setValue] = React.useState("");

  return (
    <div className="max-w-md space-y-4">
      <PhoneInput value={value} onValueChange={setValue}>
        <PhoneInputCountrySelect />
        <PhoneInputField placeholder="12345667777" />
      </PhoneInput>

      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground">
          Value: <span className="font-mono">{value || "empty"}</span>
        </p>
        <p className="text-muted-foreground text-xs">
          Just start typing digits like "12345667777" and it formats to "+1 234
          566 7777"
        </p>
      </div>
    </div>
  );
}
