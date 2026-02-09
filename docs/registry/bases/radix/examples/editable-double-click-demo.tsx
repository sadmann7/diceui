import * as React from "react";
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
} from "@/registry/bases/radix/ui/editable";

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
    </div>
  );
}
