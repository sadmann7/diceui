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

export default function TourDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <h1 id="welcome-title" className="font-bold text-2xl">
          Welcome to Our App
        </h1>
        <p className="text-center text-muted-foreground">
          Click the button below to start the tour and learn about our features.
        </p>
        <Button id="start-tour-btn" onClick={() => setOpen(true)}>
          Start Tour
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div id="feature-1" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Feature 1</h3>
          <p className="text-muted-foreground text-sm">
            This is our first amazing feature
          </p>
        </div>
        <div id="feature-2" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Feature 2</h3>
          <p className="text-muted-foreground text-sm">
            This is our second great feature
          </p>
        </div>
        <div id="feature-3" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Feature 3</h3>
          <p className="text-muted-foreground text-sm">
            This is our third incredible feature
          </p>
        </div>
      </div>

      <Tour
        open={open}
        onOpenChange={setOpen}
        onComplete={() => {
          console.log("Tour completed!");
        }}
        onSkip={() => {
          console.log("Tour skipped!");
        }}
      >
        <TourBackdrop />

        <TourStep target="#welcome-title" placement="bottom">
          <TourContent>
            <TourHeader>
              <TourTitle>Welcome!</TourTitle>
              <TourDescription>
                This is the main title of our application. Let's explore the
                features together.
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

        <TourStep target="#feature-1" placement="top">
          <TourContent>
            <TourHeader>
              <TourTitle>Feature 1</TourTitle>
              <TourDescription>
                This is our first feature. It provides amazing functionality
                that will help you get started.
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

        <TourStep target="#feature-2" placement="top">
          <TourContent>
            <TourHeader>
              <TourTitle>Feature 2</TourTitle>
              <TourDescription>
                Our second feature builds upon the first and adds even more
                value to your experience.
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

        <TourStep target="#feature-3" placement="top">
          <TourContent>
            <TourHeader>
              <TourTitle>Feature 3</TourTitle>
              <TourDescription>
                The final feature in our tour showcases the full potential of
                our platform.
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
