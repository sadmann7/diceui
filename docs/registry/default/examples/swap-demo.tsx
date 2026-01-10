import { MoonIcon, SunIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { Swap, SwapOff, SwapOn } from "@/registry/default/ui/swap";

export default function SwapDemo() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-sm">Click to swap</span>
        <Swap className="size-12 rounded-lg border bg-muted/50 hover:bg-muted">
          <SwapOn>
            <SunIcon className="size-6" />
          </SwapOn>
          <SwapOff>
            <MoonIcon className="size-6" />
          </SwapOff>
        </Swap>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-sm">Hover to swap</span>
        <Swap
          activationMode="hover"
          className="size-12 rounded-lg border bg-muted/50"
        >
          <SwapOn>
            <Volume2Icon className="size-6" />
          </SwapOn>
          <SwapOff>
            <VolumeXIcon className="size-6" />
          </SwapOff>
        </Swap>
      </div>
    </div>
  );
}
