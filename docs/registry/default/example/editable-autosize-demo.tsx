import { Button } from "@/components/ui/button";
import * as Editable from "@/registry/default/ui/editable";

export default function EditableAutosizeDemo() {
  return (
    <Editable.Root
      defaultValue="Adjust the size of the input with the text inside."
      autosize
    >
      <Editable.Label>Autosize editable</Editable.Label>
      <Editable.Area>
        <Editable.Preview className="whitespace-pre-wrap" />
        <Editable.Input />
      </Editable.Area>
      <Editable.Toolbar>
        <Editable.Submit asChild>
          <Button size="sm">Save</Button>
        </Editable.Submit>
        <Editable.Cancel asChild>
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </Editable.Cancel>
      </Editable.Toolbar>
    </Editable.Root>
  );
}
