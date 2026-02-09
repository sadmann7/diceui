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
} from "@/registry/bases/radix/ui/tour";

export default function TourControlledDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(0);

  const onStepChange = React.useCallback((step: number) => {
    setValue(step);
  }, []);

  const onComplete = React.useCallback(() => {
    setOpen(false);
    setValue(0);
  }, []);

  const onSkip = React.useCallback(() => {
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
          Controlled Tour
        </h1>
        <div className="flex items-center gap-2">
          <Button id="controlled-start-btn" onClick={onTourStart}>
            Start
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue(Math.max(0, value - 1))}
            disabled={!open || value === 0}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue(Math.min(3, value + 1))}
            disabled={!open || value === 3}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="flex w-full flex-col gap-6">
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
        {open && value >= 2 && (
          <div
            id="controlled-step-3"
            className="fade-in slide-in-from-bottom-4 animate-in rounded-lg border border-primary/50 bg-primary/5 p-6 text-center duration-300"
          >
            <h3 className="font-semibold">Step 3</h3>
            <p className="text-muted-foreground text-sm">
              Dynamic step that appears after step 2
            </p>
          </div>
        )}
      </div>
      <Tour
        open={open}
        onOpenChange={setOpen}
        value={value}
        onValueChange={onStepChange}
        onComplete={onComplete}
        onSkip={onSkip}
        stepFooter={
          <TourFooter>
            <div className="flex w-full items-center justify-between">
              <TourStepCounter />
              <div className="flex gap-2">
                <TourPrev />
                <TourNext />
              </div>
            </div>
          </TourFooter>
        }
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
          <TourClose />
        </TourStep>
        <TourStep target="#controlled-step-2" side="top" align="center">
          <TourArrow />
          <TourHeader>
            <TourTitle>Second Feature</TourTitle>
            <TourDescription>
              The tour state is fully controlled by the parent component. Watch
              what happens next!
            </TourDescription>
          </TourHeader>
          <TourClose />
        </TourStep>
        <TourStep target="#controlled-step-3" side="top" align="center">
          <TourArrow />
          <TourHeader>
            <TourTitle>Dynamic Layout</TourTitle>
            <TourDescription>
              This element appeared when you reached this step, demonstrating
              how the tour handles dynamic content and layout shifts.
            </TourDescription>
          </TourHeader>
          <TourClose />
        </TourStep>
      </Tour>
    </div>
  );
}
