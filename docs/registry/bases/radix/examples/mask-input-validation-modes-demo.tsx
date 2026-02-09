"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/bases/radix/ui/mask-input";

const modes = [
  {
    label: "onChange",
    description: "Validates on every keystroke",
    value: "onChange" as const,
  },
  {
    label: "onBlur",
    description: "Validates when field loses focus",
    value: "onBlur" as const,
  },
  {
    label: "onTouched",
    description: "Validates after first blur, then on change",
    value: "onTouched" as const,
  },
  {
    label: "onSubmit",
    description: "Validates only on form submission",
    value: "onSubmit" as const,
  },
];

export default function MaskInputValidationModesDemo() {
  const [validationStates, setValidationStates] = React.useState({
    onChange: { isValid: true, message: "" },
    onBlur: { isValid: true, message: "" },
    onTouched: { isValid: true, message: "" },
    onSubmit: { isValid: true, message: "" },
  });

  const [values, setValues] = React.useState({
    onChange: "",
    onBlur: "",
    onTouched: "",
    onSubmit: "",
  });

  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const onValidate = React.useCallback(
    (mode: keyof typeof validationStates) =>
      (isValid: boolean, unmaskedValue: string) => {
        const message = isValid
          ? `✓ Valid (${unmaskedValue.length}/10)`
          : `✗ Invalid (${unmaskedValue.length}/10)`;

        setValidationStates((prev) => ({
          ...prev,
          [mode]: { isValid, message },
        }));
      },
    [],
  );

  const onValueChange = React.useCallback(
    (mode: keyof typeof values) =>
      (_maskedValue: string, unmaskedValue: string) => {
        setValues((prev) => ({
          ...prev,
          [mode]: unmaskedValue,
        }));
      },
    [],
  );

  const onSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setSubmitAttempted(true);

      const unmaskedValue = values.onSubmit;
      const isValid = unmaskedValue.length === 10;
      const message = isValid
        ? `✓ Valid (${unmaskedValue.length}/10)`
        : `✗ Invalid (${unmaskedValue.length}/10)`;

      setValidationStates((prev) => ({
        ...prev,
        onSubmit: { isValid, message },
      }));
    },
    [values.onSubmit],
  );

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {modes.map((mode) => (
        <ValidationModeCard
          key={mode.value}
          mode={mode}
          value={values[mode.value]}
          validationState={validationStates[mode.value]}
          onValueChange={onValueChange(mode.value)}
          onValidate={onValidate(mode.value)}
          onSubmit={mode.value === "onSubmit" ? onSubmit : undefined}
          submitAttempted={submitAttempted}
        />
      ))}
    </div>
  );
}

interface ValidationModeCardProps {
  mode: (typeof modes)[number];
  value: string;
  validationState: { isValid: boolean; message: string };
  onValueChange: (maskedValue: string, unmaskedValue: string) => void;
  onValidate: (isValid: boolean, unmaskedValue: string) => void;
  onSubmit?: (event: React.FormEvent) => void;
  submitAttempted: boolean;
}

function ValidationModeCard({
  mode,
  value,
  validationState,
  onValueChange,
  onValidate,
  onSubmit,
  submitAttempted,
}: ValidationModeCardProps) {
  const inputContent = (
    <div className="flex flex-col gap-1">
      <Label htmlFor={`phone-${mode.value}`} className="sr-only">
        Phone Number
      </Label>
      <MaskInput
        id={`phone-${mode.value}`}
        mask="phone"
        validationMode={mode.value}
        placeholder="Enter phone number"
        value={value}
        onValueChange={onValueChange}
        onValidate={onValidate}
        invalid={!validationState.isValid}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-1">
        <h4 className="font-medium text-xs">{mode.label}</h4>
        <p className="text-muted-foreground text-xs leading-tight">
          {mode.description}
        </p>
      </div>
      {onSubmit ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          {inputContent}
          <Button type="submit" size="sm" className="h-7 text-xs">
            Submit
          </Button>
        </form>
      ) : (
        inputContent
      )}
      <div className="flex items-center gap-1">
        <Badge
          variant={validationState.isValid ? "default" : "destructive"}
          className="h-5 px-1.5 text-xs"
        >
          {validationState.isValid ? "Valid" : "Invalid"}
        </Badge>
        <span className="text-muted-foreground text-xs">
          {validationState.message ||
            (mode.value === "onSubmit" && !submitAttempted
              ? "Click 'Submit' to check..."
              : "Start typing to see validation...")}
        </span>
      </div>
    </div>
  );
}
