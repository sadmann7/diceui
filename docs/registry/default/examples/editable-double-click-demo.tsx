import * as React from "react";
import { Button } from "@/components/ui/button";
import * as Editable from "@/registry/default/ui/editable";

export default function EditableDoubleClickDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Editable.Root
        defaultValue="Double click to edit"
        placeholder="Enter your text here"
        triggerMode="dblclick"
      >
        <Editable.Label>Fruit</Editable.Label>
        <Editable.Area>
          <Editable.Preview />
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
    </div>
  );
}
