"use client";

import { CopyIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  KeyValue,
  KeyValueAddButton,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemoveButton,
  KeyValueValueInput,
} from "@/registry/default/ui/key-value";

export default function KeyValueCustomDemo() {
  return (
    <KeyValue
      className="w-full max-w-2xl"
      defaultEntries={[
        { id: "1", key: "DATABASE_URL", value: "postgresql://localhost:5432" },
        { id: "2", key: "REDIS_URL", value: "redis://localhost:6379" },
      ]}
      keyPlaceholder="Variable Name"
      valuePlaceholder="Variable Value"
      onAdd={(entry) => {
        toast.success(`Added new variable`);
      }}
      onRemove={(entry) => {
        toast.info(`Removed ${entry.key || "variable"}`);
      }}
      onPaste={(event, entries) => {
        toast.success(`Pasted ${entries.length} variables`);
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Environment Variables</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              toast.info("Export functionality would go here");
            }}
          >
            <CopyIcon />
            Export
          </Button>
        </div>

        <KeyValueList className="gap-3">
          <KeyValueItem className="rounded-lg border p-3">
            <div className="flex-1 space-y-2">
              <KeyValueKeyInput className="font-mono" />
              <KeyValueValueInput className="font-mono" />
            </div>
            <KeyValueRemoveButton asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </KeyValueRemoveButton>
          </KeyValueItem>
        </KeyValueList>

        <KeyValueAddButton asChild>
          <Button variant="outline" className="w-full">
            <PlusIcon />
            Add Variable
          </Button>
        </KeyValueAddButton>
      </div>
    </KeyValue>
  );
}
