import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperItemDescription,
  StepperItemIndicator,
  StepperItemSeparator,
  StepperItemTitle,
  StepperItemTrigger,
  StepperList,
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
          <StepperItem key={step.value} value={step.value}>
            <StepperItemTrigger value={step.value}>
              <StepperItemIndicator value={step.value}>
                {index + 1}
              </StepperItemIndicator>
            </StepperItemTrigger>
            <div className="mt-2 flex flex-col items-center gap-1">
              <StepperItemTitle>{step.title}</StepperItemTitle>
              <StepperItemDescription>
                {step.description}
              </StepperItemDescription>
            </div>
            {index < steps.length - 1 && (
              <StepperItemSeparator completed={index < currentIndex} />
            )}
          </StepperItem>
        ))}
      </StepperList>
      {steps.map((step) => (
        <StepperContent key={step.value} value={step.value}>
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 font-semibold text-lg">{step.title}</h3>
            <p className="mb-4 text-muted-foreground">{step.description}</p>
            <p className="mb-6 text-sm">
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
          </div>
        </StepperContent>
      ))}
    </Stepper>
  );
}
