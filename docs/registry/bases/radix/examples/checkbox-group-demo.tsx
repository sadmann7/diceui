import {
  CheckboxGroup,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
} from "@/registry/bases/radix/ui/checkbox-group";

const tricks = [
  { label: "Kickflip", value: "kickflip" },
  { label: "Heelflip", value: "heelflip" },
  { label: "Tre Flip", value: "tre-flip" },
  { label: "540 Flip", value: "540-flip" },
];

export default function CheckboxGroupDemo() {
  return (
    <CheckboxGroup>
      <CheckboxGroupLabel>Select your favorite tricks</CheckboxGroupLabel>
      <CheckboxGroupList>
        {tricks.map((trick) => (
          <CheckboxGroupItem key={trick.value} value={trick.value}>
            {trick.label}
          </CheckboxGroupItem>
        ))}
      </CheckboxGroupList>
    </CheckboxGroup>
  );
}
