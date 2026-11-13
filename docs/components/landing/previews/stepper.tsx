"use client";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/registry/bases/base/ui/stepper";

const steps = [
  {
    value: "connect",
    title: "Connect your repo",
    description: "GitHub · diceui/docs",
  },
  { value: "base", title: "Pick a base", description: "Base UI · Radix" },
  {
    value: "ship",
    title: "Ship it",
    description: "Registry, docs, changelog",
  },
];

export default function StepperPreview() {
  return (
    <div className="flex flex-1 flex-col justify-center px-6">
      <Stepper defaultValue="base" orientation="vertical">
        <StepperList>
          {steps.map((step) => (
            <StepperItem key={step.value} value={step.value}>
              <StepperTrigger className="not-last:pb-6">
                <StepperIndicator />
                <div className="flex flex-col gap-1">
                  <StepperTitle>{step.title}</StepperTitle>
                  <StepperDescription>{step.description}</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator className="absolute inset-y-0 top-5 left-3.5 -z-10 -order-1 h-full -translate-x-1/2" />
            </StepperItem>
          ))}
        </StepperList>
      </Stepper>
    </div>
  );
}
