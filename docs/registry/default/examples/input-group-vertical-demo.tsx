"use client";

import * as React from "react";
import { InputGroup, InputGroupItem } from "@/registry/default/ui/input-group";

export default function InputGroupVerticalDemo() {
  const [address, setAddress] = React.useState({
    street: "",
    city: "",
    zipCode: "",
  });

  const onFieldChange = React.useCallback(
    (field: keyof typeof address) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddress((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm leading-none">
          Mailing Address
        </label>
        <InputGroup
          aria-label="Mailing address input"
          className="w-full max-w-sm"
          orientation="vertical"
          loop
        >
          <InputGroupItem
            aria-label="Street address"
            position="first"
            placeholder="Street Address"
            value={address.street}
            onChange={onFieldChange("street")}
          />
          <InputGroupItem
            aria-label="City"
            position="middle"
            placeholder="City"
            value={address.city}
            onChange={onFieldChange("city")}
          />
          <InputGroupItem
            aria-label="ZIP code"
            position="last"
            placeholder="ZIP Code"
            value={address.zipCode}
            onChange={onFieldChange("zipCode")}
          />
        </InputGroup>
      </div>
      <p className="text-muted-foreground text-sm">
        Use arrow keys (up/down) to navigate between fields in vertical
        orientation.
      </p>
    </div>
  );
}
