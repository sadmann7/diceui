"use client";

import { X } from "lucide-react";
import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import CompareSliderControlledDemo from "@/registry/default/examples/compare-slider-controlled-demo";
import CompareSliderCustomizationDemo from "@/registry/default/examples/compare-slider-customization-demo";
import CompareSliderDemo from "@/registry/default/examples/compare-slider-demo";
import CompareSliderVerticalDemo from "@/registry/default/examples/compare-slider-vertical-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";
import TourDemo from "@/registry/default/examples/tour-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <Dialog modal={false}>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(event) => {
              console.log("interact outside", event);
            }}
            onPointerDownOutside={(event) => {
              console.log("pointer down outside", event);
            }}
            onOpenAutoFocus={(event) => {
              console.log("open auto focus", event);
            }}
            onCloseAutoFocus={(event) => {
              console.log("close auto focus", event);
            }}
            onEscapeKeyDown={(event) => {
              console.log("escape key down", event);
            }}
          >
            <DialogHeader>
              <DialogTitle>Tour</DialogTitle>
              <DialogDescription>
                Learn the essential tricks every skater needs to know.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Open alert dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            onOpenAutoFocus={(event) => {
              console.log("open auto focus", event);
            }}
            onCloseAutoFocus={(event) => {
              console.log("close auto focus", event);
            }}
            onEscapeKeyDown={(event) => {
              console.log("escape key down", event);
            }}
          >
            <AlertDialogCancel className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
              <X />
            </AlertDialogCancel>
            <AlertDialogHeader>
              <AlertDialogTitle>Alert Dialog</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              This is an alert dialog.
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
        <TourDemo />
        <CompareSliderDemo />
        <CompareSliderCustomizationDemo />
        <CompareSliderControlledDemo />
        <CompareSliderVerticalDemo />
        <ScrollSpyDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
