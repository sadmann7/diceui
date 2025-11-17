"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tour,
  TourArrow,
  TourClose,
  TourDescription,
  TourFooter,
  TourHeader,
  TourNext,
  TourPrev,
  TourSkip,
  TourSpotlight,
  TourSpotlightRing,
  TourStep,
  TourStepCounter,
  TourTitle,
} from "@/registry/default/ui/tour";

export default function TourControlledDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(0);

  const onStepChange = React.useCallback((step: number) => {
    setValue(step);
    console.log(`Step changed to: ${step + 1}`);
  }, []);

  const onComplete = React.useCallback(() => {
    console.log("Tour completed!");
    setOpen(false);
    setValue(0);
  }, []);

  const onSkip = React.useCallback(() => {
    console.log("Tour skipped!");
    setOpen(false);
    setValue(0);
  }, []);

  const onTourStart = React.useCallback(() => {
    setValue(0);
    setOpen(true);
  }, []);

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
          <Button id="controlled-start-btn" onClick={onTourStart}>
            Start Controlled Tour
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue(Math.max(0, value - 1))}
            disabled={!open || value === 0}
          >
            External Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue(Math.min(2, value + 1))}
            disabled={!open || value === 2}
          >
            External Next
          </Button>
        </div>
        {open && (
          <p className="text-muted-foreground text-sm">
            Current step: {value + 1} / 3
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
        value={value}
        onValueChange={onStepChange}
        onComplete={onComplete}
        onSkip={onSkip}
      >
        <TourSpotlight />
        <TourSpotlightRing />
        <TourStep target="#controlled-title" side="bottom" align="center">
          <TourArrow />
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
        </TourStep>
        <TourStep target="#controlled-step-1" side="top" align="center">
          <TourArrow />
          <TourHeader>
            <TourTitle>External Controls</TourTitle>
            <TourDescription>
              You can control this tour using the external buttons above, or use
              the built-in navigation.
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
        </TourStep>
        <TourStep target="#controlled-step-2" side="top" align="center">
          <TourArrow />
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
        </TourStep>
      </Tour>
    </div>
  );
}
