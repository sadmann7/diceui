import { Button } from "@/components/ui/button";
import {
  Editable,
  EditableArea,
  EditableCancel,
  EditableInput,
  EditableLabel,
  EditablePreview,
  EditableSubmit,
  EditableToolbar,
  EditableTrigger,
} from "@/registry/default/ui/editable";
import * as React from "react";

export default function EditableDemo() {
  return (
    <Editable defaultValue="Click to edit" placeholder="Enter your text here">
      <EditableLabel>Fruit</EditableLabel>
      <EditableArea>
        <EditablePreview />
        <EditableInput />
      </EditableArea>
      <EditableTrigger asChild>
        <Button size="sm" className="w-fit">
          Edit
        </Button>
      </EditableTrigger>
      <EditableToolbar>
        <EditableSubmit asChild>
          <Button size="sm">Save</Button>
        </EditableSubmit>
        <EditableCancel asChild>
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </EditableCancel>
      </EditableToolbar>
    </Editable>
  );
}
