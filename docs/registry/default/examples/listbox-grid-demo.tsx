import { ListboxItem, ListboxRoot } from "@/registry/default/ui/listbox";

export default function ListboxGridDemo() {
  return (
    <ListboxRoot orientation="mixed" className="grid w-full grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, index) => (
        <ListboxItem
          key={index}
          value={`item-${index + 1}`}
          className="flex h-24 w-full items-center justify-center rounded-md border-2 border-border bg-card p-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <div className="text-center">
            <div className="font-medium">Item {index + 1}</div>
            <div className="text-muted-foreground text-sm">
              Cell {Math.floor(index / 3) + 1}-{(index % 3) + 1}
            </div>
          </div>
        </ListboxItem>
      ))}
    </ListboxRoot>
  );
}
