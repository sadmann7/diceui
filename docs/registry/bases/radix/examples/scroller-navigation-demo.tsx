import { Scroller } from "@/registry/bases/radix/ui/scroller";

export default function ScrollerNavigationDemo() {
  return (
    <Scroller
      hideScrollbar
      withNavigation
      scrollTriggerMode="press"
      className="flex h-80 w-full flex-col gap-2.5 p-4"
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex flex-col rounded-md bg-accent p-4">
          <div className="text-lg font-medium">Card {index + 1}</div>
          <span className="text-sm text-muted-foreground">
            Use the navigation arrows to scroll
          </span>
        </div>
      ))}
    </Scroller>
  );
}
