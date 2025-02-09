import { Button } from "@/components/ui/button";
import * as Editable from "@/registry/default/ui/editable";
import * as React from "react";

export default function EditableDemo() {
  return (
    <Editable.Root
      defaultValue="Click to edit"
      placeholder="Enter your text here"
    >
      <Editable.Label>Fruit</Editable.Label>
      <Editable.Area>
        <Editable.Preview />
        <Editable.Input />
      </Editable.Area>
      <Editable.Trigger asChild>
        <Button size="sm" className="w-fit">
          Edit
        </Button>
      </Editable.Trigger>
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
