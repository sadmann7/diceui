import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@/registry/default/ui/listbox";

const tricks = [
  { label: "Kickflip", description: "Flip the board 360° along its long axis" },
  {
    label: "Heelflip",
    description:
      "Flip the board 360° along its long axis in the opposite direction of a kickflip",
  },
  {
    label: "360 Varial McTwist",
    description: "A 540° inverted aerial with a 360° board rotation",
  },
  {
    label: "The 900",
    description: "Legendary 900° aerial rotation pioneered by Tony Hawk",
  },
];

export default function ListboxGridDemo() {
  return (
    <Listbox orientation="mixed" className="grid w-full grid-cols-3 gap-4">
      {tricks.map((trick) => (
        <ListboxItem
          key={trick.label}
          value={trick.label}
          className="items-start"
        >
          <div className="flex flex-col gap-1">
            <div className="font-medium">{trick.label}</div>
            <div className="text-muted-foreground text-sm">
              {trick.description}
            </div>
          </div>
          <ListboxItemIndicator />
        </ListboxItem>
      ))}
    </Listbox>
  );
}
