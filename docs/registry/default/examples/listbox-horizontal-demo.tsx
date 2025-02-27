import { Listbox, ListboxItem } from "@/registry/default/ui/listbox";

export default function SelectableHorizontalDemo() {
  return (
    <Listbox orientation="horizontal" className="flex w-full flex-row gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <ListboxItem
          key={index}
          value={`option-${index + 1}`}
          className="flex h-32 flex-1 flex-col items-center justify-center rounded-md border-2 border-border bg-card p-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <div className="font-medium">Option {index + 1}</div>
          <div className="text-muted-foreground text-sm">Horizontal Item</div>
        </ListboxItem>
      ))}
    </Listbox>
  );
}
