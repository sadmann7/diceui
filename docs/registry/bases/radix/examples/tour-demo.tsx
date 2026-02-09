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
  TourPortal,
  TourPrev,
  TourSpotlight,
  TourSpotlightRing,
  TourStep,
  TourStepCounter,
  TourTitle,
} from "@/registry/bases/radix/ui/tour";

export default function TourDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <h1 id="welcome-title" className="font-bold text-2xl">
            Welcome to Your Dashboard
          </h1>
          <p className="text-center text-muted-foreground">
            Take a quick tour to explore key features
          </p>
        </div>
        <Button id="start-tour-btn" onClick={() => setOpen(true)}>
          Start Tour
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div id="feature-1" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Analytics</h3>
          <p className="text-muted-foreground text-sm">
            Track your performance metrics
          </p>
        </div>
        <div id="feature-2" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Projects</h3>
          <p className="text-muted-foreground text-sm">
            Manage your active projects
          </p>
        </div>
        <div id="feature-3" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Team</h3>
          <p className="text-muted-foreground text-sm">
            Collaborate with teammates
          </p>
        </div>
      </div>
      <Tour
        open={open}
        onOpenChange={setOpen}
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
        <TourPortal>
          <TourSpotlight />
          <TourSpotlightRing />
          <TourStep target="#welcome-title" side="bottom" align="center">
            <TourHeader>
              <TourTitle>Welcome!</TourTitle>
              <TourDescription>
                Let's walk through the main features of your dashboard in just a
                few steps.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
          <TourStep target="#feature-1" side="top" align="center">
            <TourArrow />
            <TourHeader>
              <TourTitle>Analytics Dashboard</TourTitle>
              <TourDescription>
                View real-time insights, track KPIs, and monitor your team's
                progress with interactive charts.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
          <TourStep target="#feature-2" side="top" align="center">
            <TourArrow />
            <TourHeader>
              <TourTitle>Project Management</TourTitle>
              <TourDescription>
                Create, organize, and track projects with powerful tools for
                task management and deadlines.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
          <TourStep target="#feature-3" side="top" align="center" required>
            <TourArrow />
            <TourHeader>
              <TourTitle>Team Collaboration</TourTitle>
              <TourDescription>
                Invite members, assign roles, and collaborate seamlessly. This
                step is required to continue.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
        </TourPortal>
      </Tour>
    </div>
  );
}
