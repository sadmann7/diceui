"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/default/ui/mask-input";

export default function MaskInputValidationModesDemo() {
  const [validationStates, setValidationStates] = React.useState({
    onChange: { isValid: true, message: "" },
    onBlur: { isValid: true, message: "" },
    onTouched: { isValid: true, message: "" },
    onSubmit: { isValid: true, message: "" },
    all: { isValid: true, message: "" },
  });

  const [values, setValues] = React.useState({
    onChange: "",
    onBlur: "",
    onTouched: "",
    onSubmit: "",
    all: "",
  });

  const handleValidation =
    (mode: keyof typeof validationStates) =>
    (isValid: boolean, unmaskedValue: string) => {
      const message = isValid
        ? `✓ Valid phone number (${unmaskedValue.length}/10 digits)`
        : `✗ Invalid phone number (${unmaskedValue.length}/10 digits)`;

      setValidationStates((prev) => ({
        ...prev,
        [mode]: { isValid, message },
      }));
    };

  const handleValueChange =
    (mode: keyof typeof values) =>
    (_maskedValue: string, unmaskedValue: string) => {
      setValues((prev) => ({
        ...prev,
        [mode]: unmaskedValue,
      }));
    };

  const modes = [
    {
      key: "onChange" as const,
      title: "onChange (Default)",
      description: "Validates on every keystroke - immediate feedback",
      validationMode: "onChange" as const,
    },
    {
      key: "onBlur" as const,
      title: "onBlur",
      description: "Validates only when field loses focus - less intrusive",
      validationMode: "onBlur" as const,
    },
    {
      key: "onTouched" as const,
      title: "onTouched",
      description:
        "Validates on first blur, then on every change - balanced approach",
      validationMode: "onTouched" as const,
    },
    {
      key: "onSubmit" as const,
      title: "onSubmit",
      description:
        "No automatic validation - only validates on form submission",
      validationMode: "onSubmit" as const,
    },
    {
      key: "all" as const,
      title: "all",
      description:
        "Validates on both change and blur events - maximum feedback",
      validationMode: "all" as const,
    },
  ];

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-lg">Validation Mode Comparison</h3>
        <p className="text-muted-foreground text-sm">
          Try typing in each field to see how different validation modes behave
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode) => (
          <Card key={mode.key} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">
                {mode.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {mode.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`phone-${mode.key}`} className="text-xs">
                  Phone Number
                </Label>
                <MaskInput
                  id={`phone-${mode.key}`}
                  mask="phone"
                  validationMode={mode.validationMode}
                  value={values[mode.key]}
                  onValueChange={handleValueChange(mode.key)}
                  onValidate={handleValidation(mode.key)}
                  placeholder="(555) 123-4567"
                  invalid={!validationStates[mode.key].isValid}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      validationStates[mode.key].isValid
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {validationStates[mode.key].isValid ? "Valid" : "Invalid"}
                  </Badge>
                </div>
                <p className="min-h-[2.5rem] text-muted-foreground text-xs leading-tight">
                  {validationStates[mode.key].message ||
                    "Start typing to see validation..."}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-muted/50 p-4">
        <h4 className="mb-2 font-medium text-sm">Usage Examples</h4>
        <div className="space-y-2 text-muted-foreground text-xs">
          <div>
            <strong>onChange:</strong> Best for real-time validation, form
            builders
          </div>
          <div>
            <strong>onBlur:</strong> Good for less intrusive UX, optional fields
          </div>
          <div>
            <strong>onTouched:</strong> Balanced approach, similar to
            react-hook-form default
          </div>
          <div>
            <strong>onSubmit:</strong> Minimal validation, validate only when
            needed
          </div>
          <div>
            <strong>all:</strong> Maximum validation coverage, critical fields
          </div>
        </div>
      </div>
    </div>
  );
}
