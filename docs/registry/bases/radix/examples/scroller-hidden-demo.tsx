import { Scroller } from "@/registry/bases/radix/ui/scroller";

export default function ScrollerHiddenDemo() {
  return (
    <Scroller className="flex h-80 w-full flex-col gap-2.5 p-4" hideScrollbar>
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className="flex h-40 flex-col rounded-md bg-accent p-4"
        >
          <div className="font-medium text-lg">Card {index + 1}</div>
          <span className="text-muted-foreground text-sm">
            Scroll smoothly without visible scrollbars
          </span>
        </div>
      ))}
    </Scroller>
  );
}
