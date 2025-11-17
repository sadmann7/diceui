import { Fps } from "@/registry/default/ui/fps";

export default function FpsDemo() {
  return (
    <div className="relative h-[380px] w-full rounded-lg border bg-muted/50">
      <Fps strategy="absolute" position="top-right" />
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          FPS counter is displayed in the top-right corner using absolute
          positioning
        </p>
      </div>
    </div>
  );
}
