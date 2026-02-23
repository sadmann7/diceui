import * as React from "react";
import { Button } from "@/registry/bases/base/ui/button";
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
} from "@/registry/bases/base/ui/editable";

export default function EditableDemo() {
  return (
    <Editable defaultValue="Click to edit" placeholder="Enter your text here">
      <EditableLabel>Fruit</EditableLabel>
      <EditableArea>
        <EditablePreview />
        <EditableInput />
      </EditableArea>
      <EditableTrigger render={<Button size="sm" className="w-fit" />}>
        Edit
      </EditableTrigger>
      <EditableToolbar>
        <EditableSubmit render={<Button size="sm" />}>Save</EditableSubmit>
        <EditableCancel render={<Button variant="outline" size="sm" />}>
          Cancel
        </EditableCancel>
      </EditableToolbar>
    </Editable>
  );
}
