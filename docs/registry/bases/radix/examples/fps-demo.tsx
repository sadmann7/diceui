import { Fps } from "@/registry/bases/radix/ui/fps";

export default function FpsDemo() {
  return (
    <div className="relative h-80 w-full rounded-lg border bg-muted/50">
      <Fps strategy="absolute" position="top-right" />
      <div className="flex size-full flex-col items-center justify-center gap-1">
        <div>Absolute positioning</div>
        <div className="text-muted-foreground text-sm">
          Relative to this container without a portal
        </div>
      </div>
    </div>
  );
}
