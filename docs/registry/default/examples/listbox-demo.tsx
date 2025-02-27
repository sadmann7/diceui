import { Listbox, ListboxItem } from "@/registry/default/ui/listbox";

export default function ListboxDemo() {
  return (
    <Listbox className="w-full max-w-md">
      {Array.from({ length: 5 }).map((_, index) => (
        <ListboxItem
          key={index}
          value={`option-${index + 1}`}
          className="flex items-center rounded-md p-4 transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
        >
          <div className="flex flex-col">
            <div className="font-medium">Option {index + 1}</div>
            <div className="text-muted-foreground text-sm">
              Description for option {index + 1}
            </div>
          </div>
        </ListboxItem>
      ))}
    </Listbox>
  );
}
