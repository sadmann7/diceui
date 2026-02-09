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

export default function EditableAutosizeDemo() {
  return (
    <Editable
      defaultValue="Adjust the size of the input with the text inside."
      autosize
    >
      <EditableLabel>Autosize editable</EditableLabel>
      <EditableArea>
        <EditablePreview className="whitespace-pre-wrap" />
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
  );
}
