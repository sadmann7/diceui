"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as Tour from "@/registry/default/ui/tour";

export default function TourCustomizationDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <h1 id="custom-title" className="font-bold text-2xl">
          Customized Tour
        </h1>
        <p className="text-center text-muted-foreground">
          This tour demonstrates custom styling, placement, and behavior
          options.
        </p>
        <Button id="custom-start-btn" onClick={() => setOpen(true)}>
          Start Custom Tour
        </Button>
      </div>

      <div className="flex gap-8">
        <div id="custom-left" className="rounded-lg border p-6 text-center">
          <Badge variant="secondary">Left</Badge>
          <h3 className="mt-2 font-semibold">Left Element</h3>
          <p className="text-muted-foreground text-sm">
            Tour will appear on the right
          </p>
        </div>
        <div id="custom-center" className="rounded-lg border p-6 text-center">
          <Badge variant="default">Center</Badge>
          <h3 className="mt-2 font-semibold">Center Element</h3>
          <p className="text-muted-foreground text-sm">
            Tour will appear below
          </p>
        </div>
        <div id="custom-right" className="rounded-lg border p-6 text-center">
          <Badge variant="outline">Right</Badge>
          <h3 className="mt-2 font-semibold">Right Element</h3>
          <p className="text-muted-foreground text-sm">
            Tour will appear on the left
          </p>
        </div>
      </div>

      <Tour.Root
        open={open}
        onOpenChange={setOpen}
        padding={8}
        borderRadius={12}
        closeOnBackdropClick={true}
        closeOnEscape={true}
        scrollBehavior="smooth"
        scrollOffset={{ top: 120, bottom: 120 }}
        onComplete={() => {
          console.log("Custom tour completed!");
        }}
      >
        <Tour.Backdrop className="bg-black/70" />

        <Tour.Step target="#custom-title" placement="bottom" offset={12}>
          <Tour.Content className="w-96 border-2 border-primary/20 shadow-xl">
            <Tour.Header className="border-b pb-3">
              <Tour.Title className="text-primary">
                🎯 Custom Styling
              </Tour.Title>
              <Tour.Description className="text-base">
                This tour uses custom padding, border radius, and enhanced
                backdrop styling.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer className="pt-3">
              <div className="flex w-full items-center justify-between">
                <Tour.StepCounter
                  format={(current, total) => `Step ${current} of ${total}`}
                  className="font-medium text-primary"
                />
                <div className="flex gap-2">
                  <Tour.SkipButton asChild>
                    <Button variant="ghost" size="sm">
                      Skip All
                    </Button>
                  </Tour.SkipButton>
                  <Tour.NextButton asChild>
                    <Button size="sm">Let's Go! →</Button>
                  </Tour.NextButton>
                </div>
              </div>
            </Tour.Footer>
            <Tour.CloseButton className="text-muted-foreground hover:text-foreground" />
          </Tour.Content>
        </Tour.Step>

        <Tour.Step target="#custom-left" placement="right" offset={16}>
          <Tour.Content className="w-80 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <Tour.Header>
              <Tour.Title className="text-blue-700 dark:text-blue-300">
                Right Placement
              </Tour.Title>
              <Tour.Description>
                This step appears to the right of the target element with
                increased offset.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer>
              <Tour.Navigation>
                <div className="flex items-center gap-2">
                  <Tour.StepCounter className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex gap-2">
                  <Tour.PrevButton asChild>
                    <Button variant="outline" size="sm">
                      ← Back
                    </Button>
                  </Tour.PrevButton>
                  <Tour.NextButton asChild>
                    <Button size="sm">Continue →</Button>
                  </Tour.NextButton>
                </div>
              </Tour.Navigation>
            </Tour.Footer>
            <Tour.CloseButton />
          </Tour.Content>
        </Tour.Step>

        <Tour.Step target="#custom-center" placement="bottom-start" offset={20}>
          <Tour.Content className="w-72 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
            <Tour.Header>
              <Tour.Title className="text-green-700 dark:text-green-300">
                Bottom Start
              </Tour.Title>
              <Tour.Description>
                This step uses bottom-start placement and custom background
                gradient.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer>
              <Tour.Navigation>
                <Tour.StepCounter
                  className="text-green-600 dark:text-green-400"
                  format={(current, total) => `${current}/${total}`}
                />
                <div className="flex gap-2">
                  <Tour.PrevButton asChild>
                    <Button variant="outline" size="sm">
                      ← Back
                    </Button>
                  </Tour.PrevButton>
                  <Tour.NextButton asChild>
                    <Button size="sm">Continue →</Button>
                  </Tour.NextButton>
                </div>
              </Tour.Navigation>
            </Tour.Footer>
            <Tour.CloseButton />
          </Tour.Content>
        </Tour.Step>

        <Tour.Step target="#custom-right" placement="left" offset={16}>
          <Tour.Content className="w-80 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
            <Tour.Header>
              <Tour.Title className="text-purple-700 dark:text-purple-300">
                🎉 Tour Complete!
              </Tour.Title>
              <Tour.Description>
                You've seen various customization options including placement,
                styling, and behavior.
              </Tour.Description>
            </Tour.Header>
            <Tour.Footer>
              <Tour.Navigation>
                <Tour.StepCounter className="text-purple-600 dark:text-purple-400" />
                <div className="flex gap-2">
                  <Tour.PrevButton asChild>
                    <Button variant="outline" size="sm">
                      ← Back
                    </Button>
                  </Tour.PrevButton>
                  <Tour.NextButton asChild>
                    <Button size="sm">Finish! ✨</Button>
                  </Tour.NextButton>
                </div>
              </Tour.Navigation>
            </Tour.Footer>
            <Tour.CloseButton />
          </Tour.Content>
        </Tour.Step>
      </Tour.Root>
    </div>
  );
}
