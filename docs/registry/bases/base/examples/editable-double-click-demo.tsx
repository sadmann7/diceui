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
} from "@/registry/bases/base/ui/editable";

export default function EditableDoubleClickDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Editable
        defaultValue="Double click to edit"
        placeholder="Enter your text here"
        triggerMode="dblclick"
      >
        <EditableLabel>Fruit</EditableLabel>
        <EditableArea>
          <EditablePreview />
          <EditableInput />
        </EditableArea>
        <EditableToolbar>
          <EditableSubmit render={<Button size="sm" />}>Save</EditableSubmit>
          <EditableCancel render={<Button variant="outline" size="sm" />}>
            Cancel
          </EditableCancel>
        </EditableToolbar>
      </Editable>
    </div>
  );
}
