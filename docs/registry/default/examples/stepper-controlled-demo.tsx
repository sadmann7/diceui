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

  const currentIndex = steps.findIndex((step) => step.value === currentStep);

  const nextStep = () => {
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextIndex]?.value ?? "");
  };

  const prevStep = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentStep(steps[prevIndex]?.value ?? "");
  };

  const goToStep = (stepValue: string) => {
    setCurrentStep(stepValue);
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Stepper value={currentStep} onValueChange={goToStep}>
        <StepperList>
          {steps.map((step, index) => (
            <StepperItem key={step.value} value={step.value}>
              <StepperTrigger value={step.value}>
                <StepperIndicator
                  value={step.value}
                  data-completed={index < currentIndex}
                >
                  {index + 1}
                </StepperIndicator>
              </StepperTrigger>
              <div className="mt-2 flex flex-col items-center gap-1">
                <StepperTitle>{step.title}</StepperTitle>
                <StepperDescription>{step.description}</StepperDescription>
              </div>
              {index < steps.length - 1 && (
                <StepperSeparator data-completed={index < currentIndex} />
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
    </div>
  );
}
