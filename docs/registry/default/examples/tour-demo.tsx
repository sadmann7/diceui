"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import * as Tour from "@/registry/default/ui/tour";

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

      <Tour.Root
        open={open}
        onOpenChange={setOpen}
        onComplete={() => {
          console.log("Tour completed!");
        }}
        onSkip={() => {
          console.log("Tour skipped!");
        }}
      >
        <Tour.Backdrop />

        <Tour.Step target="#welcome-title" placement="bottom">
          <Tour.Content>
            <Tour.Header>
              <Tour.Title>Welcome!</Tour.Title>
              <Tour.Description>
                This is the main title of our application. Let's explore the
                features together.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer>
              <div className="flex w-full items-center justify-between">
                <Tour.StepCounter />
                <div className="flex gap-2">
                  <Tour.SkipButton />
                  <Tour.NextButton />
                </div>
              </div>
            </Tour.Footer>
            <Tour.CloseButton />
          </Tour.Content>
        </Tour.Step>

        <Tour.Step target="#feature-1" placement="top">
          <Tour.Content>
            <Tour.Header>
              <Tour.Title>Feature 1</Tour.Title>
              <Tour.Description>
                This is our first feature. It provides amazing functionality
                that will help you get started.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer>
              <div className="flex w-full items-center justify-between">
                <Tour.StepCounter />
                <div className="flex gap-2">
                  <Tour.PrevButton />
                  <Tour.NextButton />
                </div>
              </div>
            </Tour.Footer>
            <Tour.CloseButton />
          </Tour.Content>
        </Tour.Step>

        <Tour.Step target="#feature-2" placement="top">
          <Tour.Content>
            <Tour.Header>
              <Tour.Title>Feature 2</Tour.Title>
              <Tour.Description>
                Our second feature builds upon the first and adds even more
                value to your experience.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer>
              <div className="flex w-full items-center justify-between">
                <Tour.StepCounter />
                <div className="flex gap-2">
                  <Tour.PrevButton />
                  <Tour.NextButton />
                </div>
              </div>
            </Tour.Footer>
            <Tour.CloseButton />
          </Tour.Content>
        </Tour.Step>

        <Tour.Step target="#feature-3" placement="top">
          <Tour.Content>
            <Tour.Header>
              <Tour.Title>Feature 3</Tour.Title>
              <Tour.Description>
                The final feature in our tour showcases the full potential of
                our platform.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer>
              <div className="flex w-full items-center justify-between">
                <Tour.StepCounter />
                <div className="flex gap-2">
                  <Tour.PrevButton />
                  <Tour.NextButton />
                </div>
              </div>
            </Tour.Footer>
            <Tour.CloseButton />
          </Tour.Content>
        </Tour.Step>
      </Tour.Root>
    </div>
  );
}
