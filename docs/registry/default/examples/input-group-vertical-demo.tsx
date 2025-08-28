"use client";

import * as React from "react";
import * as InputGroup from "@/registry/default/ui/input-group";

export default function InputGroupVerticalDemo() {
  const [address, setAddress] = React.useState({
    street: "",
    city: "",
    zipCode: "",
  });

  const onFieldChange =
    (field: keyof typeof address) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddress((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm leading-none">
          Mailing Address
        </label>
        <InputGroup.Root
          className="w-full max-w-sm"
          orientation="vertical"
          aria-label="Mailing address input"
        >
          <InputGroup.Item
            position="first"
            placeholder="Street Address"
            value={address.street}
            onChange={onFieldChange("street")}
            aria-label="Street address"
          />
          <InputGroup.Item
            position="middle"
            placeholder="City"
            value={address.city}
            onChange={onFieldChange("city")}
            aria-label="City"
          />
          <InputGroup.Item
            position="last"
            placeholder="ZIP Code"
            value={address.zipCode}
            onChange={onFieldChange("zipCode")}
            aria-label="ZIP code"
          />
        </InputGroup.Root>
      </div>
      <p className="text-muted-foreground text-sm">
        Use arrow keys (up/down) to navigate between fields in vertical
        orientation.
      </p>
    </div>
  );
}
