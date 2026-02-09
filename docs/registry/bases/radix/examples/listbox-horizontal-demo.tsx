import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@/registry/bases/radix/ui/listbox";

const tricks = [
  { label: "Kickflip", description: "Flip the board 360° along its long axis" },
  {
    label: "Heelflip",
    description:
      "Flip the board 360° along its long axis in the opposite direction of a kickflip",
  },
  {
    label: "The 900",
    description: "Legendary 900° aerial rotation pioneered by Tony Hawk",
  },
];

export default function ListboxHorizontalDemo() {
  return (
    <Listbox orientation="horizontal" className="flex w-full flex-row gap-4">
      {tricks.map((trick) => (
        <ListboxItem key={trick.label} value={trick.label}>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="font-medium">{trick.label}</div>
              <ListboxItemIndicator />
            </div>
            <div className="line-clamp-2 text-muted-foreground text-sm">
              {trick.description}
            </div>
          </div>
        </ListboxItem>
      ))}
    </Listbox>
  );
}
