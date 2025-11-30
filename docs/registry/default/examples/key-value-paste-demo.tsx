import { ClipboardIcon } from "lucide-react";
import {
  KeyValue,
  KeyValueAdd,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemove,
  KeyValueValueInput,
} from "@/registry/default/ui/key-value";

export default function KeyValuePasteDemo() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <ClipboardIcon className="h-4 w-4" />
          <p className="font-medium text-sm">Paste Support</p>
        </div>
        <p className="text-muted-foreground text-xs">
          Try pasting multiple lines in any of these formats:
        </p>
        <pre className="mt-2 rounded bg-background p-2 text-xs">
          {`API_KEY=sk-1234567890
            DATABASE_URL=postgresql://localhost
            PORT=3000

            or

            API_KEY: sk-1234567890
            DATABASE_URL: postgresql://localhost
            PORT: 3000`}
        </pre>
      </div>

      <KeyValue enablePaste keyPlaceholder="KEY" valuePlaceholder="value">
        <KeyValueList>
          <KeyValueItem>
            <KeyValueKeyInput className="flex-1 font-mono" />
            <KeyValueValueInput className="flex-1 font-mono" />
            <KeyValueRemove />
          </KeyValueItem>
        </KeyValueList>
        <KeyValueAdd />
      </KeyValue>
    </div>
  );
}
