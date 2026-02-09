"use client";

import * as React from "react";
import {
  SegmentedInput,
  SegmentedInputItem,
} from "@/registry/bases/radix/ui/segmented-input";

export default function SegmentedInputVerticalDemo() {
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
        <SegmentedInput
          aria-label="Mailing address input"
          className="w-full max-w-sm"
          orientation="vertical"
        >
          <SegmentedInputItem
            aria-label="Street address"
            placeholder="Street Address"
            value={address.street}
            onChange={onFieldChange("street")}
          />
          <SegmentedInputItem
            aria-label="City"
            placeholder="City"
            value={address.city}
            onChange={onFieldChange("city")}
          />
          <SegmentedInputItem
            aria-label="ZIP code"
            placeholder="ZIP Code"
            value={address.zipCode}
            onChange={onFieldChange("zipCode")}
          />
        </SegmentedInput>
      </div>
      <p className="text-muted-foreground text-sm">
        Use arrow keys (up/down) to navigate between fields in vertical
        orientation.
      </p>
    </div>
  );
}
