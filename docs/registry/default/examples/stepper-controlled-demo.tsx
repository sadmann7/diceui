"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
    value: "personal",
    title: "Personal Info",
    description: "Enter your personal details",
  },
  {
    value: "preferences",
    title: "Preferences",
    description: "Set your account preferences",
  },
  {
    value: "confirmation",
    title: "Confirmation",
    description: "Review and confirm your settings",
  },
];

export default function StepperControlledDemo() {
  const [currentStep, setCurrentStep] = React.useState("personal");

  const currentIndex = React.useMemo(
    () => steps.findIndex((step) => step.value === currentStep),
    [currentStep],
  );

  const nextStep = React.useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextIndex]?.value ?? "");
  }, [currentIndex]);

  const prevStep = React.useCallback(() => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentStep(steps[prevIndex]?.value ?? "");
  }, [currentIndex]);

  const goToStep = React.useCallback((stepValue: string) => {
    setCurrentStep(stepValue);
  }, []);

  return (
    <Stepper value={currentStep} onValueChange={goToStep}>
      <StepperList>
        {steps.map((step, index) => (
          <StepperItem
            key={step.value}
            value={step.value}
            className="not-last:w-full gap-4"
          >
            <StepperTrigger>
              <StepperIndicator>{index + 1}</StepperIndicator>
              <div className="flex flex-col gap-1">
                <StepperTitle>{step.title}</StepperTitle>
                <StepperDescription>{step.description}</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator className="mx-4" />
          </StepperItem>
        ))}
      </StepperList>
      {steps.map((step) => (
        <StepperContent
          key={step.value}
          value={step.value}
          className="flex flex-col gap-4 rounded-md border bg-card p-4 text-card-foreground"
        >
          <div className="flex flex-col gap-px">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
          <p className="text-sm">
            This is the content for {step.title}. You can add forms,
            information, or any other content here.
          </p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <div className="text-muted-foreground text-sm">
              Step {currentIndex + 1} of {steps.length}
            </div>
            <Button
              onClick={nextStep}
              disabled={currentIndex === steps.length - 1}
            >
              {currentIndex === steps.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </StepperContent>
      ))}
    </Stepper>
  );
}
