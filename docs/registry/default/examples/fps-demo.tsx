import { Fps } from "@/registry/default/components/fps";

export default function FpsDemo() {
  return (
    <div className="relative h-[400px] w-full rounded-lg border bg-muted/50">
      <Fps />
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          FPS counter is displayed in the top-right corner
        </p>
      </div>
    </div>
  );
}
