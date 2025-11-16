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
} from "@/registry/default/ui/tour";

export default function TourDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <h1 id="welcome-title" className="font-bold text-2xl">
            Learn to Skate
          </h1>
          <p className="text-center text-muted-foreground">
            Start the tour to learn essential tricks.
          </p>
        </div>
        <Button id="start-tour-btn" onClick={() => setOpen(true)}>
          Start Tour
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div id="feature-1" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Ollie</h3>
          <p className="text-muted-foreground text-sm">
            Foundation of all tricks
          </p>
        </div>
        <div id="feature-2" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">Kickflip</h3>
          <p className="text-muted-foreground text-sm">Your first flip trick</p>
        </div>
        <div id="feature-3" className="rounded-lg border p-4 text-center">
          <h3 className="font-semibold">900</h3>
          <p className="text-muted-foreground text-sm">Two and a half spins</p>
        </div>
      </div>
      <Tour
        open={open}
        onOpenChange={setOpen}
        // onInteractOutside={(event) => {
        //   console.log("interact outside", event);
        // }}
        // onPointerDownOutside={(event) => {
        //   console.log("pointer down outside", event);
        // }}
        // onOpenAutoFocus={(event) => {
        //   console.log("open auto focus", event);
        // }}
        // onCloseAutoFocus={(event) => {
        //   console.log("close auto focus", event);
        // }}
        // onEscapeKeyDown={(event) => {
        //   console.log("escape key down", event);
        // }}
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
              <TourTitle>Welcome</TourTitle>
              <TourDescription>
                Learn the essential tricks every skater needs to know.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
          <TourStep target="#feature-1" side="top" align="center">
            <TourArrow />
            <TourHeader>
              <TourTitle>Ollie</TourTitle>
              <TourDescription>
                Pop the tail, slide your front foot up, and level out in the
                air.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
          <TourStep target="#feature-2" side="top" align="center">
            <TourArrow />
            <TourHeader>
              <TourTitle>Kickflip</TourTitle>
              <TourDescription>
                Flick your front foot off the edge to spin the board 360
                degrees.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
          <TourStep target="#feature-3" side="top" align="center" required>
            <TourArrow />
            <TourHeader>
              <TourTitle>900</TourTitle>
              <TourDescription>
                Two and a half aerial spins. This step is required.
              </TourDescription>
            </TourHeader>
            <TourClose />
          </TourStep>
        </TourPortal>
      </Tour>
    </div>
  );
}
