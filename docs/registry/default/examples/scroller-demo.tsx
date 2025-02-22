import { Scroller } from "@/registry/default/ui/scroller";

export function ScrollerDemo() {
  return (
    <Scroller
      className="h-[400px] rounded-md border border-border p-4"
      hideScrollbar
    >
      {Array.from({ length: 100 }).map((_, index) => (
        <div key={index} className="h-10 w-full bg-accent">
          {index}
        </div>
      ))}
    </Scroller>
  );
}
