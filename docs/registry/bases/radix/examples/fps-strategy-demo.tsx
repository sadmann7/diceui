import { Fps } from "@/registry/bases/radix/ui/fps";

export default function FpsStrategyDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative h-48 w-full rounded-lg border bg-muted/50 p-4">
        <Fps strategy="absolute" position="top-right" label="Absolute" />
        <div className="flex size-full flex-col items-center justify-center gap-1">
          <div>Absolute positioning</div>
          <div className="text-muted-foreground text-sm">
            Relative to this container without a portal
          </div>
        </div>
      </div>
      <div className="relative h-48 w-full rounded-lg border bg-muted/50 p-4">
        <Fps strategy="fixed" position="bottom-right" label="Fixed" />
        <div className="flex size-full flex-col items-center justify-center gap-1">
          <div>Fixed positioning</div>
          <div className="text-muted-foreground text-sm">
            Relative to viewport with a portal
          </div>
        </div>
      </div>
    </div>
  );
}
