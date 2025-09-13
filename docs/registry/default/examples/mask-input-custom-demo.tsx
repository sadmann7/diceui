"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { MaskInput, type MaskPattern } from "@/registry/default/ui/mask-input";

// Custom license plate pattern (e.g., ABC-1234)
const licensePattern: MaskPattern = {
  pattern: "###-####",
  placeholder: "ABC-1234",
  transform: (value) => value.replace(/[^A-Z0-9]/gi, "").toUpperCase(),
  validate: (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "");
    return cleaned.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(cleaned);
  },
};

// Custom product code pattern (e.g., PRD-ABC-123)
const productCodePattern: MaskPattern = {
  pattern: "PRD-###-###",
  placeholder: "PRD-ABC-123",
  transform: (value) => value.replace(/[^A-Z0-9]/gi, "").toUpperCase(),
  validate: (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "");
    return cleaned.length === 9;
  },
};

export default function MaskInputCustomDemo() {
  const [licenseValue, setLicenseValue] = React.useState("");
  const [productCodeValue, setProductCodeValue] = React.useState("");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="license">License Plate</Label>
        <MaskInput
          id="license"
          mask={licensePattern}
          value={licenseValue}
          onValueChange={setLicenseValue}
          placeholder="ABC-1234"
        />
        <p className="text-muted-foreground text-sm">
          Enter license plate (3 letters, 4 numbers)
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product">Product Code</Label>
        <MaskInput
          id="product"
          mask={productCodePattern}
          value={productCodeValue}
          onValueChange={setProductCodeValue}
          placeholder="PRD-ABC-123"
        />
        <p className="text-muted-foreground text-sm">
          Enter product code (PRD-XXX-XXX format)
        </p>
      </div>
    </div>
  );
}
