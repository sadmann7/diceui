import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as Editable from "@/registry/default/ui/editable";
import * as React from "react";

export default function EditableAutosizeDemo() {
  return (
    <Editable.Root
      defaultValue="Adjust the size of the textarea with the text inside."
      autosize
    >
      <Editable.Label>Autosize Editable</Editable.Label>
      <Editable.Area>
        <Editable.Preview className="whitespace-pre-wrap" />
        <Editable.Input asChild>
          <Textarea className="max-h-[120px] min-h-[60px] w-full min-w-[240px]" />
        </Editable.Input>
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
