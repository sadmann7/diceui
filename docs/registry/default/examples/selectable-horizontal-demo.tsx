import { Selectable, SelectableItem } from "@/registry/default/ui/selectable";

export default function SelectableHorizontalDemo() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-medium text-lg">Horizontal Navigation Demo</h3>
      <p className="text-muted-foreground text-sm">
        Use left/right arrow keys to navigate through the list horizontally.
      </p>
      <Selectable
        orientation="horizontal"
        className="flex w-full flex-row gap-4"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <SelectableItem
            key={index}
            value={`option-${index + 1}`}
            className="flex h-32 flex-1 flex-col items-center justify-center rounded-md border-2 border-border bg-card p-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <div className="font-medium">Option {index + 1}</div>
            <div className="text-muted-foreground text-sm">Horizontal Item</div>
          </SelectableItem>
        ))}
      </Selectable>
    </div>
  );
}
