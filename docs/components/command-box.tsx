import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { tricks } from "@/lib/data";

export function CommandBox() {
  return (
    <Command className="max-w-[15rem] border">
      <CommandInput placeholder="Search tricks..." />
      <CommandEmpty>No tricks found.</CommandEmpty>
      <CommandList>
        <CommandGroup heading="Tricks">
          {tricks.map((trick) => (
            <CommandItem key={trick.value} value={trick.value}>
              {trick.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
