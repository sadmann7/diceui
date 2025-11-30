"use client";

import { useState } from "react";
import {
  KeyValue,
  KeyValueAddButton,
  type KeyValueEntry,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemoveButton,
  KeyValueValueInput,
} from "@/registry/default/ui/key-value";

export default function KeyValueControlledDemo() {
  const [entries, setEntries] = useState<KeyValueEntry[]>([
    { id: "1", key: "NODE_ENV", value: "production" },
    { id: "2", key: "API_URL", value: "https://api.example.com" },
    { id: "3", key: "PORT", value: "3000" },
  ]);

  return (
    <div className="w-full max-w-2xl space-y-4">
      <KeyValue entries={entries} onEntriesChange={setEntries}>
        <KeyValueList>
          <KeyValueItem>
            <KeyValueKeyInput className="flex-1" />
            <KeyValueValueInput className="flex-1" />
            <KeyValueRemoveButton />
          </KeyValueItem>
        </KeyValueList>
        <KeyValueAddButton />
      </KeyValue>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="mb-2 font-medium text-sm">Current Entries:</p>
        <pre className="text-xs">
          {JSON.stringify(
            entries.map((e) => ({ [e.key]: e.value })),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}
