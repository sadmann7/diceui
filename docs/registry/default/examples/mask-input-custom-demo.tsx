"use client";

import * as React from "react";
import {
  MaskInput,
  MaskInputDescription,
  MaskInputField,
  MaskInputLabel,
  type MaskPattern,
} from "@/registry/default/ui/mask-input";

export default function MaskInputCustomDemo() {
  const [licenseValue, setLicenseValue] = React.useState("");
  const [productCodeValue, setProductCodeValue] = React.useState("");

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

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <MaskInput>
        <MaskInputLabel>License Plate</MaskInputLabel>
        <MaskInputField
          customPattern={licensePattern}
          value={licenseValue}
          onChange={(maskedValue) => {
            setLicenseValue(maskedValue);
          }}
          placeholder="ABC-1234"
        />
        <MaskInputDescription>
          Enter license plate (3 letters, 4 numbers)
        </MaskInputDescription>
      </MaskInput>

      <MaskInput>
        <MaskInputLabel>Product Code</MaskInputLabel>
        <MaskInputField
          customPattern={productCodePattern}
          value={productCodeValue}
          onChange={(maskedValue) => {
            setProductCodeValue(maskedValue);
          }}
          placeholder="PRD-ABC-123"
        />
        <MaskInputDescription>
          Enter product code (PRD-XXX-XXX format)
        </MaskInputDescription>
      </MaskInput>
    </div>
  );
}
