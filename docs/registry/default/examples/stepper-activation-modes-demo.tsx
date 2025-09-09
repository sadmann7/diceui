"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/registry/default/ui/stepper";

const steps = [
  {
    value: "step1",
    title: "Step 1",
    description: "First step",
  },
  {
    value: "step2",
    title: "Step 2",
    description: "Second step",
  },
  {
    value: "step3",
    title: "Step 3",
    description: "Third step",
  },
];

export default function StepperActivationModesDemo() {
  const [isManualMode, setIsManualMode] = React.useState(false);
  const activationMode = isManualMode ? "manual" : "automatic";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Switch
          id="activation-mode"
          checked={isManualMode}
          onCheckedChange={setIsManualMode}
        />
        <Label htmlFor="activation-mode" className="font-medium text-sm">
          Manual activation mode
        </Label>
      </div>
      <div>
        <h3 className="mb-2 font-semibold text-lg">
          {isManualMode
            ? "Manual Activation"
            : "Automatic Activation (Default)"}
        </h3>
        <p className="mb-4 text-muted-foreground text-sm">
          {isManualMode
            ? "Arrow keys move focus, but you must press Enter or Space to activate the step."
            : "Arrow keys immediately activate the focused step. This is the default behavior."}
        </p>
        <Stepper
          key={activationMode}
          defaultValue="step1"
          activationMode={activationMode}
        >
          <StepperList>
            {steps.map((step, index) => (
              <StepperItem key={step.value} value={step.value}>
                <StepperTrigger>
                  <StepperIndicator>{index + 1}</StepperIndicator>
                </StepperTrigger>
                <div className="mt-2 flex flex-col items-center gap-1">
                  <StepperTitle>{step.title}</StepperTitle>
                  <StepperDescription>{step.description}</StepperDescription>
                </div>
                <StepperSeparator />
              </StepperItem>
            ))}
          </StepperList>
          {steps.map((step) => (
            <StepperContent key={step.value} value={step.value}>
              <div className="rounded-lg border p-6 text-center">
                <h4 className="mb-2 font-semibold">{step.title}</h4>
                <p className="text-muted-foreground text-sm">
                  Content for {step.title}.{" "}
                  {isManualMode
                    ? "Press Enter or Space to activate after navigating with arrows."
                    : "Arrow keys activate immediately."}
                </p>
              </div>
            </StepperContent>
          ))}
        </Stepper>
      </div>
    </div>
  );
}
