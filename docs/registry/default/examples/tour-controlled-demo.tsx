"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tour,
  TourBackdrop,
  TourClose,
  TourContent,
  TourDescription,
  TourFooter,
  TourHeader,
  TourNext,
  TourPrev,
  TourSkip,
  TourStep,
  TourStepCounter,
  TourTitle,
} from "@/registry/default/ui/tour";

export default function TourControlledDemo() {
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    console.log(`Step changed to: ${step + 1}`);
  };

  const handleComplete = () => {
    console.log("Tour completed!");
    setOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    console.log("Tour skipped!");
    setOpen(false);
    setCurrentStep(0);
  };

  const startTour = () => {
    setCurrentStep(0);
    setOpen(true);
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <h1 id="controlled-title" className="font-bold text-2xl">
          Controlled Tour Example
        </h1>
        <p className="text-center text-muted-foreground">
          This tour demonstrates controlled state management with external step
          tracking.
        </p>
        <div className="flex gap-2">
          <Button id="controlled-start-btn" onClick={startTour}>
            Start Controlled Tour
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={!open || currentStep === 0}
          >
            External Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
            disabled={!open || currentStep === 2}
          >
            External Next
          </Button>
        </div>
        {open && (
          <p className="text-muted-foreground text-sm">
            Current step: {currentStep + 1} / 3
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div
          id="controlled-step-1"
          className="rounded-lg border p-6 text-center"
        >
          <h3 className="font-semibold">Step 1</h3>
          <p className="text-muted-foreground text-sm">
            First step in our controlled tour
          </p>
        </div>
        <div
          id="controlled-step-2"
          className="rounded-lg border p-6 text-center"
        >
          <h3 className="font-semibold">Step 2</h3>
          <p className="text-muted-foreground text-sm">
            Second step with external controls
          </p>
        </div>
      </div>

      <Tour
        open={open}
        onOpenChange={setOpen}
        currentStep={currentStep}
        onCurrentStepChange={handleStepChange}
        onComplete={handleComplete}
        onSkip={handleSkip}
        closeOnBackdropClick={true}
      >
        <TourBackdrop />

        <TourStep target="#controlled-title" placement="bottom">
          <TourContent>
            <TourHeader>
              <TourTitle>Controlled Tour</TourTitle>
              <TourDescription>
                This tour's state is controlled externally. Notice how the step
                counter updates.
              </TourDescription>
            </TourHeader>
            <TourFooter>
              <div className="flex w-full items-center justify-between">
                <TourStepCounter />
                <div className="flex gap-2">
                  <TourSkip />
                  <TourNext />
                </div>
              </div>
            </TourFooter>
            <TourClose />
          </TourContent>
        </TourStep>

        <TourStep target="#controlled-step-1" placement="top">
          <TourContent>
            <TourHeader>
              <TourTitle>External Controls</TourTitle>
              <TourDescription>
                You can control this tour using the external buttons above, or
                use the built-in navigation.
              </TourDescription>
            </TourHeader>
            <TourFooter>
              <div className="flex w-full items-center justify-between">
                <TourStepCounter />
                <div className="flex gap-2">
                  <TourPrev />
                  <TourNext />
                </div>
              </div>
            </TourFooter>
            <TourClose />
          </TourContent>
        </TourStep>

        <TourStep target="#controlled-step-2" placement="top">
          <TourContent>
            <TourHeader>
              <TourTitle>Final Step</TourTitle>
              <TourDescription>
                This is the last step. The tour state is fully controlled by the
                parent component.
              </TourDescription>
            </TourHeader>
            <TourFooter>
              <div className="flex w-full items-center justify-between">
                <TourStepCounter />
                <div className="flex gap-2">
                  <TourPrev />
                  <TourNext />
                </div>
              </div>
            </TourFooter>
            <TourClose />
          </TourContent>
        </TourStep>
      </Tour>
    </div>
  );
}
