import { ClipboardIcon } from "lucide-react";
import {
  KeyValue,
  KeyValueAdd,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemove,
  KeyValueValueInput,
} from "@/registry/bases/radix/ui/key-value";

export default function KeyValuePasteDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <ClipboardIcon className="size-4" />
          <p className="font-medium text-sm">Paste Support</p>
        </div>
        <p className="text-muted-foreground text-xs">
          Try pasting multiple lines in any of these formats:
        </p>
        <pre className="rounded bg-background p-2 text-xs">
          {`API_KEY=sk-1234567890
            DATABASE_URL=postgresql://localhost
            PORT=3000`}
        </pre>
      </div>
      <KeyValue keyPlaceholder="KEY" valuePlaceholder="value">
        <KeyValueList>
          <KeyValueItem>
            <KeyValueKeyInput className="font-mono" />
            <KeyValueValueInput className="font-mono" />
            <KeyValueRemove />
          </KeyValueItem>
        </KeyValueList>
        <KeyValueAdd />
      </KeyValue>
    </div>
  );
}
