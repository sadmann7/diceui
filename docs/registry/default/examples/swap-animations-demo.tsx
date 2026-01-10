import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SunIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from "lucide-react";
import { Swap, SwapOff, SwapOn } from "@/registry/default/ui/swap";

export default function SwapAnimationsDemo() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="fade"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <CheckIcon className="size-5" />
          </SwapOn>
          <SwapOff>
            <XIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">Fade</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="rotate"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <SunIcon className="size-5" />
          </SwapOn>
          <SwapOff>
            <MoonIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">
          Rotate
        </span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="flip"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <PlayIcon className="size-5" />
          </SwapOn>
          <SwapOff>
            <PauseIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">Flip</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="scale"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <Volume2Icon className="size-5" />
          </SwapOn>
          <SwapOff>
            <VolumeXIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">Scale</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="slide-up"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <ChevronUpIcon className="size-5" />
          </SwapOn>
          <SwapOff>
            <ChevronDownIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">
          Slide Up
        </span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="slide-down"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <ChevronDownIcon className="size-5" />
          </SwapOn>
          <SwapOff>
            <ChevronUpIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">
          Slide Down
        </span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="slide-left"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <ChevronLeftIcon className="size-5" />
          </SwapOn>
          <SwapOff>
            <ChevronRightIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">
          Slide Left
        </span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Swap
          animation="slide-right"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <ChevronRightIcon className="size-5" />
          </SwapOn>
          <SwapOff>
            <ChevronLeftIcon className="size-5" />
          </SwapOff>
        </Swap>
        <span className="text-center text-muted-foreground text-sm">
          Slide Right
        </span>
      </div>
    </div>
  );
}
