import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
} from "@/registry/bases/radix/ui/checkbox-group";

export default function CheckboxGroupHorizontalDemo() {
  return (
    <CheckboxGroup orientation="horizontal">
      <CheckboxGroupLabel>Tricks</CheckboxGroupLabel>
      <CheckboxGroupList>
        <CheckboxGroupItem value="indy">Indy</CheckboxGroupItem>
        <CheckboxGroupItem value="stalefish">Stalefish</CheckboxGroupItem>
        <CheckboxGroupItem value="pizza-guy">Pizza Guy</CheckboxGroupItem>
        <CheckboxGroupItem value="fs-540">FS 540</CheckboxGroupItem>
      </CheckboxGroupList>
      <CheckboxGroupDescription>Select grab tricks</CheckboxGroupDescription>
    </CheckboxGroup>
  );
}
