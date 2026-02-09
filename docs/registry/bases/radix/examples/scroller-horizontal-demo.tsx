import { Scroller } from "@/registry/bases/radix/ui/scroller";

export default function ScrollerHorizontalDemo() {
  return (
    <Scroller orientation="horizontal" className="w-full p-4" asChild>
      <div className="flex items-center gap-2.5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="flex h-32 w-[180px] shrink-0 flex-col items-center justify-center rounded-md bg-accent p-4"
          >
            <div className="font-medium text-lg">Card {index + 1}</div>
            <span className="text-muted-foreground text-sm">
              Scroll horizontally
            </span>
          </div>
        ))}
      </div>
    </Scroller>
  );
}
