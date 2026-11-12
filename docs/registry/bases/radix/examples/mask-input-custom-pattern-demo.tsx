"use client";

import * as React from "react";

import { Label } from "@/registry/bases/radix/ui/label";
import {
  MaskInput,
  type MaskPattern,
} from "@/registry/bases/radix/ui/mask-input";

const licensePattern: MaskPattern = {
  pattern: "###-####",
  transform: (value) => value.replace(/[^A-Z0-9]/gi, "").toUpperCase(),
  validate: (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return cleaned.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(cleaned);
  },
};

const productCodePattern: MaskPattern = {
  pattern: "###-###-###",
  transform: (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();

    if (cleaned.length === 0) {
      return "";
    }

    if (!cleaned.startsWith("PRD")) {
      if (cleaned.length <= 2 && "PRD".startsWith(cleaned)) {
        return cleaned;
      }
      return `PRD${cleaned}`;
    }

    return cleaned;
  },
  validate: (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return cleaned.length === 9 && cleaned.startsWith("PRD");
  },
};

export default function MaskInputCustomPatternDemo() {
  const [licenseValue, setLicenseValue] = React.useState("");
  const [productCodeValue, setProductCodeValue] = React.useState("");
  const [isLicenseValid, setIsLicenseValid] = React.useState(true);
  const [isProductCodeValid, setIsProductCodeValid] = React.useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="license">License plate</Label>
        <MaskInput
          id="license"
          mask={licensePattern}
          value={licenseValue}
          onValueChange={setLicenseValue}
          placeholder="Enter license plate"
          maskPlaceholder="ABC-1234"
          invalid={!isLicenseValid}
          onValidate={setIsLicenseValid}
        />
        <p className="text-sm text-muted-foreground">
          Enter license plate (3 letters, 4 numbers)
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="product">Product code</Label>
        <MaskInput
          id="product"
          mask={productCodePattern}
          value={productCodeValue}
          onValueChange={setProductCodeValue}
          placeholder="Enter product code"
          maskPlaceholder="PRD-ABC-123"
          invalid={!isProductCodeValid}
          onValidate={setIsProductCodeValid}
        />
        <p className="text-sm text-muted-foreground">
          Enter product code (PRD-XXX-XXX format)
        </p>
      </div>
    </div>
  );
}
